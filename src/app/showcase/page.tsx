'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

// Load map without SSR
const GuatemalaMapLibre = dynamic(
  () => import('@/components/guatemala-maplibre'),
  { ssr: false }
)

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-luxury-black">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header */}
          <header className="px-16 lg:px-32 pt-16">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-brand-accent rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-sm">F</span>
              </div>
              <span className="text-gray-500 text-sm">portfolio / 2025</span>
            </motion.div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-16 lg:px-32 py-20 flex flex-col lg:flex-row gap-20 lg:gap-32 items-center justify-center">
            {/* Left - Text Content */}
            <div className="lg:w-5/12 max-w-md">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-brand-accent text-sm font-medium tracking-wide mb-8"
              >
                HELICOPTER CHARTER PLATFORM
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-10 leading-tight"
              >
                Flyin
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-400 text-lg mb-12 leading-relaxed"
              >
                skip the 8-hour drives. book helicopter rides between guatemala's
                best destinations — tikal, lake atitlan, antigua. built for a tourism startup
                looking to change how people explore central america.
              </motion.p>

              {/* Feature Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="flex flex-wrap gap-3 mb-12"
              >
                {[
                  'interactive route mapping',
                  'real-time booking',
                  'pilot dashboard',
                  'admin cms',
                  'ride sharing'
                ].map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1.5 bg-luxury-slate/30 border border-luxury-slate/50 text-gray-300 text-sm rounded"
                  >
                    {feature}
                  </span>
                ))}
              </motion.div>

              {/* Tech Stack */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-sm"
              >
                <p className="text-gray-400 mb-2">Full-stack project — design, frontend, backend, deployment</p>
                <div className="flex items-center gap-4 text-gray-500">
                  <span>Next.js</span>
                  <span className="text-gray-700">|</span>
                  <span>MapLibre GL</span>
                  <span className="text-gray-700">|</span>
                  <span>MongoDB</span>
                  <span className="text-gray-700">|</span>
                  <span>Tailwind</span>
                </div>
              </motion.div>
            </div>

            {/* Right - Map Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:w-5/12 w-full max-w-md"
            >
              <div className="relative">
                {/* Map container */}
                <div className="rounded-lg overflow-hidden border border-luxury-slate/30 shadow-2xl">
                  <GuatemalaMapLibre
                    selectedFrom="Ciudad de Guatemala"
                    selectedTo="El Paredon"
                    compact
                  />
                </div>

                {/* Floating label */}
                <div className="absolute -bottom-3 -right-3 bg-luxury-black border border-brand-accent/30 rounded px-3 py-1.5 shadow-lg">
                  <p className="text-brand-accent text-xs font-medium">Live Map</p>
                </div>
              </div>
            </motion.div>
          </main>

          {/* Footer */}
          <footer className="px-16 lg:px-32 py-10 border-t border-luxury-slate/20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 text-sm"
            >
              <span className="text-gray-600">2025</span>
              <a href="/" className="hover:text-brand-accent transition-colors">View Live Site</a>
            </motion.div>
          </footer>
        </div>
      </div>
    </div>
  )
}
