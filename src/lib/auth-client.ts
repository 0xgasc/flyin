// Client-side auth utilities for MongoDB/JWT authentication

export interface User {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  role: 'client' | 'pilot' | 'admin'
  accountBalance: number
  kycVerified: boolean
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  error?: string
}

const API_BASE = '/api/auth'

// Register a new user
export async function register(data: {
  email: string
  password: string
  fullName: string
  phone?: string
  role: 'client' | 'pilot'
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  })

  const json = await res.json()

  if (!res.ok) {
    return { success: false, error: json.error || 'Registration failed' }
  }

  // Store token in localStorage as backup
  if (json.token) {
    localStorage.setItem('auth-token', json.token)
  }

  return {
    success: true,
    user: transformUser(json.user),
    token: json.token
  }
}

// Login user
export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  })

  const json = await res.json()

  if (!res.ok) {
    return { success: false, error: json.error || 'Login failed' }
  }

  // Store token in localStorage as backup
  if (json.token) {
    localStorage.setItem('auth-token', json.token)
  }

  return {
    success: true,
    user: transformUser(json.user),
    token: json.token
  }
}

// Logout user
export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    credentials: 'include'
  })
  localStorage.removeItem('auth-token')
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = localStorage.getItem('auth-token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_BASE}/me`, {
      credentials: 'include',
      headers
    })

    if (!res.ok) {
      localStorage.removeItem('auth-token')
      return null
    }

    const json = await res.json()
    return transformUser(json.user)
  } catch {
    return null
  }
}

// Transform API user to client User type
function transformUser(apiUser: any): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    fullName: apiUser.fullName || apiUser.full_name,
    phone: apiUser.phone,
    role: apiUser.role,
    accountBalance: apiUser.accountBalance || apiUser.account_balance || 0,
    kycVerified: apiUser.kycVerified || apiUser.kyc_verified || false
  }
}

// Helper to get auth headers for API requests
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth-token')
  if (!token) return {}
  return { 'Authorization': `Bearer ${token}` }
}
