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
    'nav.destinations': { en: 'Destinations', es: 'Destinos' },
    'nav.dashboard': { en: 'Dashboard', es: 'Panel' },
    'nav.experiences': { en: 'Experiences', es: 'Experiencias' },
    'nav.transport': { en: 'Transport', es: 'Transporte' },
    'nav.book_flight': { en: 'Book Flight', es: 'Confirma tu vuelo' },
    'nav.more': { en: 'More', es: 'Más' },
    'nav.pilot_opportunities': { en: 'Pilot Opportunities', es: 'Oportunidades para Pilotos' },
    'nav.executive_services': { en: 'Executive Services', es: 'Servicios Ejecutivos' },
    'nav.faq': { en: 'FAQ', es: 'Preguntas Frecuentes' },
    'nav.pilot_dashboard': { en: 'Pilot Dashboard', es: 'Panel de Piloto' },
    'nav.profile': { en: 'Profile', es: 'Perfil' },
    'nav.admin': { en: 'Admin Panel', es: 'Panel de Admin' },
    'nav.login': { en: 'Login', es: 'Iniciar Sesión' },
    'nav.register': { en: 'Register', es: 'Registrarse' },
    'nav.sign_in': { en: 'Sign In', es: 'Iniciar Sesión' },
    'nav.sign_out': { en: 'Sign Out', es: 'Cerrar Sesión' },
    'nav.switch_language': { en: 'Español', es: 'English' },
    'nav.privacy_policy': { en: 'Privacy Policy', es: 'Política de privacidad' },
    'nav.contact': { en: 'Contact', es: 'Contacto' },

    // Footer
    'footer.follow_us': { en: 'Follow Us on Social Media', es: 'Síguenos en las Redes Sociales' },
    'footer.tagline': { en: 'Intermediation of aeronautical leisure services.', es: 'Intermediación de servicios de esparcimiento aeronáutico.' },
    'footer.copyright': { en: 'Copyright © 2026 FlyInGuate - All Rights Reserved.', es: 'Copyright © 2026 FlyInGuate - Todos los derechos reservados.' },

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
    'admin.group_operations': { en: 'Operations', es: 'Operaciones' },
    'admin.group_people': { en: 'People', es: 'Personas' },
    'admin.group_finance': { en: 'Finance', es: 'Finanzas' },
    'admin.group_content': { en: 'Content', es: 'Contenido' },
    'admin.group_assets': { en: 'Assets', es: 'Activos' },
    'admin.experience_management': { en: 'Experience Management', es: 'Gestión de Experiencias' },
    'admin.destination_management': { en: 'Destination Management', es: 'Gestión de Destinos' },
    'admin.fleet_management': { en: 'Fleet Management', es: 'Gestión de Flota' },
    'admin.analytics_dashboard': { en: 'Analytics Dashboard', es: 'Panel de Análisis' },
    'admin.topup_approval': { en: 'Top-up Approval System', es: 'Sistema de Aprobación de Recargas' },
    'admin.flight_calendar_title': { en: 'Flight Calendar & Aircraft Scheduling', es: 'Calendario de Vuelos y Programación de Aeronaves' },

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
    'pilot.flexible_schedule': { en: 'Flexible Schedule', es: 'Horario Flexible' },
    'pilot.full_insurance': { en: 'Full Insurance', es: 'Seguro Completo' },
    'pilot.start_flying': { en: 'Start Flying Today', es: 'Empieza a Volar Hoy' },
    'pilot.premium_earnings': { en: 'Premium Earnings', es: 'Ganancias Premium' },
    'pilot.earnings_subtitle': { en: 'Earn more than traditional aviation jobs with flexible scheduling', es: 'Gana más que en trabajos de aviación tradicionales con horarios flexibles' },
    'pilot.transport_flights': { en: 'Transport Flights', es: 'Vuelos de Transporte' },
    'pilot.per_hour_bonuses': { en: 'per hour + bonuses', es: 'por hora + bonos' },
    'pilot.experience_tours': { en: 'Experience Tours', es: 'Tours de Experiencia' },
    'pilot.per_hour_tips': { en: 'per hour + tips', es: 'por hora + propinas' },
    'pilot.peak_bonuses': { en: 'Peak Bonuses', es: 'Bonos de Temporada Alta' },
    'pilot.during_high_demand': { en: 'during high demand', es: 'durante alta demanda' },
    'pilot.real_earnings': { en: 'Real Pilot Earnings', es: 'Ganancias Reales de Pilotos' },
    'pilot.why_choose': { en: 'Why Pilots Choose FlyInGuate', es: 'Por Qué los Pilotos Eligen FlyInGuate' },
    'pilot.why_choose_subtitle': { en: 'More than just flights - join a community of professional aviators', es: 'Más que solo vuelos - únete a una comunidad de aviadores profesionales' },
    'pilot.flexible_schedule_desc': { en: 'Choose when you fly. Work around your schedule, not ours. Accept or decline assignments with no penalties.', es: 'Elige cuándo volar. Trabaja según tu horario, no el nuestro. Acepta o rechaza asignaciones sin penalidades.' },
    'pilot.full_coverage': { en: 'Full Coverage', es: 'Cobertura Total' },
    'pilot.full_coverage_desc': { en: 'Comprehensive insurance coverage, aircraft maintenance, and legal protection for every flight you take.', es: 'Cobertura integral de seguro, mantenimiento de aeronave y protección legal para cada vuelo.' },
    'pilot.premium_clients': { en: 'Premium Clients', es: 'Clientes Premium' },
    'pilot.premium_clients_desc': { en: 'Fly VIP clients, tourists, and business travelers. Professional, respectful passengers who appreciate quality service.', es: 'Vuela clientes VIP, turistas y viajeros de negocios. Pasajeros profesionales y respetuosos que aprecian el servicio de calidad.' },
    'pilot.best_destinations': { en: 'Best Destinations', es: 'Mejores Destinos' },
    'pilot.best_destinations_desc': { en: 'Showcase Guatemala\'s beauty - Antigua, Lake Atitlán, Tikal, Pacific Coast. Every flight is a scenic adventure.', es: 'Muestra la belleza de Guatemala - Antigua, Lago Atitlán, Tikal, Costa del Pacífico. Cada vuelo es una aventura escénica.' },
    'pilot.quick_payments': { en: 'Quick Payments', es: 'Pagos Rápidos' },
    'pilot.quick_payments_desc': { en: 'Get paid within 24 hours of completed flights. No waiting weeks for your earnings - immediate direct deposit.', es: 'Cobra dentro de 24 horas de vuelos completados. Sin esperar semanas por tus ganancias - depósito directo inmediato.' },
    'pilot.build_brand': { en: 'Build Your Brand', es: 'Construye tu Marca' },
    'pilot.build_brand_desc': { en: 'Develop a following of repeat clients. Top-rated pilots get priority assignments and premium tour requests.', es: 'Desarrolla seguidores de clientes recurrentes. Los pilotos mejor calificados obtienen asignaciones prioritarias y solicitudes de tours premium.' },
    'pilot.simple_requirements': { en: 'Simple Requirements', es: 'Requisitos Simples' },
    'pilot.requirements_subtitle': { en: 'We welcome experienced pilots ready to provide exceptional service', es: 'Damos la bienvenida a pilotos experimentados listos para brindar un servicio excepcional' },
    'pilot.required_qualifications': { en: 'Required Qualifications', es: 'Calificaciones Requeridas' },
    'pilot.commercial_license': { en: 'Commercial Helicopter License', es: 'Licencia Comercial de Helicóptero' },
    'pilot.commercial_license_desc': { en: 'Valid Guatemalan or recognized international license', es: 'Licencia guatemalteca válida o internacional reconocida' },
    'pilot.flight_hours': { en: '500+ Flight Hours', es: '500+ Horas de Vuelo' },
    'pilot.flight_hours_desc': { en: 'Minimum total flight time requirement', es: 'Requisito mínimo de tiempo total de vuelo' },
    'pilot.safety_record': { en: 'Clean Safety Record', es: 'Historial de Seguridad Limpio' },
    'pilot.safety_record_desc': { en: 'No major incidents or violations', es: 'Sin incidentes mayores ni violaciones' },
    'pilot.medical_cert': { en: 'Current Medical Certificate', es: 'Certificado Médico Vigente' },
    'pilot.medical_cert_desc': { en: 'Valid aviation medical certification', es: 'Certificación médica de aviación válida' },
    'pilot.preferred_experience': { en: 'Preferred Experience', es: 'Experiencia Preferida' },
    'pilot.tourism_exp': { en: 'Tourism Flight Experience', es: 'Experiencia en Vuelos Turísticos' },
    'pilot.tourism_exp_desc': { en: 'Previous scenic or charter flight experience', es: 'Experiencia previa en vuelos panorámicos o charter' },
    'pilot.local_knowledge': { en: 'Local Area Knowledge', es: 'Conocimiento del Área Local' },
    'pilot.local_knowledge_desc': { en: 'Familiarity with Guatemala\'s landmarks and airspace', es: 'Familiaridad con los puntos de referencia y espacio aéreo de Guatemala' },
    'pilot.customer_service': { en: 'Customer Service Skills', es: 'Habilidades de Servicio al Cliente' },
    'pilot.customer_service_desc': { en: 'Professional communication with passengers', es: 'Comunicación profesional con pasajeros' },
    'pilot.multi_language': { en: 'Multi-language Ability', es: 'Habilidad Multilingüe' },
    'pilot.multi_language_desc': { en: 'Spanish and English preferred', es: 'Español e inglés preferido' },
    'pilot.ready_to_fly': { en: 'Ready to Take Flight?', es: '¿Listo para Volar?' },
    'pilot.ready_subtitle': { en: 'Join hundreds of pilots already earning premium rates with FlyInGuate. Complete verification takes just 48 hours.', es: 'Únete a cientos de pilotos que ya ganan tarifas premium con FlyInGuate. La verificación completa toma solo 48 horas.' },

    // Pilot dashboard
    'pilot.my_assignments': { en: 'My Assignments', es: 'Mis Asignaciones' },
    'pilot.active_missions': { en: 'Active Missions', es: 'Misiones Activas' },
    'pilot.completed': { en: 'Completed', es: 'Completadas' },
    'pilot.all': { en: 'All', es: 'Todas' },
    'pilot.verification_required': { en: 'Verification Required', es: 'Verificación Requerida' },
    'pilot.verification_desc': { en: 'Please complete in-person KYC verification to start receiving flight assignments.', es: 'Por favor completa la verificación KYC en persona para empezar a recibir asignaciones de vuelo.' },
    'pilot.no_assignments': { en: 'No assignments', es: 'Sin asignaciones' },
    'pilot.no_assignments_desc': { en: 'You\'ll see flight assignments here once they\'re assigned to you', es: 'Verás las asignaciones de vuelo aquí una vez que te sean asignadas' },
    'pilot.accept_mission': { en: 'Accept Mission', es: 'Aceptar Misión' },
    'pilot.mark_completed': { en: 'Mark as Completed', es: 'Marcar como Completado' },
    'pilot.client': { en: 'Client', es: 'Cliente' },
    'pilot.phone': { en: 'Phone', es: 'Teléfono' },
    'pilot.notes': { en: 'Notes', es: 'Notas' },

    // Passenger details
    'passenger.title': { en: 'Passenger Details', es: 'Datos de Pasajeros' },
    'passenger.name': { en: 'Full Name', es: 'Nombre Completo' },
    'passenger.age': { en: 'Age', es: 'Edad' },
    'passenger.passport': { en: 'Passport/ID', es: 'Pasaporte/ID' },
    'passenger.emergency_contact': { en: 'Emergency Contact', es: 'Contacto de Emergencia' },
    'passenger.dietary': { en: 'Dietary Restrictions', es: 'Restricciones Dietéticas' },
    'passenger.special_requests': { en: 'Special Requests', es: 'Solicitudes Especiales' },
    'passenger.add': { en: 'Add Passenger', es: 'Agregar Pasajero' },
    'passenger.remove': { en: 'Remove', es: 'Eliminar' },
    'passenger.addons': { en: 'Add-ons', es: 'Complementos' },
    'passenger.continue': { en: 'Continue to Review', es: 'Continuar a Revisión' },
    'passenger.back': { en: 'Back', es: 'Atrás' },

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