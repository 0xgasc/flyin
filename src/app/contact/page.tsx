'use client'

import Link from 'next/link'
import { MobileNav } from '@/components/mobile-nav'
import { SimpleWhatsAppButton } from '@/components/whatsapp-contact-button'
import { Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-luxury-black text-white">
      <MobileNav />
      <div className="container mx-auto px-6 py-16 max-w-2xl">
        <h1 className="text-4xl font-display font-bold mb-2">Contact Us</h1>
        <p className="text-gray-400 mb-12">Reach us directly — we respond fast.</p>

        <div className="space-y-8">
          {/* WhatsApp CTA */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">WhatsApp (Fastest)</h2>
            <p className="text-gray-400 text-sm mb-4">Send us a message and we'll reply within minutes during business hours.</p>
            <SimpleWhatsAppButton
              variant="button"
              label="Message us on WhatsApp"
            />
          </div>

          {/* Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 flex items-start gap-3">
              <Phone className="h-5 w-5 text-luxury-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Phone / WhatsApp</p>
                <a href="tel:+50255507700" className="text-gray-300 text-sm hover:text-white">+502 5550-7700</a>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 flex items-start gap-3">
              <MapPin className="h-5 w-5 text-luxury-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Base</p>
                <p className="text-gray-300 text-sm">Guatemala City, Guatemala</p>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 flex items-start gap-3 sm:col-span-2">
              <Clock className="h-5 w-5 text-luxury-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Hours</p>
                <p className="text-gray-300 text-sm">Mon – Sun, 06:00 – 20:00 (Guatemala time)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/" className="text-luxury-gold hover:underline text-sm">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
