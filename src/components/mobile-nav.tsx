'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, Home, User, Calendar, Settings, LogOut, Globe, Briefcase, HelpCircle, Plane, MapPin } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { logout } from '@/lib/auth-client'
import { useI18n } from '@/lib/i18n'

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
  const router = useRouter()

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [])

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
      label: locale === 'es' ? 'Inicio' : 'Home',
      icon: <Home className="h-5 w-5" />,
      show: true
    },
    {
      href: '/book/experiences',
      label: locale === 'es' ? 'Experiencias' : 'Experiences',
      icon: <Plane className="h-5 w-5" />,
      show: true
    },
    {
      href: '/book/transport',
      label: locale === 'es' ? 'Transporte' : 'Transport',
      icon: <MapPin className="h-5 w-5" />,
      show: true
    },
    {
      href: '/faq',
      label: 'FAQ',
      icon: <HelpCircle className="h-5 w-5" />,
      show: true
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <Calendar className="h-5 w-5" />,
      show: !!profile
    },
    {
      href: '/admin',
      label: 'Admin Panel',
      icon: <Settings className="h-5 w-5" />,
      show: profile?.role === 'admin'
    },
    {
      href: '/pilot',
      label: locale === 'es' ? 'Panel de Piloto' : 'Pilot Dashboard',
      icon: <Briefcase className="h-5 w-5" />,
      show: profile?.role === 'pilot'
    },
    {
      href: '/profile',
      label: locale === 'es' ? 'Perfil' : 'Profile',
      icon: <User className="h-5 w-5" />,
      show: !!profile
    }
  ]

  return (
    <>
      <nav className="bg-luxury-black text-white relative z-[60]">
        {/* Banner with centered logo */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Hamburger menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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

          {/* Right: Language switcher (compact) */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
            className="p-2 hover:bg-gray-800 rounded transition-colors flex items-center space-x-1 text-sm"
            title={locale === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés'}
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium">{locale === 'en' ? 'EN' : 'ES'}</span>
          </button>
        </div>
      </nav>

      {/* Slide-out menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[55]" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-60" />
        </div>
      )}

      {/* Slide-out menu panel */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-luxury-black border-r border-gray-800 z-[70] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
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
              <span>{locale === 'en' ? 'Español' : 'English'}</span>
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
                  {locale === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full py-2.5 bg-primary-600 rounded text-sm hover:bg-primary-700 transition-colors font-medium"
                >
                  {locale === 'es' ? 'Registrarse' : 'Register'}
                </Link>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                type="button"
                className="flex items-center space-x-3 w-full py-2.5 px-3 text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>{locale === 'es' ? 'Cerrar Sesión' : 'Sign Out'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
