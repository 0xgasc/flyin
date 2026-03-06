'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { useTranslation } from '@/lib/i18n'
import { MobileNav } from '@/components/mobile-nav'
import { getAuthHeaders } from '@/lib/auth-client'
import { useToast } from '@/lib/toast-store'
import {
  Plus, Calendar, MapPin, Clock, DollarSign, CreditCard, Building2, Coins, X,
  User, Mail, Phone, Save, Wallet, FileText, CheckCircle, Eye, EyeOff, MessageCircle,
  Plane, Globe, AlertTriangle, Upload, Copy
} from 'lucide-react'
import { format } from 'date-fns'
import { WhatsAppContactButton } from '@/components/whatsapp-contact-button'

interface Booking {
  id: string
  createdAt: string
  bookingType: 'transport' | 'experience'
  status: string
  fromLocation: string | null
  toLocation: string | null
  scheduledDate: string
  scheduledTime: string
  passengerCount: number
  totalPrice: number
  paymentStatus: string
  experience: {
    name: string
    location: string
  } | null
  revisionRequested?: boolean
  revisionNotes?: string | null
  priceBreakdown?: {
    base_price?: number
    passengers?: number
    per_person?: number
    distance?: number
    flight_time?: number
    passenger_fee?: number
    multiplier?: number
    is_round_trip?: boolean
    addon_total?: number
  } | null
}

interface PaymentProof {
  id: string
  createdAt: string
  userId: string
  type: string
  amount: number
  paymentMethod: string
  reference: string | null
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed'
}

