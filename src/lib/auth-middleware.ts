import { NextRequest, NextResponse } from 'next/server'
import connectDB from './mongodb'
import User, { IUser } from '@/models/User'
import { extractToken, verifyToken, JWTPayload } from './jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: IUser
  tokenPayload?: JWTPayload
}

export type AuthHandler = (
  request: AuthenticatedRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>

// Middleware to require authentication
export function withAuth(handler: AuthHandler, options?: { roles?: string[] }) {
  return async (request: NextRequest, context?: { params: Record<string, string> }) => {
    try {
      // Extract and verify token
      const token = extractToken(request)
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }

      // Check role if specified
      if (options?.roles && !options.roles.includes(payload.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      await connectDB()

      // Get fresh user data
      const user = await User.findById(payload.userId)
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Attach user to request
      const authRequest = request as AuthenticatedRequest
      authRequest.user = user
      authRequest.tokenPayload = payload

      return handler(authRequest, context)
    } catch (error: any) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

// Helper to get user from request without making it required
export async function getOptionalUser(request: NextRequest): Promise<IUser | null> {
  try {
    const token = extractToken(request)
    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    await connectDB()
    return await User.findById(payload.userId)
  } catch {
    return null
  }
}

// Helper to get auth payload from request (for API routes that need userId without full user object)
export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = extractToken(request)
    if (!token) return null

    const payload = verifyToken(token)
    return payload || null
  } catch {
    return null
  }
}
