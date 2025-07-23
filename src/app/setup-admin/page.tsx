'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Plane, Shield, Check, X } from 'lucide-react'

export default function SetupAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)
  const [debugInfo, setDebugInfo] = useState('')

  const createAdminUser = async () => {
    setLoading(true)
    setError('')

    try {
      console.log('Creating admin user...')
      
      // First check if current user is already signed in
      const { data: currentSession } = await supabase.auth.getSession()
      console.log('Current session:', currentSession)
      
      // Sign out current user first to avoid conflicts
      if (currentSession.session) {
        console.log('Signing out current user to create admin...')
        await supabase.auth.signOut()
      }
      
      // Wait a moment for signout to complete
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Step 1: Create auth user
      console.log('Attempting to create admin user...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'admin@flyinguate.com',
        password: 'admin123',
        options: {
          data: {
            full_name: 'Admin User',
            role: 'admin'
          }
        }
      })

      console.log('SignUp response:', { data: authData, error: authError })

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          console.log('User already exists, proceeding to login step')
          setStep(2)
          return
        }
        throw authError
      }

      if (authData.user) {
        console.log('User created, now signing in to create profile...', authData.user.id)
        
        // Step 2: Sign in as the new user to create profile
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@flyinguate.com',
          password: 'admin123'
        })
        
        console.log('Sign in response:', { data: signInData, error: signInError })
        
        if (signInError) {
          throw new Error('Failed to sign in as new admin user: ' + signInError.message)
        }
        
        // Wait a moment for auth to settle
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Step 3: Create/update profile (now authenticated)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: 'admin@flyinguate.com',
            full_name: 'Admin User',
            role: 'admin',
            kyc_verified: true,
            account_balance: 0
          })
          .select()

        console.log('Profile response:', { data: profileData, error: profileError })

        if (profileError) {
          console.error('Profile error:', profileError)
          // Continue anyway - might already exist or be created by trigger
        }

        setSuccess(true)
        setStep(3)
      }
    } catch (error: any) {
      console.error('Setup error:', error)
      setError(error.message || 'Failed to create admin user')
    } finally {
      setLoading(false)
    }
  }

  const loginAsAdmin = async () => {
    setLoading(true)
    setError('')

    try {
      console.log('Attempting admin login...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@flyinguate.com',
        password: 'admin123'
      })

      console.log('Login response:', { data, error })

      if (error) {
        console.error('Auth error details:', error)
        throw error
      }

      // Check if we got a session
      if (!data.session) {
        throw new Error('No session returned after login')
      }

      console.log('Login successful, redirecting to admin panel...')
      router.push('/admin')
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Failed to login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Plane className="h-10 w-10 text-luxury-gold" />
            <Shield className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Setup</h1>
          <p className="text-gray-600 mt-2">Development admin user creation</p>
        </div>

        <div className="card-luxury">
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Development Only:</strong> This creates a test admin account
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm"><strong>Email:</strong> admin@flyinguate.com</p>
                <p className="text-sm"><strong>Password:</strong> admin123</p>
                <p className="text-sm"><strong>Role:</strong> Admin (full access)</p>
              </div>

              <button
                onClick={createAdminUser}
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating Admin User...' : 'Create Admin User'}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <button
                onClick={async () => {
                  try {
                    const { data: profiles, error } = await supabase
                      .from('profiles')
                      .select('*')
                      .eq('email', 'admin@flyinguate.com')
                    
                    const debugText = `Profiles found: ${JSON.stringify(profiles, null, 2)}\nError: ${error?.message || 'none'}`
                    setDebugInfo(debugText)
                    console.log('Debug info:', debugText)
                    
                    // If admin exists, skip to login step
                    if (profiles && profiles.length > 0) {
                      console.log('Admin user found, skipping to login step')
                      setStep(2)
                    }
                  } catch (err) {
                    setDebugInfo(`Error: ${err}`)
                  }
                }}
                className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                🔍 Check if Admin Exists
              </button>
              
              <button
                onClick={() => {
                  console.log('Forcing step to login')
                  setStep(2)
                }}
                className="w-full px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                Skip to Login (if admin already exists)
              </button>
              
              {debugInfo && (
                <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-xs">
                  <pre className="whitespace-pre-wrap">{debugInfo}</pre>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Admin user already exists. Click below to login.
                </p>
              </div>

              <button
                onClick={loginAsAdmin}
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login as Admin'}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 3 && success && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-sm text-green-800">
                    Admin user created successfully!
                  </p>
                </div>
              </div>

              <button
                onClick={loginAsAdmin}
                disabled={loading}
                className="w-full btn-luxury disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login as Admin'}
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              For production, use proper admin assignment via SQL
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}