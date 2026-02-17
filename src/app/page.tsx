'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Shield, Clock, Star, MapPin, ChevronDown, Plane, DollarSign, Facebook, Instagram, Phone } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { MobileNav } from '@/components/mobile-nav'
import { useAuthStore } from '@/lib/auth-store'
import { logout } from '@/lib/auth-client'
import { PhotoGallery } from '@/components/PhotoGallery'
import { HeroCarousel } from '@/components/HeroCarousel'
import { guatemalaDepartments, type Department } from '@/lib/guatemala-departments'
import dynamic from 'next/dynamic'

/** FlyInGuate brand logo hosted on wsimg CDN. */
const LOGO_URL = 'https://isteam.wsimg.com/ip/5d044532-96be-44dc-9d52-5a4c26b5b2e3/Logo_FlyInGuatemala_c03.png'

/** Hero carousel images — uploaded to Irys devnet. */
const HERO_IMAGES = [
  'https://devnet.irys.xyz/AGXhj5MZqgTZAtwf3MTsQwsxxmfSNrRtP9xMWLd1XtHi',
  'https://devnet.irys.xyz/Gtu4qPPPuPdDXo27kPZR8bc3HRULPyUCeXobbT1ECJNM',
  'https://devnet.irys.xyz/EcwWSNgGSMjYqwXZBiXAqvJXAJ1Sah1V2b51HN28iJBV',
  'https://devnet.irys.xyz/BjHCQM1iwcVJUJjmMKDi1hCXLRsaiWipnkqUtiAhMiZN',
  'https://devnet.irys.xyz/8dNbk9G62suNFHYcEntbWK7hKyrn8zJXbz6YWc5Dydjz',
  'https://devnet.irys.xyz/59pb987poVtAH6EhXsEtdCWQG9fe8tEtHzexcWuy9enP',
]

/**
 * Lazily loaded map component. Detects WebGL support at runtime:
 * - WebGL available → renders MapLibre GL (vector tiles, 3D terrain).
 * - No WebGL       → falls back to Leaflet (raster tiles).
 * SSR is disabled because both renderers require browser APIs (canvas/WebGL).
 */
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


/**
 * Pricing constants for dynamic route calculation.
 * - BASE_PRICE_PER_KM: Cost per kilometer of flight distance (USD).
 * - MINIMUM_FLIGHT_PRICE: Floor price regardless of distance (USD).
 *
 * Passenger surcharges are handled separately in the component
 * (+25% per additional passenger beyond the base of 2).
 */
const BASE_PRICE_PER_KM = 12 // USD per km
const MINIMUM_FLIGHT_PRICE = 750

/**
 * Calculates flight pricing between two Guatemalan departments using
 * the Haversine formula for great-circle distance.
 *
 * @param fromId - Department ID for the origin (e.g. 'guatemala')
 * @param toId   - Department ID for the destination (e.g. 'peten')
 * @returns Object with `price` (USD, rounded to nearest $50),
 *          `distance` (e.g. "285 km"), and `flightTime` (e.g. "90 min"),
 *          or null if either department is missing or origin === destination.
 *
 * Flight time assumes an average helicopter speed of 200 km/h
 * plus 5 minutes for takeoff/landing overhead.
 */
function calculateRoutePrice(fromId: string, toId: string): { price: number; distance: string; flightTime: string } | null {
  const fromDept = guatemalaDepartments.find(d => d.id === fromId)
  const toDept = guatemalaDepartments.find(d => d.id === toId)

  if (!fromDept || !toDept || fromId === toId) return null

  const lat1 = fromDept.coordinates[0]
  const lon1 = fromDept.coordinates[1]
  const lat2 = toDept.coordinates[0]
  const lon2 = toDept.coordinates[1]

  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c

  const flightMinutes = Math.round((distance / 200) * 60) + 5

  const rawPrice = distance * BASE_PRICE_PER_KM
  const price = Math.max(MINIMUM_FLIGHT_PRICE, Math.round(rawPrice / 50) * 50)

  return {
    price,
    distance: `${Math.round(distance)} km`,
    flightTime: `${flightMinutes} min`
  }
}

