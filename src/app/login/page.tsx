'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { login } from '@/lib/auth-client'
import { useTranslation } from '@/lib/i18n'
import { Mail, Lock } from 'lucide-react'

const LOGO_URL = 'https://isteam.wsimg.com/ip/5d044532-96be-44dc-9d52-5a4c26b5b2e3/Logo_FlyInGuatemala_c03.png'

// Validate redirect URL to prevent open redirect attacks
const getSafeRedirect = (redirect: string | null): string => {
  if (!redirect) return '/dashboard'
  // Only allow paths starting with / that don't have protocol or //
  if (redirect.startsWith('/') && !redirect.includes('://') && !redirect.startsWith('//')) {
    return redirect
  }
  return '/dashboard'
}

function LoginContent() {
  const searchParams = useSearchParams()
  const redirect = getSafeRedirect(searchParams.get('redirect'))
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Note: Middleware already redirects logged-in users away from /login
  // We don't check getCurrentUser() here to avoid redirect loops when
  // localStorage token exists but cookie is missing/expired

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)

      if (!result.success || !result.user) {
        throw new Error(result.error || 'Login failed')
      }

      console.log('Login successful, token received:', !!result.token)

      // Redirect based on role
      let targetUrl = redirect

      if (result.user.role === 'admin') {
        targetUrl = redirect.includes('/admin') ? redirect : '/admin'
      } else if (result.user.role === 'pilot') {
        targetUrl = '/pilot'
      }

      // Give browser time to process the Set-Cookie header before redirecting
      // This prevents the race condition where navigation happens before cookie is stored
      await new Promise(resolve => setTimeout(resolve, 150))

      console.log('Redirecting to:', targetUrl)
      window.location.replace(targetUrl)
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Failed to login')
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
          <h1 className="text-2xl font-display font-semibold text-white">{t('auth.welcome_back')}</h1>
          <p className="text-gray-400 mt-2">{t('auth.sign_in_subtitle')}</p>
        </div>

        <div className="bg-luxury-charcoal border border-gray-800 rounded-soft p-6 shadow-luxury">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-soft text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-700 rounded-soft bg-luxury-black text-white placeholder-gray-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-700 rounded-soft bg-luxury-black text-white placeholder-gray-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 text-luxury-black font-semibold py-3 rounded-soft hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.signing_in') : t('auth.sign_in')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {t('auth.no_account')}{' '}
              <Link href="/register" className="text-gold-400 hover:text-gold-300 font-medium">
                {t('auth.sign_up')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-luxury-black to-luxury-charcoal flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-gold-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
