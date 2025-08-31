'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/auth-store'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Sparkles, Calendar, Users, Clock, MapPin, CheckCircle, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

interface Experience {
  id: string
  name: string
  name_es: string | null
  description: string
  description_es: string | null
  duration_hours: number
  duration_minutes: number | null
  base_price: number
  max_passengers: number
  min_passengers: number
  includes: string[]
  includes_es: string[] | null
  location: string
  aircraft_options: any
  route_waypoints: string[]
  category: string
  image_url: string | null
  category_name_en: string | null
  category_name_es: string | null
}

export default function BookExperiencesPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const { t, locale } = useTranslation()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    passengers: 2,
    notes: '',
    aircraftOption: 0,
  })

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⏰ Fetch timeout, falling back to demo data')
        setDemoExperiences()
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    fetchExperiences()

    return () => clearTimeout(timeoutId)
  }, [])

  const fetchExperiences = async () => {
    console.log('🔄 fetchExperiences started')
    setLoading(true) // Ensure loading is set to true at start
    
    try {
      // First try the regular experiences table
      console.log('📡 Querying experiences table...')
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('is_active', true)
        .order('base_price')

      console.log('📊 Query result:', { dataLength: data?.length, error: error?.message })

      if (data && data.length > 0) {
        // Map the data to include multilingual fields with defaults
        console.log('✅ Processing real experiences data')
        const mappedData = data.map((exp: any) => ({
          ...exp,
          name_es: exp.name_es || exp.name,
          description_es: exp.description_es || exp.description,
          includes_es: exp.includes_es || exp.includes,
          duration_minutes: exp.duration_minutes || Math.round(exp.duration_hours * 60),
          min_passengers: exp.min_passengers || 1,
          aircraft_options: exp.aircraft_options || [{"aircraft": "Robinson R44 II", "capacity": 3, "price": exp.base_price}],
          route_waypoints: exp.route_waypoints || [],
          category: exp.category || 'scenic',
          category_name_en: exp.category || 'Scenic Tours',
          category_name_es: exp.category || 'Tours Panorámicos'
        }))
        setExperiences(mappedData)
        const uniqueCategories = Array.from(new Set(mappedData.map((exp: any) => exp.category).filter(Boolean)))
        setCategories(uniqueCategories)
      } else {
        console.warn('⚠️ No experiences found, using demo data:', error?.message || 'Table empty')
        // Fallback to demo data
        setDemoExperiences()
      }
    } catch (err: any) {
      console.error('❌ Error in fetchExperiences:', err?.message || err)
      setDemoExperiences()
    } finally {
      console.log('✅ fetchExperiences completed, setting loading to false')
      setLoading(false)
    }
  }

  const setDemoExperiences = () => {
    const demoData: Experience[] = [
      {
        id: '1',
        name: 'Heli-Tour Ciudad, Antigua & Laguna Calderas',
        name_es: 'Heli-Tour Ciudad, Antigua y Laguna Calderas',
        description: 'Panoramic tour of Guatemala City, colonial Antigua, Pacaya Volcano, and Amatitlán Lake in 35 unforgettable minutes',
        description_es: 'Tour panorámico de Ciudad de Guatemala, la colonial Antigua, volcán Pacaya y lago de Amatitlán en 35 minutos inolvidables',
        duration_hours: 0.58,
        duration_minutes: 35,
        base_price: 479,
        max_passengers: 3,
        min_passengers: 2,
        includes: ['Professional pilot', 'Aerial photography', 'Safety briefing', 'Stunning views'],
        includes_es: ['Piloto profesional', 'Fotografía aérea', 'Briefing de seguridad', 'Vistas impresionantes'],
        location: 'Guatemala City - Antigua',
        aircraft_options: [{"aircraft": "Robinson R44 II", "capacity": 3, "price": 479}],
        route_waypoints: ['Guatemala City', 'Antigua Guatemala', 'Pacaya Volcano', 'Lake Amatitlán'],
        category: 'scenic',
        image_url: null,
        category_name_en: 'Scenic Tours',
        category_name_es: 'Tours Panorámicos'
      },
      {
        id: '2',
        name: 'Panoramic Overflight - 45 min',
        name_es: 'Sobrevuelo Panorámico - 45 min',
        description: 'Extended panoramic tour featuring Guatemala City, Antigua, surrounding volcanoes, and pristine lakes',
        description_es: 'Tour panorámico extendido que incluye Ciudad de Guatemala, Antigua, volcanes circundantes y lagos prístinos',
        duration_hours: 0.75,
        duration_minutes: 45,
        base_price: 745,
        max_passengers: 4,
        min_passengers: 2,
        includes: ['Professional pilot', 'Extended route', 'Multiple aircraft options', 'Scenic photography stops'],
        includes_es: ['Piloto profesional', 'Ruta extendida', 'Múltiples opciones de aeronave', 'Paradas fotográficas panorámicas'],
        location: 'Guatemala City - Antigua - Volcanoes',
        aircraft_options: [{"aircraft": "Robinson R44 II", "capacity": 3, "price": 745}, {"aircraft": "Robinson R66", "capacity": 4, "price": 979}],
        route_waypoints: ['Guatemala City', 'Antigua Guatemala', 'Agua Volcano', 'Fuego Volcano', 'Acatenango Volcano'],
        category: 'scenic',
        image_url: null,
        category_name_en: 'Scenic Tours',
        category_name_es: 'Tours Panorámicos'
      },
      {
        id: '3',
        name: 'Romantic Heli-Tour',
        name_es: 'Heli-Tour Romántico',
        description: 'Special romantic helicopter experience with flowers, champagne, and photography time for unforgettable moments',
        description_es: 'Experiencia romántica especial en helicóptero con flores, champán y tiempo para fotografías en momentos inolvidables',
        duration_hours: 0.58,
        duration_minutes: 35,
        base_price: 525,
        max_passengers: 2,
        min_passengers: 2,
        includes: ['Professional pilot', 'Fresh flowers', 'Champagne service', 'Professional photography', 'Romantic setup'],
        includes_es: ['Piloto profesional', 'Flores frescas', 'Servicio de champán', 'Fotografía profesional', 'Ambiente romántico'],
        location: 'Romantic scenic route',
        aircraft_options: [{"aircraft": "Robinson R44 II", "capacity": 2, "price": 525}],
        route_waypoints: ['Romantic viewpoints', 'Sunset locations', 'Private moments'],
        category: 'romantic',
        image_url: null,
        category_name_en: 'Romantic Experiences',
        category_name_es: 'Experiencias Románticas'
      },
      {
        id: '4',
        name: 'Four Volcanoes Tour',
        name_es: 'Tour de Cuatro Volcanes',
        description: 'Epic helicopter journey to witness Guatemala\'s most spectacular volcanoes: Agua, Fuego, Acatenango, and Pacaya',
        description_es: 'Épico viaje en helicóptero para presenciar los volcanes más espectaculares de Guatemala: Agua, Fuego, Acatenango y Pacaya',
        duration_hours: 2.5,
        duration_minutes: 150,
        base_price: 1899,
        max_passengers: 4,
        min_passengers: 2,
        includes: ['Professional pilot', 'Four volcano circuit', 'Geological insights', 'Aerial photography', 'Safety equipment'],
        includes_es: ['Piloto profesional', 'Circuito de cuatro volcanes', 'Conocimientos geológicos', 'Fotografía aérea', 'Equipo de seguridad'],
        location: 'Volcano circuit',
        aircraft_options: [{"aircraft": "Robinson R66", "capacity": 4, "price": 1899}, {"aircraft": "Airbus H125", "capacity": 5, "price": 2299}],
        route_waypoints: ['Agua Volcano', 'Fuego Volcano', 'Acatenango Volcano', 'Pacaya Volcano'],
        category: 'volcano',
        image_url: null,
        category_name_en: 'Volcano Tours',
        category_name_es: 'Tours de Volcanes'
      },
      {
        id: '5',
        name: 'Tikal National Park Expedition',
        name_es: 'Expedición Parque Nacional Tikal',
        description: 'Full day helicopter expedition to Tikal with guided tour of ancient Mayan pyramids and jungle exploration',
        description_es: 'Expedición de día completo en helicóptero a Tikal con tour guiado de pirámides mayas antiguas y exploración de la selva',
        duration_hours: 8.0,
        duration_minutes: 480,
        base_price: 4500,
        max_passengers: 6,
        min_passengers: 2,
        includes: ['Round trip helicopter', 'Professional guide', 'Tikal entrance fees', 'Lunch', 'Mayan ruins tour', 'Jungle wildlife'],
        includes_es: ['Helicóptero ida y vuelta', 'Guía profesional', 'Tarifas de entrada a Tikal', 'Almuerzo', 'Tour ruinas mayas', 'Vida silvestre de la selva'],
        location: 'Tikal, Petén',
        aircraft_options: [{"aircraft": "Bell 206 LongRanger", "capacity": 6, "price": 4500}, {"aircraft": "Airbus AS 350", "capacity": 5, "price": 5200}],
        route_waypoints: ['Guatemala City', 'Flores', 'Tikal National Park', 'El Mirador viewpoint'],
        category: 'cultural',
        image_url: null,
        category_name_en: 'Cultural Tours',
        category_name_es: 'Tours Culturales'
      },
      {
        id: '6',
        name: 'Lake Atitlán Complete Experience',
        name_es: 'Experiencia Completa Lago Atitlán',
        description: 'Helicopter flight to stunning Lake Atitlán with hotel landing, boat tour, and indigenous village visits',
        description_es: 'Vuelo en helicóptero al impresionante Lago Atitlán con aterrizaje en hotel, tour en lancha y visitas a pueblos indígenas',
        duration_hours: 5.0,
        duration_minutes: 300,
        base_price: 2299,
        max_passengers: 4,
        min_passengers: 2,
        includes: ['Helicopter to lake', 'Hotel Casa Palopó landing', 'Boat tour', 'Indigenous villages', 'Local lunch', 'Cultural experience'],
        includes_es: ['Helicóptero al lago', 'Aterrizaje Hotel Casa Palopó', 'Tour en lancha', 'Pueblos indígenas', 'Almuerzo local', 'Experiencia cultural'],
        location: 'Lake Atitlán',
        aircraft_options: [{"aircraft": "Robinson R66", "capacity": 4, "price": 2299}, {"aircraft": "Bell 206", "capacity": 4, "price": 2699}],
        route_waypoints: ['Guatemala City', 'Lake Atitlán', 'Panajachel', 'Santiago Atitlán', 'San Pedro'],
        category: 'cultural',
        image_url: null,
        category_name_en: 'Cultural Tours',
        category_name_es: 'Tours Culturales'
      },
      {
        id: '7',
        name: 'Monterrico Beach Experience',
        name_es: 'Experiencia Playa Monterrico',
        description: 'Helicopter flight to Guatemala\'s famous black sand beaches with beach time and turtle conservation visit',
        description_es: 'Vuelo en helicóptero a las famosas playas de arena negra de Guatemala con tiempo en la playa y visita de conservación de tortugas',
        duration_hours: 4.0,
        duration_minutes: 240,
        base_price: 1599,
        max_passengers: 4,
        min_passengers: 2,
        includes: ['Beach helicopter landing', 'Black sand beaches', 'Turtle conservation center', 'Lunch included', 'Beach time'],
        includes_es: ['Aterrizaje en helicóptero en playa', 'Playas de arena negra', 'Centro de conservación de tortugas', 'Almuerzo incluido', 'Tiempo en playa'],
        location: 'Monterrico, Pacific Coast',
        aircraft_options: [{"aircraft": "Robinson R66", "capacity": 4, "price": 1599}, {"aircraft": "Bell 206", "capacity": 4, "price": 1899}],
        route_waypoints: ['Guatemala City', 'Pacific Coast', 'Monterrico Beach', 'Turtle Sanctuary'],
        category: 'beach',
        image_url: null,
        category_name_en: 'Beach & Coast',
        category_name_es: 'Playa y Costa'
      },
      {
        id: '8',
        name: 'Seven Volcanoes + Atitlán Tour',
        name_es: 'Tour Siete Volcanes + Atitlán',
        description: 'Ultimate helicopter experience covering seven volcanoes and Lake Atitlán in one spectacular journey',
        description_es: 'Experiencia definitiva en helicóptero cubriendo siete volcanes y el Lago Atitlán en un viaje espectacular',
        duration_hours: 3.5,
        duration_minutes: 210,
        base_price: 3299,
        max_passengers: 4,
        min_passengers: 2,
        includes: ['Seven volcano circuit', 'Lake Atitlán overflight', 'Professional commentary', 'Aerial photography', 'Premium experience'],
        includes_es: ['Circuito de siete volcanes', 'Sobrevuelo Lago Atitlán', 'Comentario profesional', 'Fotografía aérea', 'Experiencia premium'],
        location: 'Multi-volcano circuit',
        aircraft_options: [{"aircraft": "Bell 206 LongRanger", "capacity": 4, "price": 3299}, {"aircraft": "Airbus AS 350", "capacity": 5, "price": 3799}],
        route_waypoints: ['All major volcanoes', 'Lake Atitlán', 'Scenic viewpoints'],
        category: 'volcano',
        image_url: null,
        category_name_en: 'Volcano Tours',
        category_name_es: 'Tours de Volcanes'
      }
    ]
    setExperiences(demoData)
    setCategories(['scenic', 'romantic', 'volcano', 'cultural', 'beach'])
  }

  const getDisplayName = (experience: Experience) => {
    return locale === 'es' && experience.name_es ? experience.name_es : experience.name
  }

  const getDisplayDescription = (experience: Experience) => {
    return locale === 'es' && experience.description_es ? experience.description_es : experience.description
  }

  const getDisplayIncludes = (experience: Experience) => {
    return locale === 'es' && experience.includes_es ? experience.includes_es : experience.includes
  }

  const getCategoryName = (experience: Experience) => {
    return locale === 'es' && experience.category_name_es ? experience.category_name_es : (experience.category_name_en || experience.category)
  }

  const filteredExperiences = selectedCategory === 'all' 
    ? experiences 
    : experiences.filter(exp => exp.category === selectedCategory)

  const calculatePrice = () => {
    if (!selectedExperience || !selectedExperience.aircraft_options) return 0
    const aircraftOption = selectedExperience.aircraft_options[formData.aircraftOption]
    if (!aircraftOption) return selectedExperience.base_price * formData.passengers
    return aircraftOption.price * Math.min(formData.passengers / aircraftOption.capacity, 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExperience) return
    
    // Check if user is logged in
    if (!profile?.id) {
      setError(locale === 'es' ? 'Por favor inicie sesión para reservar una experiencia' : 'Please log in to book an experience')
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?redirect=/book/experiences')
      }, 2000)
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          client_id: profile.id,
          booking_type: 'experience',
          experience_id: selectedExperience.id,
          scheduled_date: formData.date,
          scheduled_time: formData.time,
          passenger_count: formData.passengers,
          notes: formData.notes,
          total_price: calculatePrice(),
        })
        .select()

      if (error) throw error

      // Show success message
      setError('')
      alert(locale === 'es' ? '¡Reserva exitosa! Redirigiendo a su panel...' : 'Booking successful! Redirecting to your dashboard...')
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-luxury-black text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Sparkles className="h-8 w-8 text-luxury-gold" />
            <span className="text-2xl font-bold">FlyInGuate</span>
          </Link>
          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
            {profile ? (
              <div className="text-sm">
                {t('common.welcome')}, {profile?.full_name || profile?.email}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-sm hover:text-luxury-gold">
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="text-sm bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('services.experiences.cta')}</h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        ) : !selectedExperience ? (
          <div>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {locale === 'es' ? 'Todas' : 'All'}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t(`category.${category}`)}
                </button>
              ))}
            </div>

            {/* Experiences Grid */}
            {filteredExperiences.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">{locale === 'es' ? 'No se encontraron experiencias.' : 'No experiences found.'}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperiences.map((experience) => (
                <div key={experience.id} className="card-luxury hover:scale-105 transition-transform cursor-pointer">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
                    {experience.image_url ? (
                      <img
                        src={experience.image_url}
                        alt={getDisplayName(experience)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-100 to-primary-200">
                        <Sparkles className="h-12 w-12 text-primary-600" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {getCategoryName(experience)}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{getDisplayName(experience)}</h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">{getDisplayDescription(experience)}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {experience.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {experience.duration_minutes ? `${experience.duration_minutes} ${t('common.minutes')}` : `${experience.duration_hours} ${t('common.hours')}`}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {experience.min_passengers === experience.max_passengers 
                        ? `${experience.max_passengers} ${t('common.passengers')}`
                        : `${experience.min_passengers}-${experience.max_passengers} ${t('common.passengers')}`
                      }
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary-900">
                        ${experience.base_price}
                      </span>
                      <span className="text-sm text-gray-600 ml-1">USD</span>
                    </div>
                    <button
                      onClick={() => setSelectedExperience(experience)}
                      className="btn-primary text-sm"
                    >
                      {t('common.select')}
                    </button>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setSelectedExperience(null)}
              className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {locale === 'es' ? 'Volver a experiencias' : 'Back to experiences'}
            </button>

            {/* Selected Experience Details */}
            <div className="card-luxury mb-6">
              <h2 className="text-2xl font-bold mb-4">{getDisplayName(selectedExperience)}</h2>
              <p className="text-gray-600 mb-4">{getDisplayDescription(selectedExperience)}</p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                    {selectedExperience.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2 text-primary-600" />
                    {selectedExperience.duration_minutes 
                      ? `${selectedExperience.duration_minutes} ${t('common.minutes')}`
                      : `${selectedExperience.duration_hours} ${t('common.hours')}`
                    }
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2 text-primary-600" />
                    {t('common.max')} {selectedExperience.max_passengers} {t('common.passengers')}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{locale === 'es' ? 'Incluye:' : 'Includes:'}</h3>
                  <ul className="space-y-1">
                    {getDisplayIncludes(selectedExperience).map((item, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="card-luxury space-y-6">
                <h3 className="text-xl font-semibold">{locale === 'es' ? 'Detalles de Reserva' : 'Booking Details'}</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('booking.form.date')}
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('booking.form.time')}
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('booking.form.passengers')}
                  </label>
                  <select
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {Array.from({ length: selectedExperience.max_passengers - selectedExperience.min_passengers + 1 }, (_, i) => selectedExperience.min_passengers + i).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? t('common.passenger') : t('common.passengers')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('booking.form.notes')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder={locale === 'es' ? 'Cualquier solicitud especial o preferencias...' : 'Any special requirements or preferences...'}
                  />
                </div>
              </div>

              <div className="card-luxury bg-primary-50 border-primary-200">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold text-primary-900">
                    {locale === 'es' ? 'Precio Total' : 'Total Price'}
                  </span>
                  <span className="text-3xl font-bold text-primary-900">
                    ${calculatePrice()}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedExperience(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('booking.form.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-luxury disabled:opacity-50"
                >
                  {loading ? (locale === 'es' ? 'Reservando...' : 'Booking...') : t('common.book_now')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}