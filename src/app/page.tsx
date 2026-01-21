'use client'

import Link from 'next/link'
import { Users, Shield, Clock, Star } from 'lucide-react'
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
    <div className="min-h-screen">
      {/* Hero Section with Dark Background */}
      <div className="relative bg-luxury-black text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

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
              show: !profile
            }
          ]}
        />

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="text-luxury-gold">FlyIn</span>Guate
            </h1>

            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-4 font-light">
              {t('hero.title')}
            </p>

            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10">
              {t('hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book/transport"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center"
              >
                {t('services.transport.cta')}
              </Link>
              <Link
                href="/book/experiences"
                className="btn-luxury text-lg px-8 py-4 inline-flex items-center justify-center"
              >
                {t('services.experiences.cta')}
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="relative border-t border-luxury-slate/30">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <Shield className="h-8 w-8 text-brand-accent mx-auto mb-2" />
                <p className="text-sm text-gray-400">Licensed & Insured</p>
              </div>
              <div>
                <Clock className="h-8 w-8 text-brand-accent mx-auto mb-2" />
                <p className="text-sm text-gray-400">24/7 Availability</p>
              </div>
              <div>
                <Star className="h-8 w-8 text-brand-accent mx-auto mb-2" />
                <p className="text-sm text-gray-400">Premium Service</p>
              </div>
              <div>
                <Users className="h-8 w-8 text-brand-accent mx-auto mb-2" />
                <p className="text-sm text-gray-400">Expert Pilots</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <main className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-luxury-black mb-4">
              Our Services
            </h2>
            <p className="text-brand-muted max-w-2xl mx-auto">
              Choose your adventure - from point-to-point transport to unforgettable experiences
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {/* Transport Card */}
            <div className="group relative bg-white rounded-none shadow-xl overflow-hidden border border-luxury-slate/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-luxury-slate to-luxury-navy"></div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-luxury-black mb-3">{t('services.transport.title')}</h3>
                <p className="text-brand-muted mb-6 leading-relaxed">
                  {t('services.transport.description')}
                </p>
                <ul className="space-y-2 mb-8 text-sm text-brand-muted">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full"></span>
                    Guatemala City to any destination
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full"></span>
                    Inter-city transfers available
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full"></span>
                    Up to 5 passengers per flight
                  </li>
                </ul>
                <Link
                  href="/book/transport"
                  className="inline-flex items-center gap-2 text-brand-accent font-semibold hover:text-brand-green transition-colors"
                >
                  Book Transport
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Experiences Card */}
            <div className="group relative bg-white rounded-none shadow-xl overflow-hidden border border-luxury-slate/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-accent to-brand-green"></div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-luxury-black mb-3">{t('services.experiences.title')}</h3>
                <p className="text-brand-muted mb-6 leading-relaxed">
                  {t('services.experiences.description')}
                </p>
                <ul className="space-y-2 mb-8 text-sm text-brand-muted">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full"></span>
                    Lake Atitlan scenic tours
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full"></span>
                    Tikal archaeological flights
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full"></span>
                    Volcano discovery expeditions
                  </li>
                </ul>
                <Link
                  href="/book/experiences"
                  className="inline-flex items-center gap-2 text-brand-accent font-semibold hover:text-brand-green transition-colors"
                >
                  Explore Experiences
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <PhotoGallery />

        {/* Footer CTA */}
        <div className="bg-luxury-black text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready for <span className="text-brand-accent">takeoff</span>?
            </h2>
            <p className="text-brand-muted mb-8 max-w-xl mx-auto">
              Experience Guatemala like never before. Book your flight today.
            </p>
            <Link
              href="/book/transport"
              className="btn-luxury text-lg px-10 py-4 inline-block"
            >
              Book Now
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
