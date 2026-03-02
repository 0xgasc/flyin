// Runtime environment validation (server-side only)
function getServerEnvVar(key: string, fallback?: string): string {
  // Only validate on server-side
  if (typeof window !== 'undefined') {
    return fallback || ''
  }

  const value = process.env[key]
  if (!value && !fallback) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value || fallback!
}

export const config = {
  // Database (server-only)
  mongodb: {
    uri: getServerEnvVar('MONGODB_URI'),
  },

  // Authentication (server-only)
  auth: {
    jwtSecret: getServerEnvVar('JWT_SECRET'),
  },

  // Branding (client-side accessible)
  branding: {
    logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || 'https://isteam.wsimg.com/ip/5d044532-96be-44dc-9d52-5a4c26b5b2e3/Logo_FlyInGuatemala_c03.png',
    whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '50255507700',
  },

  // IRYS Upload (server-only)
  irys: {
    privateKey: getServerEnvVar('PRIVATE_KEY'),
    sepoliaRpc: getServerEnvVar('SEPOLIA_RPC'),
  },

  // Feature flags (client-safe)
  features: {
    enableStripe: process.env.NEXT_PUBLIC_ENABLE_STRIPE === 'true',
    enableCrypto: process.env.NEXT_PUBLIC_ENABLE_CRYPTO === 'true',
  },
} as const

// Type-safe config access
export type Config = typeof config
