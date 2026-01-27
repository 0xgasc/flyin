'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Users, Shield, Clock, Star, MapPin, ChevronDown, Plane, DollarSign } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { MobileNav } from '@/components/mobile-nav'
import { useAuthStore } from '@/lib/auth-store'
import { logout } from '@/lib/auth-client'
import { PhotoGallery } from '@/components/PhotoGallery'
import { guatemalaDepartments, type Department } from '@/lib/guatemala-departments'
import dynamic from 'next/dynamic'

const LOGO_URL = 'https://isteam.wsimg.com/ip/5d044532-96be-44dc-9d52-5a4c26b5b2e3/Logo_FlyInGuatemala_c03.png'

// Dynamically import SafeMapWrapper which checks WebGL before loading MapLibre
const SafeMapWrapper = dynamic(() => import('@/components/safe-map-wrapper'), {
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

// Estimated pricing data (per 2 passengers, roundtrip)
// Pricing is based on distance and flight time estimates
const ROUTE_PRICING: Record<string, { flightTime: string; price: number; distance: string }> = {
  'guatemala-sacatepequez': { flightTime: '15 min', price: 850, distance: '25 km' },
  'guatemala-solola': { flightTime: '35 min', price: 1650, distance: '95 km' },
  'guatemala-peten': { flightTime: '55 min', price: 2800, distance: '280 km' },
  'guatemala-izabal': { flightTime: '45 min', price: 2200, distance: '180 km' },
  'guatemala-quetzaltenango': { flightTime: '40 min', price: 1900, distance: '120 km' },
  'guatemala-retalhuleu': { flightTime: '35 min', price: 1700, distance: '130 km' },
  'guatemala-alta-verapaz': { flightTime: '40 min', price: 1850, distance: '140 km' },
  'guatemala-huehuetenango': { flightTime: '50 min', price: 2400, distance: '200 km' },
  'guatemala-escuintla': { flightTime: '20 min', price: 950, distance: '45 km' },
  'guatemala-san-marcos': { flightTime: '55 min', price: 2600, distance: '220 km' },
  'guatemala-chimaltenango': { flightTime: '18 min', price: 900, distance: '35 km' },
  'guatemala-zacapa': { flightTime: '35 min', price: 1600, distance: '110 km' },
  'guatemala-chiquimula': { flightTime: '40 min', price: 1800, distance: '130 km' },
  'guatemala-jalapa': { flightTime: '30 min', price: 1400, distance: '85 km' },
  'guatemala-santa-rosa': { flightTime: '25 min', price: 1200, distance: '60 km' },
  'guatemala-baja-verapaz': { flightTime: '35 min', price: 1550, distance: '100 km' },
  'guatemala-jutiapa': { flightTime: '35 min', price: 1500, distance: '100 km' },
  'guatemala-el-progreso': { flightTime: '25 min', price: 1100, distance: '55 km' },
  'guatemala-totonicapan': { flightTime: '45 min', price: 2100, distance: '150 km' },
  'guatemala-quiche': { flightTime: '45 min', price: 2050, distance: '145 km' },
  'guatemala-suchitepequez': { flightTime: '35 min', price: 1650, distance: '115 km' },
}

export default function HomePage() {
  const { t } = useTranslation()
  const { profile } = useAuthStore()
  const router = useRouter()

  // Default origin is Guatemala City (Aurora Airport)
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null)

  // Get selected destination department
  const destinationDept = useMemo(() => {
    if (!selectedDestination) return null
    return guatemalaDepartments.find(d => d.id === selectedDestination)
  }, [selectedDestination])

  // Get route pricing
  const routePricing = useMemo(() => {
    if (!selectedDestination || selectedDestination === 'guatemala') return null
    const key = `guatemala-${selectedDestination}`
    return ROUTE_PRICING[key] || null
  }, [selectedDestination])

  const handleSignOut = async () => {
    await logout()
    router.push('/')
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
              Where Would You Like to Fly?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Click on any destination on the map to see flight details and pricing from Guatemala City
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-6 items-start">
              {/* Left Panel - Pricing/Selection */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                {selectedDestination && destinationDept && routePricing ? (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-soft p-5 animate-fade-in">
                    {/* Route Header */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">From</span>
                        </div>
                        <div className="text-white font-semibold">Guatemala City</div>
                        <div className="text-sm text-gold-400">La Aurora (GUA)</div>
                      </div>
                      <Plane className="h-5 w-5 text-gold-400 rotate-90" />
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">To</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        </div>
                        <div className="text-white font-semibold">{destinationDept.name}</div>
                        <div className="text-sm text-gray-400">{destinationDept.destinations[0]}</div>
                      </div>
                    </div>

                    {/* Flight Details */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-white/5 rounded-soft p-3 text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Distance</div>
                        <div className="text-white font-medium">{routePricing.distance}</div>
                      </div>
                      <div className="bg-white/5 rounded-soft p-3 text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Flight</div>
                        <div className="text-white font-medium">{routePricing.flightTime}</div>
                      </div>
                      <div className="bg-white/5 rounded-soft p-3 text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Aircraft</div>
                        <div className="text-white font-medium">Bell 407</div>
                      </div>
                    </div>

                    {/* Price Card */}
                    <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/30 rounded-soft p-5 text-center mb-5">
                      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Roundtrip (2 passengers)</div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <DollarSign className="h-7 w-7 text-gold-400" />
                        <span className="text-3xl font-bold text-white">{routePricing.price.toLocaleString()}</span>
                        <span className="text-gray-400 text-sm self-end mb-1">USD</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-4">
                        ${Math.round(routePricing.price / 2).toLocaleString()} per person
                      </div>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams()
                          params.set('from', 'guatemala')
                          params.set('to', selectedDestination)
                          params.set('passengers', '2')
                          router.push(`/book/transport?${params.toString()}`)
                        }}
                        className="w-full btn-luxury py-3"
                      >
                        Book This Flight
                      </button>
                    </div>

                    {/* Destinations */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Destinations in {destinationDept.name}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {destinationDept.destinations.map(dest => (
                          <span key={dest} className="px-2.5 py-1 bg-white/10 rounded-full text-xs text-white">
                            {dest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Prompt to select destination */
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-soft p-6">
                    {/* Origin Badge */}
                    <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/40 px-3 py-2 rounded-full mb-5 w-fit">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      <span className="text-green-400 text-sm font-medium">Departing from La Aurora (GUA)</span>
                    </div>

                    <MapPin className="h-10 w-10 text-gold-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Select Your Destination</h3>
                    <p className="text-gray-400 text-sm">
                      Click on any point on the map to see flight details, distance, and pricing.
                    </p>

                    {/* Quick destination list */}
                    <div className="mt-5 pt-5 border-t border-white/10">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Popular Routes</div>
                      <div className="space-y-2">
                        {['sacatepequez', 'solola', 'peten', 'alta-verapaz'].map(id => {
                          const dept = guatemalaDepartments.find(d => d.id === id)
                          const pricing = ROUTE_PRICING[`guatemala-${id}`]
                          if (!dept || !pricing) return null
                          return (
                            <button
                              key={id}
                              onClick={() => setSelectedDestination(id)}
                              className="w-full flex items-center justify-between p-2.5 bg-white/5 hover:bg-white/10 rounded-soft transition-colors text-left"
                            >
                              <div>
                                <div className="text-white text-sm font-medium">{dept.name}</div>
                                <div className="text-gray-500 text-xs">{pricing.flightTime} • {pricing.distance}</div>
                              </div>
                              <div className="text-gold-400 font-semibold">${pricing.price}</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div className="mt-4 text-center">
                  <p className="text-gray-500 text-sm">
                    Want a scenic tour?{' '}
                    <Link href="/book/experiences" className="text-gold-400 hover:underline">
                      Browse experiences →
                    </Link>
                  </p>
                </div>
              </div>

              {/* Right Panel - Map */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                <div className="h-[400px] lg:h-[550px] rounded-soft overflow-hidden border border-white/10">
                  <SafeMapWrapper
                    onDepartmentClick={(dept: Department) => {
                      if (dept.id !== 'guatemala') {
                        setSelectedDestination(dept.id)
                      }
                    }}
                    selectedFrom="guatemala"
                    selectedTo={selectedDestination || undefined}
                    mode="to"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white dark:bg-luxury-charcoal py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-luxury-black dark:text-white mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From executive transport to unforgettable aerial experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Transport */}
            <div className="card-feature">
              <h3 className="text-2xl font-bold text-luxury-black dark:text-white mb-4">
                {t('services.transport.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('services.transport.description')}
              </p>
              <ul className="space-y-3 mb-8 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                  Guatemala City to any destination
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                  Inter-city business transfers
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                  Up to 5 passengers per flight
                </li>
              </ul>
              <Link
                href="/book/transport"
                className="inline-flex items-center gap-2 text-primary-600 dark:text-gold-400 font-semibold hover:gap-3 transition-all"
              >
                Book Transport <span>&rarr;</span>
              </Link>
            </div>

            {/* Experiences */}
            <div className="card-feature">
              <h3 className="text-2xl font-bold text-luxury-black dark:text-white mb-4">
                {t('services.experiences.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('services.experiences.description')}
              </p>
              <ul className="space-y-3 mb-8 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                  Lake Atitlan scenic tours
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                  Tikal archaeological flights
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                  Volcano discovery expeditions
                </li>
              </ul>
              <Link
                href="/book/experiences"
                className="inline-flex items-center gap-2 text-primary-600 dark:text-gold-400 font-semibold hover:gap-3 transition-all"
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
              className="btn-ghost-dark text-lg px-10 py-4"
            >
              View Experiences
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
