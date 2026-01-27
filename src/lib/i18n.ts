///'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface I18nState {
  locale: 'en' | 'es'
  setLocale: (locale: 'en' | 'es') => void
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'flyinguate-locale',
    }
  )
)

// Translation function
export const t = (key: string, locale: 'en' | 'es' = 'en'): string => {
  const translations: Record<string, Record<'en' | 'es', string>> = {
    // Navigation
    'nav.home': { en: 'Home', es: 'Inicio' },
    'nav.dashboard': { en: 'Dashboard', es: 'Panel' },
    'nav.experiences': { en: 'Experiences', es: 'Experiencias' },
    'nav.transport': { en: 'Transport', es: 'Transporte' },
    'nav.pilot_opportunities': { en: 'Pilot Opportunities', es: 'Oportunidades para Pilotos' },
    'nav.login': { en: 'Login', es: 'Iniciar Sesión' },
    'nav.register': { en: 'Register', es: 'Registrarse' },

    // Homepage
    'hero.title': { 
      en: 'Experience Guatemala from Above', 
      es: 'Experimenta Guatemala desde las Alturas' 
    },
    'hero.subtitle': { 
      en: 'Premium helicopter transport and exclusive aerial experiences across Guatemala\'s most breathtaking destinations', 
      es: 'Transporte premium en helicóptero y experiencias aéreas exclusivas por los destinos más impresionantes de Guatemala' 
    },

    // Services
    'services.transport.title': { en: 'Direct Transport', es: 'Transporte Directo' },
    'services.transport.description': { 
      en: 'Point-to-point helicopter transport between airports and custom airfields. Fast, convenient, and luxurious travel across Guatemala.',
      es: 'Transporte en helicóptero punto a punto entre aeropuertos y pistas personalizadas. Viajes rápidos, convenientes y lujosos por Guatemala.'
    },
    'services.transport.cta': { en: 'Book Transport', es: 'Reservar Transporte' },
    
    'services.experiences.title': { en: 'Experiences', es: 'Experiencias' },
    'services.experiences.description': { 
      en: 'Curated aerial tours, hotel packages in Antigua and Lake Atitlán, and exclusive sightseeing experiences.',
      es: 'Tours aéreos curados, paquetes de hotel en Antigua y Lago Atitlán, y experiencias exclusivas de turismo.'
    },
    'services.experiences.cta': { en: 'Explore Experiences', es: 'Explorar Experiencias' },

    // How it works
    'how_it_works.title': { en: 'How It Works', es: 'Cómo Funciona' },
    'how_it_works.step1.title': { en: 'Book Your Flight', es: 'Reserva tu Vuelo' },
    'how_it_works.step1.description': { en: 'Choose transport or experience package', es: 'Elige transporte o paquete de experiencia' },
    'how_it_works.step2.title': { en: 'Get Confirmed', es: 'Obtén Confirmación' },
    'how_it_works.step2.description': { en: 'Receive confirmation with pilot details', es: 'Recibe confirmación con detalles del piloto' },
    'how_it_works.step3.title': { en: 'Fly in Style', es: 'Vuela con Estilo' },
    'how_it_works.step3.description': { en: 'Enjoy your premium helicopter experience', es: 'Disfruta tu experiencia premium en helicóptero' },

    // Booking forms
    'booking.title.transport': { en: 'Book Direct Transport', es: 'Reservar Transporte Directo' },
    'booking.form.from': { en: 'From', es: 'Desde' },
    'booking.form.to': { en: 'To', es: 'Hacia' },
    'booking.form.date': { en: 'Date', es: 'Fecha' },
    'booking.form.departure_date': { en: 'Departure Date', es: 'Fecha de Salida' },
    'booking.form.return_date': { en: 'Return Date', es: 'Fecha de Regreso' },
    'booking.form.time': { en: 'Preferred Time', es: 'Hora Preferida' },
    'booking.form.departure_time': { en: 'Departure Time', es: 'Hora de Salida' },
    'booking.form.return_time': { en: 'Return Time', es: 'Hora de Regreso' },
    'booking.form.passengers': { en: 'Passengers', es: 'Pasajeros' },
    'booking.form.num_passengers': { en: 'Number of Passengers', es: 'Número de Pasajeros' },
    'booking.form.passenger': { en: 'Passenger', es: 'Pasajero' },
    'booking.form.notes': { en: 'Special Requests (Optional)', es: 'Solicitudes Especiales (Opcional)' },
    'booking.form.aircraft': { en: 'Helicopter Selection', es: 'Selección de Helicóptero' },
    'booking.form.price_breakdown': { en: 'Price Breakdown', es: 'Desglose de Precio' },
    'booking.form.route_details': { en: 'Route Details', es: 'Detalles de Ruta' },
    'booking.form.schedule': { en: 'Schedule', es: 'Horario' },
    'booking.form.cancel': { en: 'Cancel', es: 'Cancelar' },
    'booking.form.book_flight': { en: 'Book Flight', es: 'Reservar Vuelo' },
    'booking.form.one_way': { en: 'One Way', es: 'Solo Ida' },
    'booking.form.round_trip': { en: 'Round Trip', es: 'Ida y Vuelta' },
    'booking.form.same_day': { en: 'Same Day', es: 'Mismo Día' },
    'booking.form.next_day': { en: 'Next Day', es: 'Día Siguiente' },
    'booking.form.custom_location': { en: 'Custom Location', es: 'Ubicación Personalizada' },
    'booking.form.enter_custom': { en: 'Enter custom location...', es: 'Ingresa ubicación personalizada...' },
    'booking.form.booking': { en: 'Booking...', es: 'Reservando...' },
    'booking.form.trip_type': { en: 'Trip Type:', es: 'Tipo de Viaje:' },
    'booking.form.each_way': { en: '(each way)', es: '(cada trayecto)' },
    'booking.form.one_way_price': { en: 'Base Price (One Way):', es: 'Precio Base (Solo Ida):' },
    'booking.form.estimated_price': { en: 'Estimated Base Price:', es: 'Precio Base Estimado:' },
    'booking.form.flight_details': { en: 'Flight Details', es: 'Detalles del Vuelo' },
    'booking.form.departure': { en: 'Departure', es: 'Salida' },
    'booking.form.special_requirements': { en: 'Any special requirements or preferences...', es: 'Cualquier requisito especial o preferencia...' },

    // Pricing
    'pricing.distance': { en: 'Distance', es: 'Distancia' },
    'pricing.flight_time': { en: 'Flight Time', es: 'Tiempo de Vuelo' },
    'pricing.base_price': { en: 'Base Price', es: 'Precio Base' },
    'pricing.additional_passengers': { en: 'Additional Passengers', es: 'Pasajeros Adicionales' },
    'pricing.total': { en: 'Total', es: 'Total' },
    'pricing.route': { en: 'Route', es: 'Ruta' },
    'pricing.select_destinations': { en: 'Select departure and destination to see pricing', es: 'Selecciona origen y destino para ver precios' },

    // Authentication
    'auth.welcome_back': { en: 'Welcome Back', es: 'Bienvenido de Vuelta' },
    'auth.sign_in_subtitle': { en: 'Sign in to your account', es: 'Inicia sesión en tu cuenta' },
    'auth.email': { en: 'Email Address', es: 'Correo Electrónico' },
    'auth.password': { en: 'Password', es: 'Contraseña' },
    'auth.signing_in': { en: 'Signing in...', es: 'Iniciando sesión...' },
    'auth.sign_in': { en: 'Sign In', es: 'Iniciar Sesión' },
    'auth.no_account': { en: "Don't have an account?", es: '¿No tienes una cuenta?' },
    'auth.sign_up': { en: 'Sign up', es: 'Registrarse' },
    'auth.create_account': { en: 'Create Account', es: 'Crear Cuenta' },
    'auth.join_today': { en: 'Join FlyInGuate today', es: 'Únete a FlyInGuate hoy' },
    'auth.account_type': { en: 'Account Type', es: 'Tipo de Cuenta' },
    'auth.client': { en: 'Client', es: 'Cliente' },
    'auth.book_flights': { en: 'Book flights', es: 'Reservar vuelos' },
    'auth.pilot': { en: 'Pilot', es: 'Piloto' },
    'auth.provide_services': { en: 'Provide services', es: 'Proveer servicios' },
    'auth.full_name': { en: 'Full Name', es: 'Nombre Completo' },
    'auth.phone': { en: 'Phone Number', es: 'Número de Teléfono' },
    'auth.creating_account': { en: 'Creating account...', es: 'Creando cuenta...' },
    'auth.have_account': { en: 'Already have an account?', es: '¿Ya tienes una cuenta?' },

    // Dashboard
    'dashboard.my_bookings': { en: 'My Bookings', es: 'Mis Reservas' },
    'dashboard.book_transport': { en: 'Book Transport', es: 'Reservar Transporte' },
    'dashboard.book_experience': { en: 'Book Experience', es: 'Reservar Experiencia' },
    'dashboard.no_bookings': { en: 'No bookings yet', es: 'Aún no hay reservas' },
    'dashboard.start_journey': { en: 'Start your journey by booking a flight or experience', es: 'Comienza tu viaje reservando un vuelo o experiencia' },
    'dashboard.my_profile': { en: 'My Profile', es: 'Mi Perfil' },
    'dashboard.sign_out': { en: 'Sign Out', es: 'Cerrar Sesión' },
    
    // Booking status
    'status.all': { en: 'All', es: 'Todos' },
    'status.pending': { en: 'Pending', es: 'Pendiente' },
    'status.approved': { en: 'Approved', es: 'Aprobado' },
    'status.assigned': { en: 'Assigned', es: 'Asignado' },
    'status.confirmed': { en: 'Confirmed', es: 'Confirmado' },
    'status.completed': { en: 'Completed', es: 'Completado' },
    'status.cancelled': { en: 'Cancelled', es: 'Cancelado' },
    'status.rejected': { en: 'Rejected', es: 'Rechazado' },

    // Common
    'common.minutes': { en: 'minutes', es: 'minutos' },
    'common.hours': { en: 'hours', es: 'horas' },
    'common.passenger': { en: 'Passenger', es: 'Pasajero' },
    'common.passengers': { en: 'Passengers', es: 'Pasajeros' },
    'common.loading': { en: 'Loading...', es: 'Cargando...' },
    'common.select': { en: 'Select', es: 'Seleccionar' },
    'common.book_now': { en: 'Book Now', es: 'Reservar Ahora' },
    'common.welcome': { en: 'Welcome', es: 'Bienvenido' },
    'common.max': { en: 'Max', es: 'Máx' },
    'common.cancel': { en: 'Cancel', es: 'Cancelar' },
    'common.confirm': { en: 'Confirm', es: 'Confirmar' },
    'common.save': { en: 'Save', es: 'Guardar' },
    'common.edit': { en: 'Edit', es: 'Editar' },
    'common.delete': { en: 'Delete', es: 'Eliminar' },
    'common.view': { en: 'View', es: 'Ver' },
    'common.total': { en: 'Total', es: 'Total' },
    'common.status': { en: 'Status', es: 'Estado' },
    'common.actions': { en: 'Actions', es: 'Acciones' },
    'common.date': { en: 'Date', es: 'Fecha' },
    'common.time': { en: 'Time', es: 'Hora' },
    'common.name': { en: 'Name', es: 'Nombre' },
    'common.email': { en: 'Email', es: 'Correo' },
    'common.phone': { en: 'Phone', es: 'Teléfono' },

    // Admin Panel
    'admin.title': { en: 'Admin Dashboard', es: 'Panel de Administración' },
    'admin.bookings': { en: 'Bookings', es: 'Reservas' },
    'admin.calendar': { en: 'Calendar', es: 'Calendario' },
    'admin.users': { en: 'Users', es: 'Usuarios' },
    'admin.pilots': { en: 'Pilots', es: 'Pilotos' },
    'admin.transactions': { en: 'Transactions', es: 'Transacciones' },
    'admin.choppers': { en: 'Choppers', es: 'Helicópteros' },
    'admin.analytics': { en: 'Analytics', es: 'Análisis' },
    'admin.user_management': { en: 'User Management', es: 'Gestión de Usuarios' },
    'admin.pilot_management': { en: 'Pilot Management', es: 'Gestión de Pilotos' },
    'admin.booking_management': { en: 'Booking Management', es: 'Gestión de Reservas' },
    'admin.transaction_management': { en: 'Transaction Management', es: 'Gestión de Transacciones' },
    'admin.flight_calendar': { en: 'Flight Calendar', es: 'Calendario de Vuelos' },
    'admin.weekly_view': { en: 'Weekly View', es: 'Vista Semanal' },
    'admin.previous_week': { en: 'Previous Week', es: 'Semana Anterior' },
    'admin.next_week': { en: 'Next Week', es: 'Próxima Semana' },
    'admin.assign_pilot': { en: 'Assign Pilot', es: 'Asignar Piloto' },
    'admin.assign_helicopter': { en: 'Assign Helicopter', es: 'Asignar Helicóptero' },
    'admin.verify_kyc': { en: 'Verify KYC', es: 'Verificar KYC' },
    'admin.approve': { en: 'Approve', es: 'Aprobar' },
    'admin.reject': { en: 'Reject', es: 'Rechazar' },
    'admin.pending_approval': { en: 'Pending Approval', es: 'Pendiente de Aprobación' },
    'admin.approved_today': { en: 'Approved Today', es: 'Aprobado Hoy' },
    'admin.total_revenue': { en: 'Total Revenue', es: 'Ingresos Totales' },
    'admin.active_bookings': { en: 'Active Bookings', es: 'Reservas Activas' },
    'admin.verified_pilots': { en: 'Verified Pilots', es: 'Pilotos Verificados' },
    'admin.awaiting_verification': { en: 'pilots awaiting verification', es: 'pilotos esperando verificación' },
    
    // Admin buttons and actions
    'admin.assign': { en: 'Assign', es: 'Asignar' },
    'admin.assign_flight': { en: 'Assign Flight', es: 'Asignar Vuelo' },
    'admin.approve_as_is': { en: 'Approve As-Is', es: 'Aprobar Tal Como Está' },
    'admin.approve_with_changes': { en: 'Approve with Changes', es: 'Aprobar con Cambios' },
    'admin.assign_pilot_aircraft': { en: 'Assign Pilot & Aircraft', es: 'Asignar Piloto y Aeronave' },
    'admin.approve_fund_account': { en: 'Approve & Fund Account', es: 'Aprobar y Financiar Cuenta' },
    'admin.reject_request': { en: 'Reject Request', es: 'Rechazar Solicitud' },
    'admin.assign_flight_crew': { en: 'Assign Flight Crew & Aircraft', es: 'Asignar Tripulación de Vuelo y Aeronave' },
    'admin.view_payment_proof': { en: 'View Payment Proof', es: 'Ver Comprobante de Pago' },
    'admin.create_user': { en: 'Create User', es: 'Crear Usuario' },
    'admin.edit_user': { en: 'Edit User', es: 'Editar Usuario' },
    'admin.save_changes': { en: 'Save Changes', es: 'Guardar Cambios' },
    'admin.close': { en: 'Close', es: 'Cerrar' },
    'admin.cancel': { en: 'Cancel', es: 'Cancelar' },
    'admin.submit': { en: 'Submit', es: 'Enviar' },
    'admin.select_pilot': { en: 'Select Pilot', es: 'Seleccionar Piloto' },
    'admin.select_helicopter': { en: 'Select Helicopter', es: 'Seleccionar Helicóptero' },
    'admin.filter_by_status': { en: 'Filter by Status', es: 'Filtrar por Estado' },
    'admin.all': { en: 'All', es: 'Todos' },
    'admin.view_details': { en: 'View Details', es: 'Ver Detalles' },
    'admin.edit_booking': { en: 'Edit Booking', es: 'Editar Reserva' },
    'admin.mark_completed': { en: 'Mark Completed', es: 'Marcar como Completado' },
    'admin.no_bookings': { en: 'No bookings found', es: 'No se encontraron reservas' },
    'admin.experiences': { en: 'Experiences', es: 'Experiencias' },
    'admin.destinations': { en: 'Destinations', es: 'Destinos' },
    'admin.aircrafts': { en: 'Aircraft', es: 'Aeronaves' },

    // Form fields
    'form.full_name': { en: 'Full Name', es: 'Nombre Completo' },
    'form.email': { en: 'Email', es: 'Correo Electrónico' },
    'form.phone': { en: 'Phone', es: 'Teléfono' },
    'form.role': { en: 'Role', es: 'Rol' },
    'form.password': { en: 'Password', es: 'Contraseña' },
    'form.client': { en: 'Client', es: 'Cliente' },
    'form.pilot': { en: 'Pilot', es: 'Piloto' },
    'form.admin': { en: 'Admin', es: 'Administrador' },
    
    // Transaction statuses
    'transaction.pending': { en: 'Pending', es: 'Pendiente' },
    'transaction.approved': { en: 'Approved', es: 'Aprobado' },
    'transaction.rejected': { en: 'Rejected', es: 'Rechazado' },
    
    // Financial Analytics
    'finance.client_balances': { en: 'Client Balances (Trust)', es: 'Saldos de Clientes (Fideicomiso)' },
    'finance.business_revenue': { en: 'Business Revenue', es: 'Ingresos del Negocio' },
    'finance.operational_costs': { en: 'Operational Costs', es: 'Costos Operacionales' },
    'finance.net_revenue': { en: 'Net Revenue', es: 'Ingresos Netos' },
    'finance.service_fees': { en: 'Service Fees', es: 'Tarifas de Servicio' },
    'finance.completed_bookings': { en: 'From Completed Bookings', es: 'De Reservas Completadas' },
    'finance.pending_payments': { en: 'Pending Payments', es: 'Pagos Pendientes' },
    'finance.pilot_costs': { en: 'Pilot Costs', es: 'Costos de Pilotos' },
    'finance.fuel_costs': { en: 'Fuel/Gas Costs', es: 'Costos de Combustible' },
    'finance.maintenance_costs': { en: 'Maintenance', es: 'Mantenimiento' },
    'finance.other_costs': { en: 'Other Costs', es: 'Otros Costos' },
    
    // Pilot recruitment
    'pilot.title': { en: 'Fly with FlyInGuate', es: 'Vuela con FlyInGuate' },
    'pilot.subtitle': { 
      en: 'Join Guatemala\'s premier helicopter pilot network. Earn premium rates while showcasing the beauty of our country to travelers from around the world.',
      es: 'Únete a la red premier de pilotos de helicóptero de Guatemala. Gana tarifas premium mientras muestras la belleza de nuestro país a viajeros de todo el mundo.'
    },
    'pilot.apply_now': { en: 'Apply Now', es: 'Aplicar Ahora' },
    'pilot.view_portal': { en: 'View Pilot Portal', es: 'Ver Portal de Piloto' },

    // Experience categories
    'category.scenic': { en: 'Scenic Tours', es: 'Tours Panorámicos' },
    'category.romantic': { en: 'Romantic Experiences', es: 'Experiencias Románticas' },
    'category.cultural': { en: 'Cultural Tours', es: 'Tours Culturales' },
    'category.volcano': { en: 'Volcano Tours', es: 'Tours de Volcanes' },
    'category.beach': { en: 'Beach & Coast', es: 'Playa y Costa' },
    'category.adventure': { en: 'Adventure Packages', es: 'Paquetes de Aventura' },
  }

  return translations[key]?.[locale] || key
}

// Hook for translations
export const useTranslation = () => {
  const { locale } = useI18n()
  
  return {
    t: (key: string) => t(key, locale),
    locale,
  }
}