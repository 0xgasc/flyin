import type { Metadata } from 'next'
import { Outfit, Cormorant_Garamond } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { ToastContainer } from '@/components/ui/Toast'
import '../styles/globals.css'

// Primary sans-serif font for body text and UI
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

// Display serif font for headings and luxury emphasis
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FlyInGuate - Luxury Helicopter Transport',
  description: 'Experience Guatemala from above with our premium helicopter transport and tour services',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${cormorant.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  )
}
