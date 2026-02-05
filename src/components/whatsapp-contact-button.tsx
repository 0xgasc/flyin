'use client'

import { MessageCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { format } from 'date-fns'
import { es as esLocale, enUS as enLocale } from 'date-fns/locale'

interface BookingDetails {
  id: string
  type: 'transport' | 'experience'
  experienceName?: string
  fromLocation?: string
  toLocation?: string
  scheduledDate: string
  scheduledTime: string
  passengerCount: number
  totalPrice: number
  status: string
}

interface WhatsAppContactButtonProps {
  booking: BookingDetails
  variant?: 'button' | 'icon' | 'link'
  className?: string
}

const WHATSAPP_PHONE = '50255507700' // +502 5550-7700

export function WhatsAppContactButton({ booking, variant = 'button', className = '' }: WhatsAppContactButtonProps) {
  const { locale } = useTranslation()

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return format(date, 'PPP', { locale: locale === 'es' ? esLocale : enLocale })
    } catch {
      return dateStr
    }
  }

  const translateStatus = (status: string) => {
    const statusMap: Record<string, { en: string; es: string }> = {
      pending: { en: 'Pending', es: 'Pendiente' },
      approved: { en: 'Approved', es: 'Aprobado' },
      assigned: { en: 'Assigned', es: 'Asignado' },
      accepted: { en: 'Accepted', es: 'Aceptado' },
      completed: { en: 'Completed', es: 'Completado' },
      cancelled: { en: 'Cancelled', es: 'Cancelado' }
    }
    return statusMap[status]?.[locale] || status
  }

  const getBookingDescription = () => {
    if (booking.type === 'experience' && booking.experienceName) {
      return booking.experienceName
    }
    if (booking.fromLocation && booking.toLocation) {
      return `${booking.fromLocation} → ${booking.toLocation}`
    }
    return booking.type === 'experience' ? 'Experience' : 'Transport'
  }

  const generateMessage = () => {
    const bookingRef = booking.id.slice(-6).toUpperCase()

    if (locale === 'es') {
      return `Hola FlyInGuate! 👋

Tengo una consulta sobre mi reserva:

📋 *Reserva:* #${bookingRef}
✈️ *Tipo:* ${getBookingDescription()}
📅 *Fecha:* ${formatDate(booking.scheduledDate)}
🕐 *Hora:* ${booking.scheduledTime}
👥 *Pasajeros:* ${booking.passengerCount}
💰 *Total:* $${booking.totalPrice.toLocaleString()} USD
📊 *Estado:* ${translateStatus(booking.status)}

Mi consulta es: `
    }

    return `Hello FlyInGuate! 👋

I have a question about my booking:

📋 *Booking:* #${bookingRef}
✈️ *Type:* ${getBookingDescription()}
📅 *Date:* ${formatDate(booking.scheduledDate)}
🕐 *Time:* ${booking.scheduledTime}
👥 *Passengers:* ${booking.passengerCount}
💰 *Total:* $${booking.totalPrice.toLocaleString()} USD
📊 *Status:* ${translateStatus(booking.status)}

My question is: `
  }

  const handleClick = () => {
    const message = encodeURIComponent(generateMessage())
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${message}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors ${className}`}
        title={locale === 'es' ? 'Contactar por WhatsApp' : 'Contact via WhatsApp'}
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    )
  }

  if (variant === 'link') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium transition-colors ${className}`}
      >
        <MessageCircle className="h-4 w-4" />
        <span>{locale === 'es' ? 'WhatsApp' : 'WhatsApp'}</span>
      </button>
    )
  }

  // Default: full button
  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors ${className}`}
    >
      <MessageCircle className="h-5 w-5" />
      <span>{locale === 'es' ? '¿Preguntas? Contáctanos por WhatsApp' : 'Questions? Contact us on WhatsApp'}</span>
    </button>
  )
}

// Simple version without booking context
interface SimpleWhatsAppButtonProps {
  message?: string
  variant?: 'button' | 'icon' | 'link'
  className?: string
  label?: string
}

export function SimpleWhatsAppButton({ message, variant = 'button', className = '', label }: SimpleWhatsAppButtonProps) {
  const { locale } = useTranslation()

  const defaultMessage = locale === 'es'
    ? 'Hola FlyInGuate! Me gustaría obtener más información sobre sus servicios.'
    : 'Hello FlyInGuate! I would like to get more information about your services.'

  const handleClick = () => {
    const finalMessage = encodeURIComponent(message || defaultMessage)
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${finalMessage}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors ${className}`}
        title={locale === 'es' ? 'Contactar por WhatsApp' : 'Contact via WhatsApp'}
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    )
  }

  if (variant === 'link') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium transition-colors ${className}`}
      >
        <MessageCircle className="h-4 w-4" />
        <span>{label || 'WhatsApp'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors ${className}`}
    >
      <MessageCircle className="h-5 w-5" />
      <span>{label || (locale === 'es' ? 'Contáctanos por WhatsApp' : 'Contact us on WhatsApp')}</span>
    </button>
  )
}
