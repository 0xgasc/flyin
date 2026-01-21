'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/auth-client'
import { Plane, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-luxury-black mb-4">
            <Plane className="h-10 w-10 text-luxury-gold" />
            <span className="text-3xl font-bold">FlyInGuate</span>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join FlyInGuate today</p>
        </div>

        <div className="card-luxury">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-none text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'client' })}
                  className={`p-4 rounded-none border-2 transition-all ${
                    formData.role === 'client'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Client</div>
                  <div className="text-sm text-gray-600">Book flights</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'pilot' })}
                  className={`p-4 rounded-none border-2 transition-all ${
                    formData.role === 'pilot'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Pilot</div>
                  <div className="text-sm text-gray-600">Provide services</div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+502 5555 5555"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setShowPasswordRequirements(true)}
                  onBlur={() => setShowPasswordRequirements(false)}
                  className={`w-full pl-10 pr-3 py-3 border rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    formData.password && !passwordValidation.isValid
                      ? 'border-amber-400'
                      : formData.password && passwordValidation.isValid
                      ? 'border-green-400'
                      : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              {/* Password requirements */}
              {(showPasswordRequirements || formData.password) && (
                <div className="mt-2 p-3 bg-gray-50 rounded-none text-sm">
                  <p className="font-medium text-gray-700 mb-2">Password must have:</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center ${passwordValidation.checks.length ? 'text-green-600' : 'text-gray-500'}`}>
                      {passwordValidation.checks.length ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${passwordValidation.checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      {passwordValidation.checks.uppercase ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                      One uppercase letter
                    </li>
                    <li className={`flex items-center ${passwordValidation.checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      {passwordValidation.checks.lowercase ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                      One lowercase letter
                    </li>
                    <li className={`flex items-center ${passwordValidation.checks.number ? 'text-green-600' : 'text-gray-500'}`}>
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
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}