/**
 * HomePage — Landing page and primary booking interface for FlyInGuate.
 *
 * Layout (top to bottom):
 *  1. **Hero section** — Full-viewport background image, logo, headline,
 *     trust indicators (licensed, 24/7, premium fleet).
 *  2. **Booking section** — Interactive map (MapLibre w/ Leaflet fallback)
 *     paired with a route/pricing panel. Users click the map to set
 *     origin and destination, choose passenger count (1-5), and see
 *     live pricing before navigating to `/book/transport`.
 *  3. **Services section** — Transport vs. Experiences feature cards.
 *  4. **Photo gallery** — Fetched from API, expandable grid w/ lightbox.
 *  5. **Footer CTA** — Final "Book Now" / "View Experiences" call to action.
 *
 * Key behaviours:
 *  - Default origin is Guatemala City ('guatemala'). Map starts in
 *    "select destination" mode; clicking a department sets the destination.
 *  - Toggle between 'from' and 'to' select modes via overlay buttons on the map.
 *  - Pricing is computed client-side via {@link calculateRoutePrice} and
 *    adjusted for passenger count (+25% per passenger beyond 2).
 *  - Authenticated users see Dashboard/Admin/Sign Out links;
 *    guests see Login/Register and Pilot Opportunities.
 *  - All user-facing strings come from `useTranslation()` (EN/ES).
 */
