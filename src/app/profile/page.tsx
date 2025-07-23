'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/auth-store'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { 
  User, Mail, Phone, CreditCard, Upload, Eye, EyeOff, 
  Save, Wallet, Plus, FileText, CheckCircle, Clock, X 
} from 'lucide-react'

interface PaymentProof {
  id: string
  created_at: string
  user_id: string
  amount: number
  payment_method: string
  reference: string
  proof_image_url: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  processed_at: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const { profile, user, setProfile } = useAuthStore()
  const { t, locale } = useTranslation()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([])
  
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
  })

  const [topUpData, setTopUpData] = useState({
    amount: '',
    payment_method: 'bank_transfer',
    reference: '',
    proof_image: null as File | null,
  })

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      })
      fetchPaymentProofs()
    }
  }, [profile])

  const fetchPaymentProofs = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile?.id)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPaymentProofs(data || [])
    } catch (error) {
      console.error('Error fetching payment proofs:', error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
        })
        .eq('id', profile?.id)

      if (error) throw error

      // Update local profile state
      if (profile) {
        setProfile({ 
          ...profile, 
          full_name: profileData.full_name, 
          phone: profileData.phone 
        })
      }

      setSuccess(locale === 'es' ? 'Perfil actualizado correctamente' : 'Profile updated successfully')
    } catch (error: any) {
      setError(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Debug authentication
    const { data: session } = await supabase.auth.getSession()
    console.log('Current session:', session)
    console.log('Profile from state:', profile)
    
    if (!session?.session?.user) {
      setError('Authentication error. Please log in again.')
      setLoading(false)
      return
    }

    try {
      let proofImageUrl = ''
      
      // Upload proof image if provided
      if (topUpData.proof_image) {
        const fileExt = topUpData.proof_image.name.split('.').pop()
        const fileName = `${profile?.id}/${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, topUpData.proof_image)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          // Check if it's a bucket not found error
          if (uploadError.message?.includes('bucket') || uploadError.message?.includes('404')) {
            throw new Error('Payment proof storage is not configured. Please contact support.')
          }
          throw new Error('Failed to upload payment proof. Please try again.')
        }
        
        const { data: urlData } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName)
        
        proofImageUrl = urlData.publicUrl
      }

      // Create pending transaction record
      console.log('Creating transaction with data:', {
        user_id: profile?.id,
        type: 'deposit',
        amount: parseFloat(topUpData.amount),
        payment_method: topUpData.payment_method,
        status: 'pending',
        reference: proofImageUrl ? `${topUpData.reference}|${proofImageUrl}` : topUpData.reference,
      })
      
      console.log('Payment method value:', topUpData.payment_method)
      console.log('Payment method type:', typeof topUpData.payment_method)
      
      // Debug: Check what payment methods are allowed by the database
      try {
        const { data: testData, error: testError } = await supabase
          .from('transactions')
          .select('payment_method')
          .limit(1)
        console.log('Existing payment methods in DB:', testData)
      } catch (debugErr) {
        console.log('Debug query error:', debugErr)
      }

      const { data: transactionData, error } = await supabase
        .from('transactions')
        .insert({
          user_id: profile?.id,
          type: 'deposit',
          amount: parseFloat(topUpData.amount),
          payment_method: topUpData.payment_method,
          status: 'pending',
          reference: proofImageUrl ? `${topUpData.reference}|${proofImageUrl}` : topUpData.reference, // Store image URL if available
        })
        .select()

      console.log('Transaction result:', { data: transactionData, error })

      if (error) {
        console.error('Transaction insert error:', error)
        throw error
      }

      setShowTopUpModal(false)
      setTopUpData({
        amount: '',
        payment_method: 'bank_transfer',
        reference: '',
        proof_image: null,
      })
      setSuccess(locale === 'es' ? 'Comprobante enviado para revisión' : 'Payment proof submitted for review')
      fetchPaymentProofs()
    } catch (error: any) {
      setError(error.message || 'Failed to submit payment proof')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'approved': return 'text-green-600 bg-green-100'  
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <X className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-luxury-black text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <User className="h-8 w-8 text-luxury-gold" />
            <span className="text-2xl font-bold">FlyInGuate</span>
          </Link>
          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-luxury-gold transition-colors"
            >
              {locale === 'es' ? 'Mi Panel' : 'My Dashboard'}
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/')
              }}
              className="text-sm hover:text-luxury-gold"
            >
              {locale === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'es' ? 'Mi Perfil' : 'My Profile'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="card-luxury">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-600" />
              {locale === 'es' ? 'Información Personal' : 'Personal Information'}
            </h2>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Nombre Completo' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder={locale === 'es' ? 'Tu nombre completo' : 'Your full name'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Correo Electrónico' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {locale === 'es' ? 'El correo no puede ser modificado' : 'Email cannot be changed'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Teléfono' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder={locale === 'es' ? '+502 5555 5555' : '+502 5555 5555'}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 flex items-center justify-center"
              >
                <Save className="h-5 w-5 mr-2" />
                {loading 
                  ? (locale === 'es' ? 'Guardando...' : 'Saving...') 
                  : (locale === 'es' ? 'Guardar Cambios' : 'Save Changes')
                }
              </button>
            </form>
          </div>

          {/* Wallet & Balance */}
          <div className="card-luxury">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-luxury-gold" />
              {locale === 'es' ? 'Mi Billetera' : 'My Wallet'}
            </h2>

            <div className="bg-gradient-to-r from-luxury-black to-gray-800 text-white rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-luxury-gold text-sm">
                    {locale === 'es' ? 'Saldo Disponible' : 'Available Balance'}
                  </p>
                  <p className="text-3xl font-bold">${profile?.account_balance?.toFixed(2) || '0.00'}</p>
                </div>
                <CreditCard className="h-12 w-12 text-luxury-gold" />
              </div>
            </div>

            <button
              onClick={() => setShowTopUpModal(true)}
              className="w-full btn-luxury flex items-center justify-center mb-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              {locale === 'es' ? 'Recargar Saldo' : 'Top Up Balance'}
            </button>

            {/* Payment History */}
            <h3 className="text-lg font-semibold mb-4">
              {locale === 'es' ? 'Historial de Recargas' : 'Top-up History'}
            </h3>
            
            {paymentProofs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {locale === 'es' ? 'No hay recargas registradas' : 'No top-ups recorded'}
              </p>
            ) : (
              <div className="space-y-3">
                {paymentProofs.slice(0, 5).map((proof) => (
                  <div key={proof.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getStatusIcon(proof.status)}
                      <div className="ml-3">
                        <p className="font-medium">${proof.amount}</p>
                        <p className="text-sm text-gray-600">{new Date(proof.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proof.status)}`}>
                      {locale === 'es' 
                        ? (proof.status === 'pending' ? 'Pendiente' : proof.status === 'approved' ? 'Aprobado' : 'Rechazado')
                        : proof.status.charAt(0).toUpperCase() + proof.status.slice(1)
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top-up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {locale === 'es' ? 'Recargar Saldo' : 'Top Up Balance'}
            </h3>

            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Monto (USD)' : 'Amount (USD)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  value={topUpData.amount}
                  onChange={(e) => setTopUpData({ ...topUpData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {locale === 'es' ? 'Monto mínimo: $10.00' : 'Minimum amount: $10.00'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Método de Pago' : 'Payment Method'}
                </label>
                <select
                  value={topUpData.payment_method}
                  onChange={(e) => setTopUpData({ ...topUpData, payment_method: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="bank_transfer">{locale === 'es' ? 'Transferencia Bancaria' : 'Bank Transfer'}</option>
                  <option value="deposit">{locale === 'es' ? 'Depósito Bancario' : 'Bank Deposit'}</option>
                  <option value="mobile_payment">{locale === 'es' ? 'Pago Móvil' : 'Mobile Payment'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Referencia / No. Transacción' : 'Reference / Transaction Number'}
                </label>
                <input
                  type="text"
                  value={topUpData.reference}
                  onChange={(e) => setTopUpData({ ...topUpData, reference: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder={locale === 'es' ? 'Ingresa el número de referencia' : 'Enter reference number'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Comprobante de Pago (Opcional)' : 'Payment Proof (Optional)'}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setTopUpData({ ...topUpData, proof_image: e.target.files?.[0] || null })}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {locale === 'es' 
                      ? 'Sube una imagen del comprobante (JPG, PNG, PDF) - Opcional por ahora' 
                      : 'Upload proof image (JPG, PNG, PDF) - Optional for now'
                    }
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  {locale === 'es' ? 'Información Bancaria' : 'Bank Information'}
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Banco:</strong> Banco Industrial</p>
                  <p><strong>{locale === 'es' ? 'Cuenta' : 'Account'}:</strong> 123-456789-0</p>
                  <p><strong>{locale === 'es' ? 'Nombre' : 'Name'}:</strong> FlyInGuate S.A.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {locale === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading 
                    ? (locale === 'es' ? 'Enviando...' : 'Submitting...') 
                    : (locale === 'es' ? 'Enviar Comprobante' : 'Submit Proof')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}