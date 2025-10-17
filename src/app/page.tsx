'use client'

import Link from 'next/link'
import { MapPin, Sparkles, Users, UserPlus } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { MobileNav } from '@/components/mobile-nav'
import { useAuthStore } from '@/lib/auth-store'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { t } = useTranslation()
  const { profile } = useAuthStore()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <MobileNav
        customActions={
          <div className="hidden md:flex items-center space-x-6">
            <LanguageSwitcher />
            {!profile && (
              <Link href="/pilot/join" className="hover:text-navy-600 transition-colors text-sm font-medium">
                {t('nav.pilot_opportunities')}
              </Link>
            )}
            {profile ? (
              // Authenticated user actions
              <>
                <span className="text-sm text-slate-600 font-medium">
                  {profile.full_name || profile.email}
                </span>
                {profile.role === 'admin' && (
                  <Link href="/admin" className="hover:text-navy-600 transition-colors text-sm font-medium">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="hover:text-navy-600 transition-colors text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              // Unauthenticated user actions
              <>
                <Link href="/login" className="hover:text-navy-600 transition-colors text-sm font-medium">
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4 px-2">
            {t('hero.title')}
          </h1>
          <p className="text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto px-2">
            {t('hero.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="card-luxury hover:border-navy-400">
            <div className="flex items-center mb-4">
              <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-navy-600 mr-3 sm:mr-4 flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-navy-900">{t('services.transport.title')}</h2>
            </div>
            <p className="text-slate-700 mb-6">
              {t('services.transport.description')}
            </p>
            <Link href="/book/transport" className="btn-primary inline-block">
              {t('services.transport.cta')}
            </Link>
          </div>

          <div className="card-luxury hover:border-navy-400">
            <div className="flex items-center mb-4">
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-navy-600 mr-3 sm:mr-4 flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-navy-900">{t('services.experiences.title')}</h2>
            </div>
            <p className="text-slate-700 mb-6">
              {t('services.experiences.description')}
            </p>
            <Link href="/book/experiences" className="btn-luxury inline-block text-sm">
              {t('services.experiences.cta')}
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-navy-900 mb-8">{t('how_it_works.title')}</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-navy-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-navy-200">
                <span className="text-2xl font-bold text-navy-700">1</span>
              </div>
              <h4 className="font-bold text-navy-900 mb-2">{t('how_it_works.step1.title')}</h4>
              <p className="text-slate-600 text-sm">{t('how_it_works.step1.description')}</p>
            </div>
            <div className="text-center">
              <div className="bg-navy-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-navy-200">
                <span className="text-2xl font-bold text-navy-700">2</span>
              </div>
              <h4 className="font-bold text-navy-900 mb-2">{t('how_it_works.step2.title')}</h4>
              <p className="text-slate-600 text-sm">{t('how_it_works.step2.description')}</p>
            </div>
            <div className="text-center">
              <div className="bg-navy-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-navy-200">
                <span className="text-2xl font-bold text-navy-700">3</span>
              </div>
              <h4 className="font-bold text-navy-900 mb-2">{t('how_it_works.step3.title')}</h4>
              <p className="text-slate-600 text-sm">{t('how_it_works.step3.description')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
