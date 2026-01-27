'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/auth-client'
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'

const LOGO_URL = 'https://isteam.wsimg.com/ip/5d044532-96be-44dc-9d52-5a4c26b5b2e3/Logo_FlyInGuatemala_c03.png'

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Password validation
const validatePassword = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const isValid = checks.length && checks.uppercase && checks.lowercase && checks.number
  return { checks, isValid }
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'client' as 'client' | 'pilot',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

  const passwordValidation = validatePassword(formData.password)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Trim inputs
    const trimmedEmail = formData.email.trim().toLowerCase()
    const trimmedName = formData.fullName.trim()
    const trimmedPhone = formData.phone.trim()

    // Validate full name
    if (trimmedName.length < 2) {
      setError('Full name must be at least 2 characters')
      return
    }

    // Validate email format
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }

    // Validate password strength
    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements')
      return
    }

    setLoading(true)

    try {
      const result = await register({
        email: trimmedEmail,
        password: formData.password,
        fullName: trimmedName,
        phone: trimmedPhone || undefined,
        role: formData.role,
      })

      if (!result.success) {
        throw new Error(result.error || 'Registration failed')
      }

      console.log('User registered successfully:', result.user?.email)

      if (formData.role === 'pilot') {
        router.push('/pilot/pending-verification')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-black to-luxury-charcoal flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image
              src={LOGO_URL}
              alt="FlyInGuate"
              width={200}
              height={70}
              className="h-16 w-auto mx-auto"
              priority
            />
          </Link>
          <h1 className="text-2xl font-semibold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Join FlyInGuate today</p>
        </div>

        <div className="bg-luxury-charcoal border border-gray-800 rounded-soft p-6 shadow-luxury">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-soft text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'client' })}
                  className={`p-4 rounded-soft border-2 transition-all ${
                    formData.role === 'client'
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium text-white">Client</div>
                  <div className="text-sm text-gray-400">Book flights</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'pilot' })}
                  className={`p-4 rounded-soft border-2 transition-all ${
                    formData.role === 'pilot'
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium text-white">Pilot</div>
                  <div className="text-sm text-gray-400">Provide services</div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-700 rounded-soft bg-luxury-black text-white placeholder-gray-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-700 rounded-soft bg-luxury-black text-white placeholder-gray-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-700 rounded-soft bg-luxury-black text-white placeholder-gray-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="+502 5555 5555"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setShowPasswordRequirements(true)}
                  onBlur={() => setShowPasswordRequirements(false)}
                  className={`w-full pl-10 pr-3 py-3 border rounded-soft bg-luxury-black text-white placeholder-gray-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent ${
                    formData.password && !passwordValidation.isValid
                      ? 'border-amber-500'
                      : formData.password && passwordValidation.isValid
                      ? 'border-green-500'
                      : 'border-gray-700'
                  }`}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              {/* Password requirements */}
              {(showPasswordRequirements || formData.password) && (
                <div className="mt-2 p-3 bg-luxury-black/50 border border-gray-800 rounded-soft text-sm">
                  <p className="font-medium text-gray-300 mb-2">Password must have:</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center ${passwordValidation.checks.length ? 'text-green-400' : 'text-gray-500'}`}>
                      {passwordValidation.checks.length ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${passwordValidation.checks.uppercase ? 'text-green-400' : 'text-gray-500'}`}>
                      {passwordValidation.checks.uppercase ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                      One uppercase letter
                    </li>
                    <li className={`flex items-center ${passwordValidation.checks.lowercase ? 'text-green-400' : 'text-gray-500'}`}>
                      {passwordValidation.checks.lowercase ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                      One lowercase letter
                    </li>
                    <li className={`flex items-center ${passwordValidation.checks.number ? 'text-green-400' : 'text-gray-500'}`}>
                      {passwordValidation.checks.number ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                      One number
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordValidation.isValid || !formData.email || !formData.fullName}
              className="w-full bg-gold-500 text-luxury-black font-semibold py-3 rounded-soft hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-gold-400 hover:text-gold-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}