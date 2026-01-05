'use client'

import Link from 'next/link'
import { MapPin, Sparkles, Users, UserPlus } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { MobileNav } from '@/components/mobile-nav'
import { useAuthStore } from '@/lib/auth-store'
import { logout } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { PhotoGallery } from '@/components/PhotoGallery'

export default function HomePage() {
  const { t } = useTranslation()
  const { profile } = useAuthStore()
  const router = useRouter()

  const handleSignOut = async () => {
    await logout()
    router.push('/')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <MobileNav 
        customActions={
          <div className="hidden md:flex items-center space-x-6">
            <LanguageSwitcher />
            {!profile && (
              <Link href="/pilot/join" className="hover:text-luxury-gold transition-colors text-sm">
                {t('nav.pilot_opportunities')}
              </Link>
            )}
            {profile ? (
              // Authenticated user actions
              <>
                <span className="text-sm text-gray-300">
                  {profile.fullName || profile.email}
                </span>
                {profile.role === 'admin' && (
                  <Link href="/admin" className="hover:text-luxury-gold transition-colors text-sm">
                    Admin Panel
                  </Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="hover:text-luxury-gold transition-colors text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              // Unauthenticated user actions
              <>
                <Link href="/login" className="hover:text-luxury-gold transition-colors text-sm">
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="btn-luxury text-sm">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        }
        additionalMobileItems={[
          {
            href: '/pilot/join',
            label: t('nav.pilot_opportunities'),
            icon: <Users className="h-5 w-5" />,
            show: !profile // Only show for unauthenticated users
          }
          // Note: Admin Panel is already handled by the built-in navItems
        ]}
      />

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 px-2">
            {t('hero.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            {t('hero.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="card-luxury hover:border-primary-200">
            <div className="flex items-center mb-4">
              <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-primary-600 mr-3 sm:mr-4 flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold">{t('services.transport.title')}</h2>
            </div>
            <p className="text-gray-600 mb-6">
              {t('services.transport.description')}
            </p>
            <Link href="/book/transport" className="btn-primary inline-block">
              {t('services.transport.cta')}
            </Link>
          </div>

          <div className="card-luxury hover:border-luxury-gold">
            <div className="flex items-center mb-4">
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-luxury-gold mr-3 sm:mr-4 flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold">{t('services.experiences.title')}</h2>
            </div>
            <p className="text-gray-600 mb-6">
              {t('services.experiences.description')}
            </p>
            <Link href="/book/experiences" className="btn-luxury inline-block text-sm">
              {t('services.experiences.cta')}
            </Link>
          </div>
        </div>

        {/* Photo Gallery */}
        <PhotoGallery />
      </main>
    </div>
  )
}