'use client'

import { useI18n } from '@/lib/i18n'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <div className="relative">
      <button
        onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
        className="flex items-center space-x-2 px-3 py-2 text-sm hover:text-luxury-gold transition-colors"
        title={locale === 'en' ? 'Cambiar a Español' : 'Switch to English'}
      >
        <Globe className="h-4 w-4" />
        <span className="font-medium">{locale === 'en' ? 'ES' : 'EN'}</span>
      </button>
    </div>
  )
}