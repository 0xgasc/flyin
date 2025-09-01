'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/auth-store'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { 
  Plane, Plus, Calendar, MapPin, Clock, DollarSign, CreditCard, Building2, Coins, X,
  User, Mail, Phone, Upload, Save, Wallet, FileText, CheckCircle, Eye, EyeOff
} from 'lucide-react'
import { format } from 'date-fns'

interface Booking {
  id: string
  created_at: string
  booking_type: 'transport' | 'experience'
  status: string
  from_location: string | null
  to_location: string | null
  scheduled_date: string
  scheduled_time: string
  total_price: number
  payment_status: string
  experiences: {
    name: string
    location: string
  } | null
}

interface PaymentProof {
  id: string
  created_at: string
  user_id: string
  type: string
  amount: number
  payment_method: string
  reference: string
  proof_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  processed_at: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const { profile, user, setProfile, loading: authLoading } = useAuthStore()
  const { t, locale } = useTranslation()
  
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
    full_name: profile?.full_name || '',
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
        full_name: profile.full_name || '',
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
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          experiences (
            name,
            location
          )
        `)
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false })

      if (data) setBookings(data)
      if (error) console.error('Error fetching bookings:', error)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setBookingsLoading(false)
    }
  }

  const fetchPaymentProofs = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id)
        .in('type', ['deposit', 'payment'])
        .order('created_at', { ascending: false })

      if (error) throw error
      setPaymentProofs(data || [])
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
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
        })
        .eq('id', profile.id)

      if (error) throw error

      // Update local profile state
      setProfile({ 
        ...profile, 
        full_name: profileData.full_name, 
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
      let proofImageUrl = ''
      
      // Upload proof image if provided
      if (topUpData.proof_image) {
        const fileExt = topUpData.proof_image.name.split('.').pop()
        const fileName = `${profile.id}/${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, topUpData.proof_image)

        if (uploadError) {
          throw new Error('Failed to upload payment proof. Please try again.')
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName)
        
