import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { ToastContainer } from '@/components/ui/Toast'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FlyInGuate - Luxury Helicopter Transport',
  description: 'Experience Guatemala from above with our premium helicopter transport and tour services',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // Removed maximumScale: 1 to allow user zoom (accessibility)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  )
}