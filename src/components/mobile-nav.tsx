'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Home, User, Users, Calendar, Settings, LogOut, Globe, Briefcase, HelpCircle, Plane, MapPin } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { logout } from '@/lib/auth-client'
import { useI18n, useTranslation } from '@/lib/i18n'

const LOGO_URL = 'https://isteam.wsimg.com/ip/5d044532-96be-44dc-9d52-5a4c26b5b2e3/Logo_FlyInGuatemala_c03.png'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  show?: boolean
}

interface MobileNavProps {
  title?: string
  showBackButton?: boolean
  customActions?: React.ReactNode
  additionalMobileItems?: NavItem[]
}

export function MobileNav({ title = 'FlyInGuate', showBackButton = false, customActions, additionalMobileItems = [] }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { profile } = useAuthStore()
  const { locale, setLocale } = useI18n()
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleSignOut = async () => {
    setIsOpen(false)

    try {
      await logout()
    } catch (error) {
      // Silently handle - we'll redirect anyway
    }

    window.location.href = '/'
  }

  const navItems: NavItem[] = [
    {
      href: '/',
      label: t('nav.home'),
      icon: <Home className="h-5 w-5" />,
      show: true
    },
    {
      href: '/book/experiences',
      label: t('nav.experiences'),
      icon: <Plane className="h-5 w-5" />,
      show: true
    },
    {
      href: '/book/transport',
      label: t('nav.executive_services'),
      icon: <Briefcase className="h-5 w-5" />,
      show: true
    },
    {
      href: '/faq',
      label: t('nav.faq'),
      icon: <HelpCircle className="h-5 w-5" />,
      show: true
    },
    {
      href: '/pilot/join',
      label: t('nav.pilot_opportunities'),
      icon: <Users className="h-5 w-5" />,
      show: !profile
    },
    {
      href: '/dashboard',
      label: t('nav.dashboard'),
      icon: <Calendar className="h-5 w-5" />,
      show: !!profile
    },
    {
      href: '/admin',
      label: t('nav.admin'),
      icon: <Settings className="h-5 w-5" />,
      show: profile?.role === 'admin'
    },
    {
      href: '/pilot',
      label: t('nav.pilot_dashboard'),
      icon: <Briefcase className="h-5 w-5" />,
      show: profile?.role === 'pilot'
    },
    {
      href: '/profile',
      label: t('nav.profile'),
      icon: <User className="h-5 w-5" />,
      show: !!profile
    }
  ]

  // Desktop nav items (subset for ribbon)
  const desktopNavItems = navItems.filter(item =>
    item.show && ['/', '/book/experiences', '/book/transport', '/faq'].includes(item.href)
  )

  return (
    <>
      <nav className="text-white relative z-[60]">
        {/* Mobile: Banner with centered logo and burger */}
        <div className="md:hidden bg-luxury-black">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: Language switcher (compact) */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
              className="p-2 hover:bg-gray-800 rounded transition-colors flex items-center space-x-1 text-sm"
              title={locale === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés'}
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">{locale === 'en' ? 'EN' : 'ES'}</span>
            </button>

            {/* Center: Logo - bigger, banner style */}
            <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
              <Image
                src={LOGO_URL}
                alt="FlyInGuate"
                width={200}
                height={60}
                className="h-12 sm:h-14 w-auto"
                priority
              />
            </Link>

            {/* Right: Hamburger menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Desktop: Full ribbon navigation */}
        <div className="hidden md:block bg-black/70 backdrop-blur-md">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between py-3">
              {/* Left: Logo */}
              <Link href="/" className="flex-shrink-0">
                <Image
                  src={LOGO_URL}
                  alt="FlyInGuate"
                  width={160}
                  height={50}
                  className="h-10 w-auto"
                  priority
                />
              </Link>

              {/* Center: Nav links */}
              <div className="flex items-center space-x-6">
                {desktopNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-white/90 hover:text-gold-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                {!profile && (
                  <Link
                    href="/pilot/join"
                    className="text-sm font-medium text-white/90 hover:text-gold-400 transition-colors"
                  >
                    {t('nav.pilot_opportunities')}
                  </Link>
                )}
              </div>

              {/* Right: Auth + Language */}
              <div className="flex items-center space-x-4">
                {/* Language switcher */}
                <button
                  onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
                  className="p-2 hover:bg-white/10 rounded transition-colors flex items-center space-x-1 text-sm"
                  title={locale === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés'}
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-medium">{locale === 'en' ? 'EN' : 'ES'}</span>
                </button>

                {profile ? (
                  <>
                    <Link href="/dashboard" className="text-sm text-white/90 hover:text-gold-400 transition-colors">
                      Dashboard
                    </Link>
                    {profile.role === 'admin' && (
                      <Link href="/admin" className="text-sm text-white/90 hover:text-gold-400 transition-colors">
                        Admin
                      </Link>
                    )}
                    {profile.role === 'pilot' && (
                      <Link href="/pilot" className="text-sm text-white/90 hover:text-gold-400 transition-colors">
                        Pilot
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="text-sm text-white/90 hover:text-gold-400 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm text-white/90 hover:text-gold-400 transition-colors">
                      {t('nav.sign_in')}
                    </Link>
                    <Link
                      href="/register"
                      className="text-sm px-4 py-2 bg-gold-500 text-gray-900 font-semibold rounded-soft hover:bg-gold-400 transition-colors"
                    >
                      {t('nav.register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Slide-out menu overlay (mobile only) */}
      {isOpen && (
        <div className="fixed inset-0 z-[65] md:hidden" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-60" />
        </div>
      )}

      {/* Slide-out menu panel (mobile only) */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-luxury-black border-l border-gray-800 z-[70] transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <Image
              src={LOGO_URL}
              alt="FlyInGuate"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info (if logged in) */}
          {profile && (
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-sm font-medium text-white truncate">
                {profile.fullName || profile.email}
              </p>
              <p className="text-xs text-gray-400 truncate">{profile.email}</p>
            </div>
          )}

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto py-2">
            {navItems.filter(item => item.show).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 transition-colors"
              >
                <span className="text-gray-400">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Additional items passed by page */}
            {additionalMobileItems.filter(item => item.show !== false).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 transition-colors"
              >
                <span className="text-gray-400">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="my-2 border-t border-gray-800" />

            {/* Language switch */}
            <button
              onClick={() => {
                setLocale(locale === 'en' ? 'es' : 'en')
                setIsOpen(false)
              }}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 transition-colors w-full text-left"
            >
              <span className="text-gray-400"><Globe className="h-5 w-5" /></span>
              <span>{t('nav.switch_language')}</span>
            </button>
          </div>

          {/* Auth section at bottom */}
          <div className="border-t border-gray-800 p-4">
            {!profile ? (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full py-2.5 border border-gray-600 rounded text-sm hover:bg-gray-800 transition-colors"
                >
                  {t('nav.sign_in')}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full py-2.5 bg-primary-600 rounded text-sm hover:bg-primary-700 transition-colors font-medium"
                >
                  {t('nav.register')}
                </Link>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                type="button"
                className="flex items-center space-x-3 w-full py-2.5 px-3 text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>{t('nav.sign_out')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