export default function DashboardPage() {
  const router = useRouter()
  const { profile, user, setProfile, loading: authLoading } = useAuthStore()
  const { t, locale } = useTranslation()
  const toast = useToast()

  // Tab management
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'payments'>('bookings')
  const [expandedPriceIds, setExpandedPriceIds] = useState<Set<string>>(new Set())
  
  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  
  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: profile?.fullName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  
  // Top-up state
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([])
  const [topUpData, setTopUpData] = useState({
    amount: '',
    payment_method: 'bank_transfer',
    reference: '',
  })

  // Auth timeout to prevent infinite spinning
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (authLoading && !profile) {
        console.warn('⏰ Auth timeout after 10 seconds, redirecting to login')
        router.push('/login')
      }
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [authLoading, profile, router])

  // Auth guard
  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/login')
    }
  }, [authLoading, profile, router])

  // Update profile data when profile changes
  useEffect(() => {
    if (profile) {
      setProfileData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      })
    }
  }, [profile])

  // Fetch data when profile loads
  useEffect(() => {
    if (profile?.id) {
      if (activeTab === 'bookings') {
        fetchBookings()
      } else if (activeTab === 'payments') {
        fetchPaymentProofs()
      }
    }
  }, [profile, activeTab])

  // Show loading while auth is loading
  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner-lg mx-auto mb-4 text-gold-500"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const fetchBookings = async () => {
    setBookingsLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      const json = await res.json()
      if (json.success && json.bookings) {
        // Transform snake_case API response to camelCase for frontend
        const transformed = json.bookings.map((b: any) => ({
          id: b.id,
          createdAt: b.created_at,
          bookingType: b.booking_type,
          status: b.status,
          fromLocation: b.from_location,
          toLocation: b.to_location,
          scheduledDate: b.scheduled_date,
          scheduledTime: b.scheduled_time,
          passengerCount: b.passenger_count || 1,
          totalPrice: b.total_price,
          paymentStatus: b.payment_status,
          experience: b.experience || b.experiences,
          revisionRequested: b.revision_requested || false,
          revisionNotes: b.revision_notes || null,
          priceBreakdown: b.price_breakdown || null,
        }))
        setBookings(transformed)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setBookingsLoading(false)
    }
  }

  const fetchPaymentProofs = async () => {
    try {
      const res = await fetch('/api/transactions', {
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      const json = await res.json()
      if (json.success && json.transactions) {
        setPaymentProofs(json.transactions)
      }
    } catch (error) {
      console.error('Error fetching payment proofs:', error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName: profileData.fullName,
          phone: profileData.phone,
        })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update profile')

      // Update local profile state
      setProfile({
        ...profile,
        fullName: profileData.fullName,
        phone: profileData.phone
      })

      setProfileSuccess(locale === 'es' ? 'Perfil actualizado correctamente' : 'Profile updated successfully')
    } catch (error: any) {
      setProfileError(error.message || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')

    try {
      // Create transaction record via API
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'deposit',
          amount: parseFloat(topUpData.amount),
          paymentMethod: topUpData.payment_method,
          reference: topUpData.reference,
        })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to submit top-up request')

      toast.success(locale === 'es'
        ? '¡Solicitud de recarga enviada! Te contactaremos pronto.'
        : 'Top-up request submitted! We will contact you soon.'
      )

      // Reset form
      setTopUpData({
        amount: '',
        payment_method: 'bank_transfer',
        reference: '',
      })
      setShowTopUpModal(false)
      fetchPaymentProofs()

    } catch (error: any) {
      setProfileError(error.message || 'Failed to submit top-up request')
    } finally {
      setProfileLoading(false)
    }
  }

  // Payment functions (same as existing dashboard)
  const openPaymentModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowPaymentModal(true)
  }

  const handlePayBooking = async (bookingId: string, amount: number) => {
    const confirmPayment = confirm(locale === 'es'
      ? `¿Confirmar pago de $${amount} por este vuelo?\n\nEsto:\n• Procesará el pago desde tu saldo\n• Confirmará tu reserva\n• Se enviará confirmación final`
      : `Confirm payment of $${amount} for this flight?\n\nThis will:\n• Process payment from your account balance\n• Confirm your booking\n• Final booking confirmation will be sent`)

    if (!confirmPayment) return

    // Check if user has sufficient balance
    if (!profile?.accountBalance || profile.accountBalance < amount) {
      const topUpConfirm = confirm(locale === 'es'
        ? `Saldo insuficiente. Saldo actual: $${profile?.accountBalance?.toFixed(2) || '0.00'}\n\n¿Deseas recargar tu cuenta primero?`
        : `Insufficient balance. Current balance: $${profile?.accountBalance?.toFixed(2) || '0.00'}\n\nWould you like to top up your account first?`)
      if (topUpConfirm) {
        setActiveTab('payments')
        setShowTopUpModal(true)
      }
      return
    }

    setPaymentLoading(true)
    try {
      // Pay booking via API
      const res = await fetch(`/api/bookings/${bookingId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentMethod: 'account_balance'
        })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Payment failed')

      // Update local profile balance
      setProfile({
        ...profile,
        accountBalance: (profile.accountBalance || 0) - amount
      })

      toast.success(`Payment successful! $${amount} deducted. Your flight is confirmed.`)

      // Refresh data
      fetchBookings()
      fetchPaymentProofs()
      setShowPaymentModal(false)

    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(locale === 'es' ? 'Pago fallido: ' + error.message : 'Payment failed: ' + error.message)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleBankDepositPayment = async (bookingId: string, amount: number, proofFile: File | null, reference?: string) => {
    setPaymentLoading(true)
    try {
      // Create transaction and update booking via API
      const res = await fetch(`/api/bookings/${bookingId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentMethod: 'bank_transfer',
          reference: reference || `Booking payment - ${bookingId}`
        })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Bank deposit failed')

      toast.success('Bank deposit initiated! You\'ll receive confirmation within 24 hours.')

      fetchBookings()
      fetchPaymentProofs()
      setShowPaymentModal(false)

    } catch (error: any) {
      console.error('Bank deposit error:', error)
      toast.error(locale === 'es' ? 'Depósito fallido: ' + error.message : 'Bank deposit failed: ' + error.message)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleCreditCardPayment = () => {
    toast.info('Credit Card payment coming soon! Please use Bank Deposit or Account Balance for now.')
  }

  const handleCryptoPayment = () => {
    toast.info('Crypto payment coming soon! Stablecoin payments via StablePay.')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'assigned': return 'bg-purple-100 text-purple-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const cancelBooking = async (bookingId: string) => {
    if (!confirm(locale === 'es' ? '¿Cancelar esta reserva? Esta acción no se puede deshacer.' : 'Cancel this booking? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'cancelled' })
      })
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b))
        toast.success(locale === 'es' ? 'Reserva cancelada.' : 'Booking cancelled.')
      } else {
        const d = await res.json()
        toast.error(d.error || (locale === 'es' ? 'No se pudo cancelar la reserva.' : 'Could not cancel booking.'))
      }
    } catch {
      toast.error(locale === 'es' ? 'No se pudo cancelar la reserva.' : 'Could not cancel booking.')
    }
  }

  return (
    <div className="min-h-screen bg-luxury-black">
      <MobileNav />

      <div className="container mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 rounded-t-soft font-medium transition-colors ${
              activeTab === 'bookings'
                ? 'bg-white dark:bg-luxury-charcoal text-primary-700 dark:text-gold-400 border-b-2 border-primary-600 dark:border-gold-500'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-t-soft font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-luxury-charcoal text-primary-700 dark:text-gold-400 border-b-2 border-primary-600 dark:border-gold-500'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Profile & Settings
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 rounded-t-soft font-medium transition-colors ${
              activeTab === 'payments'
                ? 'bg-white dark:bg-luxury-charcoal text-primary-700 dark:text-gold-400 border-b-2 border-primary-600 dark:border-gold-500'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Payments & Top-up
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'bookings' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">My Bookings</h1>
              <div className="space-x-4">
                <Link href="/book/transport" className="btn-primary inline-flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Book Transport
                </Link>
                <Link href="/book/experiences" className="btn-luxury inline-flex items-center text-sm">
                  <Plus className="h-5 w-5 mr-2" />
                  Book Experience
                </Link>
              </div>
            </div>

            {bookingsLoading ? (
              <div className="text-center py-12">
                <div className="loading-spinner-lg mx-auto text-primary-600 dark:text-gold-500"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="card-luxury text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-50 dark:bg-gold-500/10 mb-4">
                  <Plane className="h-10 w-10 text-primary-600 dark:text-gold-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {locale === 'es' ? '¡Tu primer vuelo te espera!' : 'Your first flight awaits!'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  {locale === 'es' ? 'Explora Guatemala desde las alturas.' : 'Explore Guatemala from above.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-sm mx-auto">
                  <Link href="/book/transport" className="flex-1 btn-primary text-center py-3 flex items-center justify-center gap-2">
                    <Plane className="h-4 w-4" />
                    {locale === 'es' ? 'Reservar Transporte' : 'Book Transport'}
                  </Link>
                  <Link href="/book/experiences" className="flex-1 btn-ghost text-center py-3 flex items-center justify-center gap-2">
                    <Globe className="h-4 w-4" />
                    {locale === 'es' ? 'Ver Experiencias' : 'Explore Experiences'}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="card-luxury">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="text-xl font-semibold">
                            {booking.bookingType === 'transport'
                              ? `${booking.fromLocation} → ${booking.toLocation}`
                              : booking.experience?.name
                            }
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-primary-600 dark:text-gold-500" />
                            {format(new Date(booking.scheduledDate), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-primary-600 dark:text-gold-500" />
                            {booking.scheduledTime}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-primary-600 dark:text-gold-500" />
                            {booking.bookingType === 'transport'
                              ? 'Direct Transport'
                              : booking.experience?.location
                            }
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-primary-600 dark:text-gold-500" />
                            <button
                              onClick={() => setExpandedPriceIds(prev => {
                                const next = new Set(prev)
                                next.has(booking.id) ? next.delete(booking.id) : next.add(booking.id)
                                return next
                              })}
                              className="text-left hover:text-primary-700 dark:hover:text-gold-400"
                            >
                              ${booking.totalPrice.toLocaleString()}
                              {booking.priceBreakdown && <span className="ml-1 text-xs opacity-60">{expandedPriceIds.has(booking.id) ? '▲' : '▼'}</span>}
                            </button>
                          </div>
                        </div>
                        {/* Price breakdown */}
                        {booking.priceBreakdown && expandedPriceIds.has(booking.id) && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-soft border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {booking.priceBreakdown.base_price !== undefined && (
                              <div className="flex justify-between">
                                <span>{locale === 'es' ? 'Precio base' : 'Base price'}</span>
                                <span>${booking.priceBreakdown.base_price.toLocaleString()}</span>
                              </div>
                            )}
                            {booking.priceBreakdown.per_person !== undefined && booking.priceBreakdown.passengers && (
                              <div className="flex justify-between">
                                <span>{locale === 'es' ? 'Pasajeros' : 'Passengers'} ×{booking.priceBreakdown.passengers}</span>
                                <span>${booking.priceBreakdown.per_person}/pax</span>
                              </div>
                            )}
                            {booking.priceBreakdown.passenger_fee !== undefined && booking.priceBreakdown.passenger_fee > 0 && (
                              <div className="flex justify-between">
                                <span>{locale === 'es' ? 'Tarifa por pasajero' : 'Passenger fee'}</span>
                                <span>+${booking.priceBreakdown.passenger_fee.toLocaleString()}</span>
                              </div>
                            )}
                            {booking.priceBreakdown.distance !== undefined && (
                              <div className="flex justify-between">
                                <span>{locale === 'es' ? 'Distancia' : 'Distance'}</span>
                                <span>{booking.priceBreakdown.distance} km</span>
                              </div>
                            )}
                            {booking.priceBreakdown.multiplier && booking.priceBreakdown.multiplier !== 1 && (
                              <div className="flex justify-between">
                                <span>{locale === 'es' ? 'Multiplicador' : 'Rate multiplier'}</span>
                                <span>×{booking.priceBreakdown.multiplier}</span>
                              </div>
                            )}
                            {booking.priceBreakdown.addon_total !== undefined && booking.priceBreakdown.addon_total > 0 && (
                              <div className="flex justify-between">
                                <span>{locale === 'es' ? 'Extras' : 'Add-ons'}</span>
                                <span>+${booking.priceBreakdown.addon_total.toLocaleString()}</span>
                              </div>
                            )}
                            {booking.priceBreakdown.is_round_trip && (
                              <div className="text-center text-primary-600 dark:text-gold-500 font-medium pt-1">
                                {locale === 'es' ? 'Vuelo de ida y vuelta' : 'Round trip'}
                              </div>
                            )}
                            <div className="flex justify-between font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-1 mt-1">
                              <span>Total</span>
                              <span>${booking.totalPrice.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-col space-y-2">
                        {booking.status !== 'completed' && (
                          <WhatsAppContactButton
                            booking={{
                              id: booking.id,
                              type: booking.bookingType,
                              experienceName: booking.experience?.name,
                              fromLocation: booking.fromLocation || undefined,
                              toLocation: booking.toLocation || undefined,
                              scheduledDate: booking.scheduledDate,
                              scheduledTime: booking.scheduledTime,
                              passengerCount: booking.passengerCount,
                              totalPrice: booking.totalPrice,
                              status: booking.status
                            }}
                            variant="icon"
                          />
                        )}
                        {booking.revisionRequested && (
                          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-soft">
                            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                              {locale === 'es' ? 'El administrador solicitó un cambio:' : 'Admin requested a change:'}
                            </p>
                            {booking.revisionNotes && (
                              <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">{booking.revisionNotes}</p>
                            )}
                            <button
                              onClick={() => {
                                const ref = booking.id.slice(-6).toUpperCase()
                                const msg = encodeURIComponent(
                                  locale === 'es'
                                    ? `Hola FlyInGuate! Tengo una pregunta sobre la revisión solicitada para mi reserva #${ref}.`
                                    : `Hi FlyInGuate! I have a question about the revision requested for booking #${ref}.`
                                )
                                window.open(`https://wa.me/50255507700?text=${msg}`, '_blank', 'noopener,noreferrer')
                              }}
                              className="text-xs text-amber-700 dark:text-amber-400 underline hover:text-amber-900"
                            >
                              {locale === 'es' ? 'Contactar por WhatsApp →' : 'Contact via WhatsApp →'}
                            </button>
                          </div>
                        )}

                        {booking.status === 'pending' && (
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 text-sm px-3 py-1 border border-red-300 dark:border-red-700 rounded-soft hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            {locale === 'es' ? 'Cancelar' : 'Cancel'}
                          </button>
                        )}

                        {(booking.status === 'approved' || booking.status === 'assigned') && booking.paymentStatus !== 'paid' && (
                          <>
                            <button
                              onClick={() => openPaymentModal(booking)}
                              className="bg-green-600 text-white text-sm px-4 py-2 rounded-soft hover:bg-green-700 flex items-center"
                            >
                              Choose Payment
                            </button>
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                              {booking.status === 'approved' ? 'Flight approved!' : 'Flight Assigned!'}
                              <br/>Ready for payment
                            </p>
                          </>
                        )}

                        {booking.status === 'assigned' && booking.paymentStatus === 'paid' && (
                          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-soft p-2">
                            <p className="text-xs text-green-800 dark:text-green-400 font-medium text-center">
                              Ready to Fly!
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-500 text-center">
                              All confirmed
                            </p>
                          </div>
                        )}

                        {booking.status === 'completed' && (
                          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-soft p-2">
                            <p className="text-xs text-green-800 dark:text-green-400 font-medium text-center">
                              Completed
                            </p>
                            <button
                              onClick={() => {
                                const ref = booking.id.slice(-6).toUpperCase()
                                const msg = encodeURIComponent(
                                  locale === 'es'
                                    ? `Hola FlyInGuate! Quisiera dejar un comentario sobre mi vuelo #${ref}. `
                                    : `Hi FlyInGuate! I'd like to leave feedback about my flight #${ref}. `
                                )
                                window.open(`https://wa.me/50255507700?text=${msg}`, '_blank', 'noopener,noreferrer')
                              }}
                              className="text-xs text-green-600 dark:text-green-500 hover:text-green-700 underline flex items-center gap-1 mx-auto"
                            >
                              <MessageCircle className="h-3 w-3" />
                              {locale === 'es' ? 'Dejar comentario' : 'Leave feedback'}
                            </button>
                          </div>
                        )}

                        {booking.status === 'cancelled' && booking.paymentStatus === 'paid' && (
                          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-soft p-2">
                            <p className="text-xs text-orange-800 dark:text-orange-300 font-medium text-center mb-1">
                              {locale === 'es' ? 'Reserva cancelada' : 'Booking cancelled'}
                            </p>
                            <button
                              onClick={() => {
                                const ref = booking.id.slice(-6).toUpperCase()
                                const msg = encodeURIComponent(
                                  locale === 'es'
                                    ? `Hola FlyInGuate! Quisiera solicitar el reembolso de mi reserva #${ref} por $${booking.totalPrice}. Ya fue pagada.`
                                    : `Hi FlyInGuate! I'd like to request a refund for booking #${ref} ($${booking.totalPrice}). Payment was already made.`
                                )
                                window.open(`https://wa.me/50255507700?text=${msg}`, '_blank', 'noopener,noreferrer')
                              }}
                              className="text-xs text-orange-700 dark:text-orange-400 underline hover:text-orange-900 flex items-center gap-1 mx-auto"
                            >
                              <MessageCircle className="h-3 w-3" />
                              {locale === 'es' ? 'Solicitar reembolso →' : 'Request refund →'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-8">Profile & Settings</h1>

            {profileError && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-soft mb-6">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-soft mb-6">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="card-luxury space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {t('profile.email')}
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-soft bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  {t('profile.fullName')}
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-soft bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  {t('profile.phone')}
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-soft bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-500 focus:border-transparent"
                  placeholder="+502 1234 5678"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {profileLoading ? t('common.loading') : t('profile.update')}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Payments & Top-up</h1>
              <button
                onClick={() => setShowTopUpModal(true)}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Top Up Balance
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="card-luxury text-center">
                <Wallet className="h-12 w-12 text-primary-600 dark:text-gold-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Account Balance</h3>
                <p className="text-3xl font-bold text-primary-900 dark:text-gold-400">
                  ${profile?.accountBalance?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            <div className="card-luxury">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>
              {paymentProofs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-4">
                  {paymentProofs.map((proof) => (
                    <div key={proof.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-soft">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {proof.type === 'deposit' ? 'Top-up' : 'Payment'} - ${Math.abs(proof.amount)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(proof.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{proof.reference || ''}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        proof.status === 'approved' || proof.status === 'completed' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400' :
                        proof.status === 'rejected' || proof.status === 'failed' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400' :
                        'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400'
                      }`}>
                        {proof.status.charAt(0).toUpperCase() + proof.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal (same as before) */}
      {showPaymentModal && selectedBooking && (
        <PaymentModal 
          booking={selectedBooking}
          onClose={() => setShowPaymentModal(false)}
          onPayAccountBalance={() => handlePayBooking(selectedBooking.id, selectedBooking.totalPrice)}
          onPayBankDeposit={(proofFile, reference) => handleBankDepositPayment(selectedBooking.id, selectedBooking.totalPrice, proofFile, reference)}
          onPayCreditCard={handleCreditCardPayment}
          onPayCrypto={handleCryptoPayment}
          loading={paymentLoading}
          profile={profile}
        />
      )}

      {/* Top-up Modal */}
      {showTopUpModal && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Top Up Balance</h2>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={topUpData.amount}
                  onChange={(e) => setTopUpData({...topUpData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-soft bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Reference
                </label>
                <input
                  type="text"
                  value={topUpData.reference}
                  onChange={(e) => setTopUpData({...topUpData, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-soft bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-500 focus:border-transparent"
                  placeholder="Transaction ID or reference"
                  required
                />
              </div>

              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-soft">
                <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-2 flex items-start gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  {locale === 'es'
                    ? 'Después de transferir, envíanos el comprobante por WhatsApp para agilizar la aprobación:'
                    : 'After transferring, send your payment proof via WhatsApp for faster approval:'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const amt = topUpData.amount ? `$${topUpData.amount}` : ''
                    const ref = topUpData.reference ? ` (ref: ${topUpData.reference})` : ''
                    const msg = encodeURIComponent(
                      locale === 'es'
                        ? `Hola FlyInGuate! Acabo de hacer una transferencia de ${amt}${ref} para recargar mi cuenta. Adjunto el comprobante.`
                        : `Hi FlyInGuate! I just made a bank transfer of ${amt}${ref} to top up my account. Sending proof of payment.`
                    )
                    window.open(`https://wa.me/50255507700?text=${msg}`, '_blank', 'noopener,noreferrer')
                  }}
                  className="flex items-center gap-2 text-xs px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-soft font-medium transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {locale === 'es' ? 'Enviar comprobante por WhatsApp' : 'Send proof via WhatsApp'}
                </button>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-soft border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  {locale === 'es' ? 'Transferencia Bancaria' : 'Bank Transfer'}
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
                  {locale === 'es'
                    ? 'Contáctanos por WhatsApp para recibir nuestros datos bancarios actualizados de forma segura.'
                    : 'Contact us via WhatsApp to receive our current bank account details securely.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const msg = encodeURIComponent(locale === 'es'
                      ? 'Hola FlyInGuate! Necesito los datos bancarios para hacer una transferencia.'
                      : 'Hi FlyInGuate! I need your bank account details to make a transfer.')
                    window.open(`https://wa.me/50255507700?text=${msg}`, '_blank', 'noopener,noreferrer')
                  }}
                  className="flex items-center gap-2 text-xs px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-soft font-medium transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {locale === 'es' ? 'Obtener datos bancarios' : 'Get bank details'}
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="flex-1 btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 btn-primary"
                >
                  {profileLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Payment Modal Component (same as before but with profile prop)
function PaymentModal({ 
  booking, 
  onClose, 
  onPayAccountBalance, 
  onPayBankDeposit, 
  onPayCreditCard, 
  onPayCrypto,
  loading,
  profile
}: {
  booking: Booking
  onClose: () => void
  onPayAccountBalance: () => void
  onPayBankDeposit: (proofFile: File | null, reference: string) => void
  onPayCreditCard: () => void
  onPayCrypto: () => void
  loading: boolean
  profile: any
}) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'balance' | 'bank'>('balance')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [bankReference, setBankReference] = useState('')
  const toast = useToast()

  const handleBankDepositSubmit = () => {
    if (!bankReference.trim()) {
      toast.warning('Please enter the bank confirmation / reference number.')
      return
    }
    onPayBankDeposit(proofFile, bankReference.trim())
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Choose Payment Method</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-soft">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {booking.bookingType === 'transport'
              ? `${booking.fromLocation} → ${booking.toLocation}`
              : booking.experience?.name
            }
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
          </p>
          <p className="text-xl font-bold text-primary-900 dark:text-gold-400 mt-2">
            ${booking.totalPrice}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {/* Account Balance */}
          <button
            onClick={() => setSelectedPaymentMethod('balance')}
            className={`w-full p-4 rounded-soft border-2 transition-colors ${
              selectedPaymentMethod === 'balance'
                ? 'border-primary-500 dark:border-gold-500 bg-primary-50 dark:bg-gold-500/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 text-primary-600 dark:text-gold-500 mr-3" />
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">Account Balance</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Current: ${profile?.accountBalance?.toFixed(2) || '0.00'}
                  {(!profile?.accountBalance || profile.accountBalance < booking.totalPrice) && (
                    <span className="text-red-600 dark:text-red-400 ml-1">(Insufficient)</span>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Bank Deposit */}
          <button
            onClick={() => setSelectedPaymentMethod('bank')}
            className={`w-full p-4 rounded-soft border-2 transition-colors ${
              selectedPaymentMethod === 'bank'
                ? 'border-primary-500 dark:border-gold-500 bg-primary-50 dark:bg-gold-500/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">Bank Deposit</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Transfer to our account</div>
              </div>
            </div>
          </button>

        </div>

        {/* Bank Deposit Details */}
        {selectedPaymentMethod === 'bank' && (
          <div className="mb-6 space-y-4">
            {/* Bank Account Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-soft border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Bank Account Details</h4>
              <div className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
                <div className="flex justify-between items-center">
                  <span><strong>Bank:</strong> Banco Industrial</span>
                </div>
                <div className="flex justify-between items-center">
                  <span><strong>Account Name:</strong> FlyInGuate S.A.</span>
                </div>
                <div className="flex justify-between items-center">
                  <span><strong>Account #:</strong> 001-123456-7</span>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText('001-123456-7'); toast.success('Account number copied!') }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span><strong>Type:</strong> Monetaria (USD)</span>
                </div>
                <div className="border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
                  <p><strong>Amount to deposit:</strong> <span className="text-lg font-bold">${booking.totalPrice}</span></p>
                  <p><strong>Reference:</strong> Booking {booking.id.slice(0, 8)}</p>
                </div>
              </div>
            </div>

            {/* Bank Reference / Confirmation ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bank Confirmation / Reference # *
              </label>
              <input
                type="text"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-soft bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., TRX-20250305-12345"
                required
              />
            </div>

            {/* Proof Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Proof of Payment (optional)
              </label>
              <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-soft cursor-pointer hover:border-primary-400 dark:hover:border-gold-500 transition-colors bg-white dark:bg-gray-800">
                <Upload className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {proofFile ? proofFile.name : 'Click to upload screenshot or PDF'}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setProofFile(file)
                  }}
                />
              </label>
              {proofFile && (
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{(proofFile.size / 1024).toFixed(0)} KB</span>
                  <button type="button" onClick={() => setProofFile(null)} className="text-red-500 hover:text-red-700">Remove</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Button */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 btn-ghost"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (selectedPaymentMethod === 'balance') {
                onPayAccountBalance()
              } else if (selectedPaymentMethod === 'bank') {
                handleBankDepositSubmit()
              }
            }}
            disabled={loading || (selectedPaymentMethod === 'balance' && (!profile?.accountBalance || profile.accountBalance < booking.totalPrice)) || (selectedPaymentMethod === 'bank' && !bankReference.trim())}
            className="flex-1 btn-primary"
          >
            {loading ? 'Processing...' :
             selectedPaymentMethod === 'balance' ? 'Pay Now' : 'Confirm Deposit'
            }
          </button>
        </div>
      </div>
    </div>
  )
}