        proofImageUrl = publicUrl
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: profile.id,
          type: 'deposit',
          amount: parseFloat(topUpData.amount),
          payment_method: topUpData.payment_method,
          reference: topUpData.reference,
          proof_url: proofImageUrl,
          status: 'pending'
        })
      
      if (transactionError) throw transactionError

      alert(locale === 'es' 
        ? '¡Solicitud de recarga enviada! Te contactaremos pronto con la confirmación.' 
        : 'Top-up request submitted! We will contact you soon with confirmation.'
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
    if (!profile?.account_balance || profile.account_balance < amount) {
      const topUpConfirm = confirm(`Insufficient balance. Current balance: $${profile?.account_balance?.toFixed(2) || '0.00'}\n\nWould you like to top up your account first?`)
      if (topUpConfirm) {
        setActiveTab('payments')
        setShowTopUpModal(true)
      }
      return
    }
    
    setPaymentLoading(true)
    try {
      // Update booking payment status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', bookingId)
      
      if (bookingError) throw bookingError
      
      // Deduct from user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          account_balance: (profile.account_balance || 0) - amount 
        })
        .eq('id', profile.id)
      
      if (balanceError) throw balanceError
      
      // Create payment transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: profile.id,
          type: 'payment',
          amount: -amount,
          payment_method: 'account_balance',
          status: 'completed',
          reference: `Flight payment - Booking ${bookingId}`
        })
      
      if (transactionError) console.warn('Transaction record failed:', transactionError)
      
      alert(`Payment successful! $${amount} deducted from your account.\n\nYour flight is now confirmed and you'll receive final details soon.`)
      
      // Refresh data
      fetchBookings()
      fetchPaymentProofs()
      setShowPaymentModal(false)
      
    } catch (error: any) {
      console.error('Payment error:', error)
      alert('Payment failed: ' + error.message)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleBankDepositPayment = async (bookingId: string, amount: number, proofFile: File | null) => {
    setPaymentLoading(true)
    try {
      let proofUrl = ''
      
      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop()
        const fileName = `booking-payments/${bookingId}/${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, proofFile)
        
        if (uploadError) {
          throw new Error('Failed to upload payment proof. Please try again.')
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName)
        
        proofUrl = publicUrl
      }

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: profile.id,
          type: 'deposit',
          amount: amount,
          payment_method: 'bank_deposit',
          status: 'pending',
          reference: `Booking payment - ${bookingId}`,
          proof_url: proofUrl,
          metadata: { booking_id: bookingId }
        })
      
      if (transactionError) throw transactionError

      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ payment_status: 'processing' })
        .eq('id', bookingId)
      
      if (bookingError) console.warn('Booking update failed:', bookingError)

      alert(`Bank deposit initiated!\n\nYour payment is being processed. You'll receive confirmation within 24 hours.`)
      
      fetchBookings()
      fetchPaymentProofs()
      setShowPaymentModal(false)
      
    } catch (error: any) {
      console.error('Bank deposit error:', error)
      alert('Bank deposit failed: ' + error.message)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleCreditCardPayment = () => {
    alert('Credit Card payment coming soon! Please use Bank Deposit or Account Balance for now.')
  }

  const handleCryptoPayment = () => {
    alert('Crypto payment coming soon! We\'ll be integrating stablecoin payments via StablePay.')
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
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Plane className="h-8 w-8 text-luxury-gold" />
            <span className="text-2xl font-bold">FlyInGuate</span>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              Balance: <span className="font-bold text-luxury-gold">${profile?.account_balance?.toFixed(2) || '0.00'}</span>
            </div>
            <LanguageSwitcher />
            {profile?.role === 'admin' && (
              <Link href="/admin" className="text-sm hover:text-luxury-gold transition-colors">
                Admin Panel
              </Link>
            )}
            <Link href="/dashboard" className="text-sm hover:text-luxury-gold transition-colors">
              {profile?.full_name || profile?.email}
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
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
            className={`px-6 py-3 rounded-t-lg font-medium ${
              activeTab === 'bookings'
                ? 'bg-white text-primary-700 border-b-2 border-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-t-lg font-medium ${
              activeTab === 'profile'
                ? 'bg-white text-primary-700 border-b-2 border-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Profile & Settings
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 rounded-t-lg font-medium ${
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
                <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
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
                            {booking.booking_type === 'transport' 
                              ? `${booking.from_location} → ${booking.to_location}`
                              : booking.experiences?.name
                            }
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                            {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-primary-600" />
                            {booking.scheduled_time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-primary-600" />
                            {booking.booking_type === 'transport' 
                              ? 'Direct Transport'
                              : booking.experiences?.location
                            }
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-primary-600" />
                            ${booking.total_price}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col space-y-2">
                        {booking.status === 'pending' && (
                          <button className="text-red-600 hover:text-red-700 text-sm px-3 py-1 border border-red-300 rounded hover:bg-red-50">
                            ✗ Cancel
                          </button>
                        )}
                        
                        {(booking.status === 'approved' || booking.status === 'assigned') && booking.payment_status !== 'paid' && (
                          <>
                            <button 
                              onClick={() => openPaymentModal(booking)}
                              className="bg-green-600 text-white text-sm px-4 py-2 rounded hover:bg-green-700 flex items-center"
                            >
                              💳 Choose Payment
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                              {booking.status === 'approved' ? 'Flight approved!' : '✈️ Flight Assigned!'}
                              <br/>Ready for payment
                            </p>
                          </>
                        )}
                        
                        {booking.status === 'assigned' && booking.payment_status === 'paid' && (
                          <div className="bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-xs text-green-800 font-medium text-center">
                              ✈️ Ready to Fly!
                            </p>
                            <p className="text-xs text-green-600 text-center">
                              All confirmed
                            </p>
                          </div>
                        )}
                        
                        {booking.status === 'completed' && (
                          <div className="bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-xs text-green-800 font-medium text-center">
                              ✓ Completed
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
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
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+502 1234 5678"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
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
                  ${profile?.account_balance?.toFixed(2) || '0.00'}
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
                    <div key={proof.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {proof.type === 'deposit' ? 'Top-up' : 'Payment'} - ${Math.abs(proof.amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(proof.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                        <p className="text-sm text-gray-600">{proof.reference}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        proof.status === 'approved' ? 'bg-green-100 text-green-800' :
                        proof.status === 'rejected' ? 'bg-red-100 text-red-800' :
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
          onPayAccountBalance={() => handlePayBooking(selectedBooking.id, selectedBooking.total_price)}
          onPayBankDeposit={(proofFile) => handleBankDepositPayment(selectedBooking.id, selectedBooking.total_price, proofFile)}
          onPayCreditCard={handleCreditCardPayment}
          onPayCrypto={handleCryptoPayment}
          loading={paymentLoading}
          profile={profile}
        />
      )}

      {/* Top-up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-screen overflow-y-auto">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
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
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'balance' | 'bank' | 'card' | 'crypto'>('balance')
  const [proofFile, setProofFile] = useState<File | null>(null)
  
  const handleBankDepositSubmit = () => {
    if (!proofFile) {
      alert('Please upload payment proof before submitting.')
      return
    }
    onPayBankDeposit(proofFile)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-screen overflow-y-auto">
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

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900">
            {booking.booking_type === 'transport' 
              ? `${booking.from_location} → ${booking.to_location}`
              : booking.experiences?.name
            }
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time}
          </p>
          <p className="text-xl font-bold text-primary-900 mt-2">
            ${booking.total_price}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {/* Account Balance */}
          <button
            onClick={() => setSelectedPaymentMethod('balance')}
            className={`w-full p-4 rounded-lg border-2 transition-colors ${
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
                  Current: ${profile?.account_balance?.toFixed(2) || '0.00'}
                  {(!profile?.account_balance || profile.account_balance < booking.total_price) && (
                    <span className="text-red-600 ml-1">(Insufficient)</span>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Bank Deposit */}
          <button
            onClick={() => setSelectedPaymentMethod('bank')}
            className={`w-full p-4 rounded-lg border-2 transition-colors ${
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

          {/* Credit Card */}
          <button
            onClick={() => setSelectedPaymentMethod('card')}
            className={`w-full p-4 rounded-lg border-2 transition-colors ${
              selectedPaymentMethod === 'card'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <CreditCard className="w-6 h-6 text-green-600 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Credit Card</div>
                <div className="text-sm text-gray-600">Coming Soon</div>
              </div>
            </div>
          </button>

          {/* Crypto */}
          <button
            onClick={() => setSelectedPaymentMethod('crypto')}
            className={`w-full p-4 rounded-lg border-2 transition-colors ${
              selectedPaymentMethod === 'crypto'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Coins className="w-6 h-6 text-orange-600 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Cryptocurrency</div>
                <div className="text-sm text-gray-600">USDC, USDT via StablePay</div>
              </div>
            </div>
          </button>
        </div>

        {/* Bank Deposit Details */}
        {selectedPaymentMethod === 'bank' && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Bank Transfer Instructions</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Account Name:</strong> FlyInGuate S.A.</p>
              <p><strong>Account Number:</strong> 1234567890</p>
              <p><strong>Bank:</strong> Banco Industrial</p>
              <p><strong>Amount:</strong> ${booking.total_price}</p>
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
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
              />
              {proofFile && (
                <p className="text-xs text-green-600 mt-1">✓ {proofFile.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Payment Button */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={() => {
              switch (selectedPaymentMethod) {
                case 'balance':
                  onPayAccountBalance()
                  break
                case 'bank':
                  handleBankDepositSubmit()
                  break
                case 'card':
                  onPayCreditCard()
                  break
                case 'crypto':
                  onPayCrypto()
                  break
              }
            }}
            disabled={loading || (selectedPaymentMethod === 'balance' && (!profile?.account_balance || profile.account_balance < booking.total_price))}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 
             selectedPaymentMethod === 'balance' ? 'Pay Now' :
             selectedPaymentMethod === 'bank' ? 'Submit Proof' :
             selectedPaymentMethod === 'card' ? 'Coming Soon' :
             'Coming Soon'
            }
          </button>
        </div>
      </div>
    </div>
  )
}