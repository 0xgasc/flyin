'use client'

import { useEffect, useState } from 'react'

export default function ClearAuthPage() {
  const [step, setStep] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, message])
  }

  useEffect(() => {
    const clearAuth = async () => {
      try {
        addLog('🔄 Step 1: Clearing localStorage...')
        localStorage.clear()
        setStep(1)
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        addLog('🔄 Step 2: Clearing sessionStorage...')
        sessionStorage.clear()
        setStep(2)
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        addLog('🔄 Step 3: Clearing cookies...')
        // Clear cookies
        const cookies = document.cookie.split(';')
        for (let cookie of cookies) {
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          if (name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
          }
        }
        setStep(3)
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        addLog('✅ All cleared! Redirecting in 2 seconds...')
        setStep(4)
        
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
        
      } catch (error) {
        addLog(`❌ Error: ${error}`)
        console.error('Clear auth error:', error)
        
        // Force redirect anyway
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
      }
    }
    
    clearAuth()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          {step < 4 ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          ) : (
            <div className="text-green-600 text-6xl mb-4">✅</div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step < 4 ? 'Clearing Authentication' : 'Authentication Cleared!'}
          </h1>
          <p className="text-gray-600">
            {step < 4 ? 'Clearing auth cache...' : 'Redirecting to home page...'}
          </p>
        </div>
        
        <div className="bg-gray-100 rounded p-4 text-sm font-mono max-h-60 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="mb-1">{log}</div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Home Now
          </button>
        </div>
      </div>
    </div>
  )
}