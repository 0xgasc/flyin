// Runtime environment validation
function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key]
  if (!value && !fallback) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value || fallback!
}

export const config = {
  // Database
  mongodb: {
    uri: getEnvVar('MONGODB_URI'),
  },

  // Authentication
  auth: {
    jwtSecret: getEnvVar('JWT_SECRET'),
  },

  // Branding (client-side accessible)
  branding: {
    logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || 'https://isteam.wsimg.com/ip/5d044532-96be-44dc-9d52-5a4c26b5b2e3/Logo_FlyInGuatemala_c03.png',
    whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '50255507700',
  },

  // IRYS Upload
  irys: {
    privateKey: getEnvVar('PRIVATE_KEY'),
    sepoliaRpc: getEnvVar('SEPOLIA_RPC'),
  },

  // Feature flags
  features: {
    enableStripe: process.env.NEXT_PUBLIC_ENABLE_STRIPE === 'true',
    enableCrypto: process.env.NEXT_PUBLIC_ENABLE_CRYPTO === 'true',
  },
} as const

// Type-safe config access
export type Config = typeof config