export default function HomePage() {
  const { t } = useTranslation()
  const { profile } = useAuthStore()
  const router = useRouter()

  const [selectedOrigin, setSelectedOrigin] = useState<string>('guatemala')
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null)
  const [passengerCount, setPassengerCount] = useState(2)
  const [selectMode, setSelectMode] = useState<'from' | 'to'>('to')

  /** Resolved Department object for the current origin. */
  const originDept = useMemo(() => {
    return guatemalaDepartments.find(d => d.id === selectedOrigin)
  }, [selectedOrigin])

  /** Resolved Department object for the current destination (null until selected). */
  const destinationDept = useMemo(() => {
    if (!selectedDestination) return null
    return guatemalaDepartments.find(d => d.id === selectedDestination)
  }, [selectedDestination])

  /** Base route pricing (distance, flight time, price) — null until both endpoints are set. */
  const routePricing = useMemo(() => {
    if (!selectedOrigin || !selectedDestination) return null
    return calculateRoutePrice(selectedOrigin, selectedDestination)
  }, [selectedOrigin, selectedDestination])

  /**
   * Final price adjusted for passenger count.
   * Base rate covers 2 passengers; each additional passenger adds 25% of the base price.
   */
  const adjustedPrice = useMemo(() => {
    if (!routePricing) return 0
    const additionalPassengers = Math.max(0, passengerCount - 2)
    return routePricing.price + (additionalPassengers * Math.round(routePricing.price * 0.25))
  }, [routePricing, passengerCount])

  /** Clears auth state and redirects to the landing page. */
  const handleSignOut = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-luxury-black">
      {/* Hero Section - Full viewport height with background */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background Carousel with Overlay */}
        <HeroCarousel images={HERO_IMAGES} />

        {/* Navigation - z-50 ensures MobileNav overlay/panel paint above hero content (z-10) */}
        <div className="relative z-50">
          <MobileNav
            customActions={
              <div className="hidden md:flex items-center space-x-4">
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
      <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Plan Your Flight
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select your origin and destination on the map to see flight details and pricing
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-6 items-start">
              {/* Left Panel - Pricing/Selection */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <div className="bg-gray-100 border border-gray-200 rounded-soft p-5">
                  {/* Route Display */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">From</span>
                      </div>
                      <div className="text-gray-900 font-semibold">{originDept?.name || 'Select origin'}</div>
                      {originDept?.airports?.[0] && (
                        <div className="text-sm text-gold-600">{originDept.airports[0].code}</div>
                      )}
                    </div>
                    <Plane className="h-5 w-5 text-gold-600 rotate-90" />
                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">To</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      </div>
                      <div className="text-gray-900 font-semibold">{destinationDept?.name || 'Select destination'}</div>
                      {destinationDept?.destinations?.[0] && (
                        <div className="text-sm text-gray-600">{destinationDept.destinations[0]}</div>
                      )}
                    </div>
                  </div>

                  {/* Passenger Count Selector */}
                  <div className="mb-5">
                    <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Passengers</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                        className="w-10 h-10 rounded-soft bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold transition-colors"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-2xl font-bold text-gray-900">{passengerCount}</span>
                        <span className="text-gray-600 text-sm ml-1">passenger{passengerCount !== 1 ? 's' : ''}</span>
                      </div>
                      <button
                        onClick={() => setPassengerCount(Math.min(5, passengerCount + 1))}
                        className="w-10 h-10 rounded-soft bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1">Max 5 passengers per flight</p>
                  </div>

                  {/* Flight Details & Pricing (if route selected) */}
                  {routePricing ? (
                    <>
                      {/* Flight Details */}
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-gray-200 rounded-soft p-3 text-center">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Distance</div>
                          <div className="text-gray-900 font-medium">{routePricing.distance}</div>
                        </div>
                        <div className="bg-gray-200 rounded-soft p-3 text-center">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Flight</div>
                          <div className="text-gray-900 font-medium">{routePricing.flightTime}</div>
                        </div>
                        <div className="bg-gray-200 rounded-soft p-3 text-center">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Aircraft</div>
                          <div className="text-gray-900 font-medium">Bell 407</div>
                        </div>
                      </div>

                      {/* Price Card - Enhanced for visibility */}
                      <div className="bg-gradient-to-br from-gold-500 to-gold-600 border-2 border-gold-700 rounded-soft p-5 text-center mb-5 shadow-lg">
                        <div className="text-xs text-gray-900 uppercase tracking-wide mb-1 font-medium">Roundtrip ({passengerCount} passenger{passengerCount !== 1 ? 's' : ''})</div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <DollarSign className="h-8 w-8 text-gray-900" />
                          <span className="text-4xl font-bold text-gray-900">{adjustedPrice.toLocaleString()}</span>
                          <span className="text-gray-800 text-sm self-end mb-1 font-medium">USD</span>
                        </div>
                        <div className="text-sm text-gray-800 mb-4 font-medium">
                          ${Math.round(adjustedPrice / passengerCount).toLocaleString()} per person
                        </div>
                        <button
                          onClick={() => {
                            const params = new URLSearchParams()
                            params.set('from', selectedOrigin)
                            params.set('to', selectedDestination!)
                            params.set('passengers', passengerCount.toString())
                            router.push(`/book/transport?${params.toString()}`)
                          }}
                          className="w-full bg-gray-900 text-gold-400 font-semibold uppercase tracking-wider py-3 rounded-soft hover:bg-gray-800 transition-colors"
                        >
                          Book This Flight
                        </button>
                      </div>

                      {/* Destinations in area */}
                      {destinationDept && (
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Destinations in {destinationDept.name}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {destinationDept.destinations.map(dest => (
                              <span key={dest} className="px-2.5 py-1 bg-gray-200 rounded-full text-xs text-gray-700">
                                {dest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Prompt to complete selection */
                    <div className="text-center py-4">
                      <MapPin className="h-10 w-10 text-gold-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {!selectedOrigin && !selectedDestination
                          ? 'Select Your Route'
                          : !selectedDestination
                            ? 'Now Select Destination'
                            : 'Select Origin Point'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Click on the map to set your {selectMode === 'from' ? 'origin' : 'destination'} point
                      </p>

                      {/* Quick destination list */}
                      <div className="mt-5 pt-5 border-t border-gray-200 text-left">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Popular Destinations</div>
                        <div className="space-y-2">
                          {['sacatepequez', 'solola', 'peten', 'alta-verapaz'].map(id => {
                            const dept = guatemalaDepartments.find(d => d.id === id)
                            const pricing = calculateRoutePrice(selectedOrigin, id)
                            if (!dept || !pricing) return null
                            return (
                              <button
                                key={id}
                                onClick={() => setSelectedDestination(id)}
                                className="w-full flex items-center justify-between p-2.5 bg-gray-200 hover:bg-gray-300 rounded-soft transition-colors text-left"
                              >
                                <div>
                                  <div className="text-gray-900 text-sm font-medium">{dept.name}</div>
                                  <div className="text-gray-500 text-xs">{pricing.flightTime} • {pricing.distance}</div>
                                </div>
                                <div className="text-gold-600 font-semibold">${pricing.price}</div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Links */}
                <div className="mt-4 text-center">
                  <p className="text-gray-600 text-sm">
                    Want a scenic tour?{' '}
                    <Link href="/book/experiences" className="text-gold-600 hover:underline font-medium">
                      Browse experiences →
                    </Link>
                  </p>
                </div>
              </div>

              {/* Right Panel - Map */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                <div className="relative h-[400px] lg:h-[550px] rounded-soft overflow-hidden border border-gray-300 shadow-lg">
                  <SafeMapWrapper
                    onDepartmentClick={(dept: Department) => {
                      if (selectMode === 'from') {
                        if (dept.id !== selectedDestination) {
                          setSelectedOrigin(dept.id)
                          setSelectMode('to') // Auto-switch to destination mode
                        }
                      } else {
                        if (dept.id !== selectedOrigin) {
                          setSelectedDestination(dept.id)
                        }
                      }
                    }}
                    selectedFrom={selectedOrigin}
                    selectedTo={selectedDestination || undefined}
                    mode={selectMode === 'from' ? 'from' : 'to'}
                  />

                  {/* Selection Mode Toggle - Overlaid on Map */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-1 bg-white rounded-full p-1 shadow-lg border border-gray-300">
                    <button
                      onClick={() => setSelectMode('from')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectMode === 'from'
                          ? 'bg-green-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      Origin
                    </button>
                    <button
                      onClick={() => setSelectMode('to')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectMode === 'to'
                          ? 'bg-red-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-400"></span>
                      Destination
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-black py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Our Services
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From executive transport to unforgettable aerial experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Transport */}
            <div className="card-feature">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('services.transport.title')}
              </h3>
              <p className="text-gray-400 mb-6">
                {t('services.transport.description')}
              </p>
              <ul className="space-y-3 mb-8 text-gray-400">
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
                className="inline-flex items-center gap-2 text-gold-400 font-semibold hover:gap-3 transition-all"
              >
                Book Transport <span>&rarr;</span>
              </Link>
            </div>

            {/* Experiences */}
            <div className="card-feature">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('services.experiences.title')}
              </h3>
              <p className="text-gray-400 mb-6">
                {t('services.experiences.description')}
              </p>
              <ul className="space-y-3 mb-8 text-gray-400">
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
                className="inline-flex items-center gap-2 text-gold-400 font-semibold hover:gap-3 transition-all"
              >
                Explore Experiences <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <PhotoGallery />
        </div>
      </div>

      {/* Social Media Section */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-widest mb-8">
            {t('footer.follow_us')}
          </h2>
          <div className="w-16 h-0.5 bg-white mx-auto mb-10" />
          <div className="flex items-center justify-center gap-10">
            <a
              href="https://www.facebook.com/flyinguate"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gold-400 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-14 w-14" strokeWidth={1.5} />
            </a>
            <a
              href="https://www.instagram.com/flyinguate"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gold-400 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-14 w-14" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Links & Info */}
      <div className="bg-white text-gray-900 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
            <Link href="/book/transport" className="text-sm uppercase tracking-widest hover:text-gold-600 transition-colors">
              {t('nav.destinations')}
            </Link>
            <Link href="/book/experiences" className="text-sm uppercase tracking-widest hover:text-gold-600 transition-colors">
              {t('nav.experiences')}
            </Link>
            <Link href="/book/transport" className="text-sm uppercase tracking-widest hover:text-gold-600 transition-colors">
              {t('nav.book_flight')}
            </Link>
            <Link href="/book/transport" className="text-sm uppercase tracking-widest hover:text-gold-600 transition-colors">
              {t('nav.executive_services')}
            </Link>
            <Link href="/faq" className="text-sm uppercase tracking-widest hover:text-gold-600 transition-colors">
              {t('nav.faq')}
            </Link>
            <Link href="/privacy" className="text-sm uppercase tracking-widest hover:text-gold-600 transition-colors">
              {t('nav.privacy_policy')}
            </Link>
            <Link href="/contact" className="text-sm uppercase tracking-widest hover:text-gold-600 transition-colors">
              {t('nav.contact')}
            </Link>
          </div>

          {/* Company Info */}
          <div className="text-center">
            <h3 className="text-xl font-bold mb-3">FlyInGuate</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-700 mb-8">
              <Phone className="h-4 w-4" />
              <span className="font-medium">+502 5550-7700 / 3000-7700</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-500">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
