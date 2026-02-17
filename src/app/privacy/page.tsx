'use client'

import Link from 'next/link'
import { MobileNav } from '@/components/mobile-nav'
import { SimpleWhatsAppButton } from '@/components/whatsapp-contact-button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-luxury-black text-white">
      <MobileNav />
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-4xl font-display font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-10 text-sm">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Information We Collect</h2>
            <p>We collect your name, email address, phone number, and flight booking details to operate our helicopter charter services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To process and confirm your bookings</li>
              <li>To contact you about your flights via WhatsApp or email</li>
              <li>To improve our services and safety operations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Security</h2>
            <p>Your data is stored securely and never sold to third parties. Payment transactions are processed through secure channels.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p className="mb-4">For any privacy-related questions, please contact us directly.</p>
            <SimpleWhatsAppButton
              message="Hola FlyIn! Tengo una consulta sobre privacidad de datos."
              variant="button"
              label="Contact us on WhatsApp"
            />
          </section>
        </div>

        <div className="mt-12">
          <Link href="/" className="text-luxury-gold hover:underline text-sm">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
