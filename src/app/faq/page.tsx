'use client'

import Link from 'next/link'
import { ChevronDown, MapPin, Calendar, CreditCard, Plane } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { MobileNav } from '@/components/mobile-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useAuthStore } from '@/lib/auth-store'
import { logout } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

interface FAQItem {
  question: string
  answer: string
  icon?: React.ReactNode
}

export default function FAQPage() {
  const { t, locale } = useTranslation()
  const { profile } = useAuthStore()
  const router = useRouter()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const handleSignOut = async () => {
    await logout()
    router.push('/')
  }

  const faqs: FAQItem[] = locale === 'es' ? [
    {
      question: '¿Adónde puedo ir?',
      answer: 'Con FlyInGuate no hay límites en cuanto a alcance... Puedes volar a cualquier destino en Guatemala e incluso países vecinos.\n\nSiempre que el helipuerto / aeródromo esté autorizado ó la propiedad privada cuente con la autorización previa para el aterrizaje.\n\nEnvíanos tus coordenadas de interés para cotizar y coordinar tu destino en particular.',
      icon: <MapPin className="h-6 w-6" />
    },
    {
      question: '¿Hay vuelos todo el año?',
      answer: '¡Sí! El día y hora del despegue quedan siempre a tu elección. Trabajamos los 365 días, siempre que las condiciones meteorológicas nos lo permitan.\n\nLo importante es que coordines tu vuelo con anticipación.\n\nSujeto a disponibilidad de aeronaves.',
      icon: <Calendar className="h-6 w-6" />
    },
    {
      question: '¿Avión o Helicóptero?',
      answer: '¡Tú eliges! Tenemos diferentes aeronaves listas y a tu disposición. Contamos con aviones y helicópteros de diferentes modelos para adaptarse a tus requerimientos.\n\nTambién puedes solicitar el tipo de aeronave de tu preferencia.\n\nLos precios van de acuerdo al modelo y tiempo total de vuelo utilizado (Horas de vuelo).',
      icon: <Plane className="h-6 w-6" />
    },
    {
      question: '¿Métodos de pago?',
      answer: 'Aseguras tu reserva con un pago anticipado, mediante pago directo, depósito o transferencia del 50%.\n\nPuedes cancelar el restante el día del vuelo, previo a abordar. Aceptamos efectivo, y tarjetas de crédito / débito.\n\nOpción a Visacuotas (De 2 hasta 18).',
      icon: <CreditCard className="h-6 w-6" />
    },
    {
      question: '¿Cómo coordino mi vuelo?',
      answer: 'Puedes coordinar tu vuelo de varias formas:\n\n• A través de nuestro sistema de reservas en línea\n• Por WhatsApp o teléfono\n• Por correo electrónico\n\nNuestro equipo te ayudará a planificar todos los detalles de tu vuelo.',
      icon: <Calendar className="h-6 w-6" />
    },
    {
      question: '¿Qué paquetes ofrecemos?',
      answer: 'Ofrecemos una variedad de paquetes para diferentes necesidades:\n\n• Vuelos de transporte punto a punto\n• Tours panorámicos sobre Guatemala\n• Experiencias personalizadas\n• Paquetes corporativos\n• Eventos especiales\n\nCada paquete puede ser personalizado según tus necesidades específicas.',
      icon: <Plane className="h-6 w-6" />
    }
  ] : [
    {
      question: 'Where can I fly to?',
      answer: 'With FlyInGuate there are no limits in terms of reach... You can fly to any destination in Guatemala and even neighboring countries.\n\nAs long as the heliport / airfield is authorized or the private property has prior authorization for landing.\n\nSend us your coordinates of interest to quote and coordinate your particular destination.',
      icon: <MapPin className="h-6 w-6" />
    },
    {
      question: 'Are there flights year-round?',
      answer: 'Yes! The day and time of departure are always your choice. We work 365 days a year, as long as weather conditions permit.\n\nThe important thing is that you coordinate your flight in advance.\n\nSubject to aircraft availability.',
      icon: <Calendar className="h-6 w-6" />
    },
    {
      question: 'Airplane or Helicopter?',
      answer: 'You choose! We have different aircraft ready and at your disposal. We have airplanes and helicopters of different models to adapt to your requirements.\n\nYou can also request your preferred type of aircraft.\n\nPrices vary according to the model and total flight time used (Flight hours).',
      icon: <Plane className="h-6 w-6" />
    },
    {
      question: 'Payment methods?',
      answer: 'You secure your reservation with an advance payment, through direct payment, deposit or transfer of 50%.\n\nYou can pay the remaining amount on the day of the flight, prior to boarding. We accept cash and credit/debit cards.\n\nInstallment payment option available (2 to 18 months).',
      icon: <CreditCard className="h-6 w-6" />
    },
    {
      question: 'How do I coordinate my flight?',
      answer: 'You can coordinate your flight in several ways:\n\n• Through our online booking system\n• By WhatsApp or phone\n• By email\n\nOur team will help you plan all the details of your flight.',
      icon: <Calendar className="h-6 w-6" />
    },
    {
      question: 'What packages do we offer?',
      answer: 'We offer a variety of packages for different needs:\n\n• Point-to-point transport flights\n• Panoramic tours over Guatemala\n• Personalized experiences\n• Corporate packages\n• Special events\n\nEach package can be customized according to your specific needs.',
      icon: <Plane className="h-6 w-6" />
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-luxury-black">
      {/* Navigation */}
      <div className="bg-luxury-black text-white">
        <MobileNav
          customActions={
            <div className="hidden md:flex items-center space-x-6">
              <LanguageSwitcher />
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

      {/* Hero Section */}
      <div className="bg-luxury-black text-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {locale === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
            </h1>
            <p className="text-xl text-gray-300">
              {locale === 'es'
                ? 'Todo lo que necesitas saber sobre volar con FlyInGuate'
                : 'Everything you need to know about flying with FlyInGuate'}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-luxury-charcoal rounded-none shadow-md overflow-hidden border border-gray-200 dark:border-gray-800"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-brand-accent">
                      {faq.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-luxury-black dark:text-white">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6 pt-2">
                    <div className="pl-10 text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-luxury-black text-white rounded-none p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {locale === 'es' ? '¿Aún tienes preguntas?' : 'Still have questions?'}
            </h2>
            <p className="text-gray-300 mb-6">
              {locale === 'es'
                ? 'Nuestro equipo está listo para ayudarte a planificar tu vuelo perfecto.'
                : 'Our team is ready to help you plan your perfect flight.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book/transport"
                className="btn-luxury text-lg px-8 py-3"
              >
                {locale === 'es' ? 'Reservar Ahora' : 'Book Now'}
              </Link>
              <a
                href="mailto:info@flyinguate.com"
                className="border border-white/30 text-white px-8 py-3 rounded-none hover:bg-white/10 transition-colors text-lg"
              >
                {locale === 'es' ? 'Contáctanos' : 'Contact Us'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-luxury-charcoal text-gray-400 py-8">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm">
            © 2025 FlyInGuate. {locale === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </div>
  )
}
