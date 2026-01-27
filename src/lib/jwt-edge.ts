// Edge-compatible JWT verification using jose library
// Use this in middleware and Edge functions

import { jwtVerify } from 'jose'

export interface JWTPayload {
  userId: string
  email: string
  role: 'client' | 'pilot' | 'admin'
  iat?: number
  exp?: number
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}
