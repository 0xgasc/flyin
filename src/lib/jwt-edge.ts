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

function getSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('[jwt-edge] JWT_SECRET environment variable is not set')
    return null
  }
  return new TextEncoder().encode(secret)
}

export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecret()
    if (!secret) {
      return null
    }

    // jsonwebtoken uses HS256 by default, so we must accept it
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256']
    })

    // Validate required fields exist
    if (!payload.userId || !payload.email || !payload.role) {
      console.error('[jwt-edge] Token missing required fields')
      return null
    }

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'client' | 'pilot' | 'admin',
      iat: payload.iat,
      exp: payload.exp
    }
  } catch (error) {
    console.error('[jwt-edge] Token verification failed:', error)
    return null
  }
}
