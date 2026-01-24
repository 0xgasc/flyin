'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Users, Shield, Clock, Star, MapPin, Calendar, ChevronDown } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { MobileNav } from '@/components/mobile-nav'
import { useAuthStore } from '@/lib/auth-store'
import { logout } from '@/lib/auth-client'
import { PhotoGallery } from '@/components/PhotoGallery'
import dynamic from 'next/dynamic'

const LOGO_URL = 'https://isteam.wsimg.com/ip/5d044532-96be-44dc-9d52-5a4c26b5b2e3/Logo_FlyInGuatemala_c03.png'

// Dynamically import MapLibre to avoid SSR issues
const GuatemalaMapLibre = dynamic(() => import('@/components/guatemala-maplibre'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-luxury-black/50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-accent border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-400 text-sm">Loading map...</p>
      </div>
    </div>
  )
})

const DESTINATIONS = [
  { value: '', label: 'Select destination' },
  { value: 'GUA', label: 'Guatemala City (GUA)' },
  { value: 'ANTIGUA', label: 'Antigua Guatemala' },
  { value: 'ATITLAN', label: 'Lake Atitlan' },
  { value: 'TIKAL', label: 'Tikal' },
  { value: 'FRS', label: 'Flores (FRS)' },
  { value: 'SEMUC', label: 'Semuc Champey' },
  { value: 'MONTERRICO', label: 'Monterrico Beach' },
]

export default function HomePage() {
  const { t } = useTranslation()
  const { profile } = useAuthStore()
  const router = useRouter()

  const [bookingForm, setBookingForm] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '2'
  })

  const handleSignOut = async () => {
    await logout()
    router.push('/')
  }

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to transport page with pre-filled data
    const params = new URLSearchParams()
    if (bookingForm.from) params.set('from', bookingForm.from)
    if (bookingForm.to) params.set('to', bookingForm.to)
    if (bookingForm.date) params.set('date', bookingForm.date)
    if (bookingForm.passengers) params.set('passengers', bookingForm.passengers)
    router.push(`/book/transport?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-luxury-black">
      {/* Hero Section - Full viewport height with background */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2000&auto=format&fit=crop"
            alt="Helicopter flying over Guatemala"
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>

        {/* Navigation */}
        <div className="relative z-10">
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
                    <Link href="/dashboard" className="hover:text-luxury-gold transition-colors text-sm">
                      Dashboard
                    </Link>
                    {profile.role === 'admin' && (
                      <Link href="/admin" className="hover:text-luxury-gold transition-colors text-sm">
                        Admin
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
                    <Link href="/register" className="btn-luxury text-sm px-4 py-2">
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
        </div>

        {/* Hero Content - Centered */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <Image
              src={LOGO_URL}
              alt="FlyInGuate"
              width={350}
              height={122}
              className="h-24 sm:h-32 md:h-40 w-auto mx-auto mb-8"
              priority
            />

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 tracking-wide">
              {t('hero.title')}
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-12">
              {t('hero.subtitle')}
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-accent" />
                <span className="text-sm">Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-accent" />
                <span className="text-sm">24/7 Service</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-brand-accent" />
                <span className="text-sm">Premium Fleet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-10 pb-8 text-center">
          <div className="animate-bounce">
            <ChevronDown className="h-8 w-8 text-white/50 mx-auto" />
          </div>
        </div>
      </div>

      {/* Booking Section with Map */}
      <div className="bg-luxury-charcoal">
        <div className="container mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Book Your Flight
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Select your route on the map or use the form below to get started
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
            {/* Booking Form */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-none p-6 sm:p-8">
              <form onSubmit={handleQuickBook} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      From
                    </label>
                    <select
                      value={bookingForm.from}
                      onChange={(e) => setBookingForm({ ...bookingForm, from: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-none text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                    >
                      {DESTINATIONS.map(d => (
                        <option key={d.value} value={d.value} className="bg-luxury-black text-white">
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      To
                    </label>
                    <select
                      value={bookingForm.to}
                      onChange={(e) => setBookingForm({ ...bookingForm, to: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-none text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                    >
                      {DESTINATIONS.map(d => (
                        <option key={d.value} value={d.value} className="bg-luxury-black text-white">
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-none text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Users className="h-4 w-4 inline mr-1" />
                      Passengers
                    </label>
                    <select
                      value={bookingForm.passengers}
                      onChange={(e) => setBookingForm({ ...bookingForm, passengers: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-none text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n} className="bg-luxury-black text-white">
                          {n} {n === 1 ? 'Passenger' : 'Passengers'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-luxury py-4 text-lg"
                >
                  Get Quote
                </button>

                <p className="text-center text-gray-500 text-sm">
                  Or browse our <Link href="/book/experiences" className="text-brand-accent hover:underline">scenic experiences</Link>
                </p>
              </form>
            </div>

            {/* Map */}
            <div className="h-[400px] lg:h-[500px] rounded-none overflow-hidden border border-white/10">
              <GuatemalaMapLibre
                onDepartmentClick={(dept) => {
                  // Select first destination from department
                  if (dept.destinations.length > 0) {
                    const dest = dept.destinations[0]
                    if (!bookingForm.from) {
                      setBookingForm({ ...bookingForm, from: dest })
                    } else if (!bookingForm.to) {
                      setBookingForm({ ...bookingForm, to: dest })
                    }
                  }
                }}
                selectedFrom={bookingForm.from}
                selectedTo={bookingForm.to}
                mode="both"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-luxury-black mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From executive transport to unforgettable aerial experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Transport */}
            <div className="group bg-gray-50 rounded-none p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
              <h3 className="text-2xl font-bold text-luxury-black mb-4">
                {t('services.transport.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('services.transport.description')}
              </p>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
                  Guatemala City to any destination
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
                  Inter-city business transfers
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
                  Up to 5 passengers per flight
                </li>
              </ul>
              <Link
                href="/book/transport"
                className="inline-flex items-center gap-2 text-brand-accent font-semibold hover:gap-3 transition-all"
              >
                Book Transport <span>&rarr;</span>
              </Link>
            </div>

            {/* Experiences */}
            <div className="group bg-gray-50 rounded-none p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
              <h3 className="text-2xl font-bold text-luxury-black mb-4">
                {t('services.experiences.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('services.experiences.description')}
              </p>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
                  Lake Atitlan scenic tours
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
                  Tikal archaeological flights
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
                  Volcano discovery expeditions
                </li>
              </ul>
              <Link
                href="/book/experiences"
                className="inline-flex items-center gap-2 text-brand-accent font-semibold hover:gap-3 transition-all"
              >
                Explore Experiences <span>&rarr;</span>
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
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Experience Guatemala from above. Book your flight today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book/transport"
              className="btn-luxury text-lg px-10 py-4"
            >
              Book Now
            </Link>
            <Link
              href="/book/experiences"
              className="border border-white/30 text-white px-10 py-4 rounded-none hover:bg-white/10 transition-colors text-lg"
            >
              View Experiences
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
