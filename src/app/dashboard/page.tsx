'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { logout, getAuthHeaders } from '@/lib/auth-client'
import { useToast } from '@/lib/toast-store'
import {
  Plus, Calendar, MapPin, Clock, DollarSign, CreditCard, Building2, Coins, X,
  User, Mail, Phone, Upload, Save, Wallet, FileText, CheckCircle, Eye, EyeOff
} from 'lucide-react'
import { format } from 'date-fns'

interface Booking {
  id: string
  createdAt: string
  bookingType: 'transport' | 'experience'
  status: string
  fromLocation: string | null
  toLocation: string | null
  scheduledDate: string
  scheduledTime: string
  totalPrice: number
  paymentStatus: string
  experience: {
    name: string
    location: string
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
    proof_image: null as File | null,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
          totalPrice: b.total_price,
          paymentStatus: b.payment_status,
          experience: b.experience || b.experiences,
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
        proof_image: null,
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
    const confirmPayment = confirm(`Confirm payment of $${amount} for this flight?\n\nThis will:\n• Process payment from your account balance\n• Confirm your booking\n• Final booking confirmation will be sent`)

    if (!confirmPayment) return

    // Check if user has sufficient balance
    if (!profile?.accountBalance || profile.accountBalance < amount) {
      const topUpConfirm = confirm(`Insufficient balance. Current balance: $${profile?.accountBalance?.toFixed(2) || '0.00'}\n\nWould you like to top up your account first?`)
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
      toast.error('Payment failed: ' + error.message)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleBankDepositPayment = async (bookingId: string, amount: number, proofFile: File | null) => {
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
          reference: `Booking payment - ${bookingId}`
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
      toast.error('Bank deposit failed: ' + error.message)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-luxury-black text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold">FlyInGuate</span>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              Balance: <span className="font-bold text-luxury-gold">${profile?.accountBalance?.toFixed(2) || '0.00'}</span>
            </div>
            <LanguageSwitcher />
            {profile?.role === 'admin' && (
              <Link href="/admin" className="text-sm hover:text-luxury-gold transition-colors">
                Admin Panel
              </Link>
            )}
            <Link href="/dashboard" className="text-sm hover:text-luxury-gold transition-colors">
              {profile?.fullName || profile?.email}
            </Link>
            <button
              onClick={async () => {
                await logout()
                window.location.href = '/'
              }}
              className="text-sm hover:text-luxury-gold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 rounded font-medium ${
              activeTab === 'bookings'
                ? 'bg-white text-primary-700 border-b-2 border-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded font-medium ${
              activeTab === 'profile'
                ? 'bg-white text-primary-700 border-b-2 border-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Profile & Settings
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 rounded font-medium ${
              activeTab === 'payments'
                ? 'bg-white text-primary-700 border-b-2 border-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Payments & Top-up
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'bookings' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
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
                <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="card-luxury text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
                <p className="text-gray-500">Start your journey by booking a flight or experience</p>
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

                        <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                            {format(new Date(booking.scheduledDate), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-primary-600" />
                            {booking.scheduledTime}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-primary-600" />
                            {booking.bookingType === 'transport'
                              ? 'Direct Transport'
                              : booking.experience?.location
                            }
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-primary-600" />
                            ${booking.totalPrice}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col space-y-2">
                        {booking.status === 'pending' && (
                          <button className="text-red-600 hover:text-red-700 text-sm px-3 py-1 border border-red-300 rounded hover:bg-red-50">
                            Cancel
                          </button>
                        )}

                        {(booking.status === 'approved' || booking.status === 'assigned') && booking.paymentStatus !== 'paid' && (
                          <>
                            <button
                              onClick={() => openPaymentModal(booking)}
                              className="bg-green-600 text-white text-sm px-4 py-2 rounded hover:bg-green-700 flex items-center"
                            >
                              Choose Payment
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                              {booking.status === 'approved' ? 'Flight approved!' : 'Flight Assigned!'}
                              <br/>Ready for payment
                            </p>
                          </>
                        )}

                        {booking.status === 'assigned' && booking.paymentStatus === 'paid' && (
                          <div className="bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-xs text-green-800 font-medium text-center">
                              Ready to Fly!
                            </p>
                            <p className="text-xs text-green-600 text-center">
                              All confirmed
                            </p>
                          </div>
                        )}

                        {booking.status === 'completed' && (
                          <div className="bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-xs text-green-800 font-medium text-center">
                              Completed
                            </p>
                            <button className="text-xs text-green-600 hover:text-green-700 underline">
                              Leave Review
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile & Settings</h1>
            
            {profileError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {profileError}
              </div>
            )}
            
            {profileSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="card-luxury space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {t('profile.email')}
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  {t('profile.fullName')}
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  {t('profile.phone')}
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+502 1234 5678"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
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
              <h1 className="text-3xl font-bold text-gray-900">Payments & Top-up</h1>
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
                <Wallet className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Account Balance</h3>
                <p className="text-3xl font-bold text-primary-900">
                  ${profile?.accountBalance?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            <div className="card-luxury">
              <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
              {paymentProofs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-4">
                  {paymentProofs.map((proof) => (
                    <div key={proof.id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">
                          {proof.type === 'deposit' ? 'Top-up' : 'Payment'} - ${Math.abs(proof.amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(proof.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                        <p className="text-sm text-gray-600">{proof.reference || ''}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        proof.status === 'approved' || proof.status === 'completed' ? 'bg-green-100 text-green-800' :
                        proof.status === 'rejected' || proof.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
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
          onPayBankDeposit={(proofFile) => handleBankDepositPayment(selectedBooking.id, selectedBooking.totalPrice, proofFile)}
          onPayCreditCard={handleCreditCardPayment}
          onPayCrypto={handleCryptoPayment}
          loading={paymentLoading}
          profile={profile}
        />
      )}

      {/* Top-up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Top Up Balance</h2>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={topUpData.amount}
                  onChange={(e) => setTopUpData({...topUpData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Reference
                </label>
                <input
                  type="text"
                  value={topUpData.reference}
                  onChange={(e) => setTopUpData({...topUpData, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Transaction ID or reference"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Proof
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setTopUpData({...topUpData, proof_image: e.target.files?.[0] || null})}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Bank Transfer Details</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Account Name:</strong> FlyInGuate S.A.</p>
                  <p><strong>Account Number:</strong> 1234567890</p>
                  <p><strong>Bank:</strong> Banco Industrial</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
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
  onPayBankDeposit: (proofFile: File | null) => void
  onPayCreditCard: () => void
  onPayCrypto: () => void
  loading: boolean
  profile: any
}) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'balance' | 'bank'>('balance')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const toast = useToast()

  const handleBankDepositSubmit = () => {
    if (!proofFile) {
      toast.warning('Please upload payment proof before submitting.')
      return
    }
    onPayBankDeposit(proofFile)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded p-6 max-w-md w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Choose Payment Method</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold text-gray-900">
            {booking.bookingType === 'transport'
              ? `${booking.fromLocation} → ${booking.toLocation}`
              : booking.experience?.name
            }
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
          </p>
          <p className="text-xl font-bold text-primary-900 mt-2">
            ${booking.totalPrice}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {/* Account Balance */}
          <button
            onClick={() => setSelectedPaymentMethod('balance')}
            className={`w-full p-4 rounded border-2 transition-colors ${
              selectedPaymentMethod === 'balance'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 text-primary-600 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Account Balance</div>
                <div className="text-sm text-gray-600">
                  Current: ${profile?.accountBalance?.toFixed(2) || '0.00'}
                  {(!profile?.accountBalance || profile.accountBalance < booking.totalPrice) && (
                    <span className="text-red-600 ml-1">(Insufficient)</span>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Bank Deposit */}
          <button
            onClick={() => setSelectedPaymentMethod('bank')}
            className={`w-full p-4 rounded border-2 transition-colors ${
              selectedPaymentMethod === 'bank'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Building2 className="w-6 h-6 text-blue-600 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Bank Deposit</div>
                <div className="text-sm text-gray-600">Transfer to our account</div>
              </div>
            </div>
          </button>

        </div>

        {/* Coming Soon Payment Methods - Collapsible */}
        <details className="mb-4">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 py-2">
            More payment options coming soon...
          </summary>
          <div className="mt-2 space-y-2 opacity-60">
            <div className="p-3 rounded border border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-600">Credit Card</div>
                  <div className="text-xs text-gray-400">Coming Soon</div>
                </div>
              </div>
            </div>
            <div className="p-3 rounded border border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <Coins className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-600">Cryptocurrency</div>
                  <div className="text-xs text-gray-400">USDC, USDT via StablePay - Coming Soon</div>
                </div>
              </div>
            </div>
          </div>
        </details>

        {/* Bank Deposit Details */}
        {selectedPaymentMethod === 'bank' && (
          <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Bank Transfer Instructions</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Account Name:</strong> FlyInGuate S.A.</p>
              <p><strong>Account Number:</strong> 1234567890</p>
              <p><strong>Bank:</strong> Banco Industrial</p>
              <p><strong>Amount:</strong> ${booking.totalPrice}</p>
              <p><strong>Reference:</strong> Booking {booking.id.slice(0, 8)}</p>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Upload Payment Proof
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
              />
              {proofFile && (
                <p className="text-xs text-green-600 mt-1">{proofFile.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Payment Button */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
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
            disabled={loading || (selectedPaymentMethod === 'balance' && (!profile?.accountBalance || profile.accountBalance < booking.totalPrice))}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' :
             selectedPaymentMethod === 'balance' ? 'Pay Now' : 'Submit Proof'
            }
          </button>
        </div>
      </div>
    </div>
  )
}