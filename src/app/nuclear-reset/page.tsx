'use client'

import { useEffect, useState } from 'react'

export default function NuclearResetPage() {
  const [step, setStep] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
    console.log(message)
  }

  useEffect(() => {
    const performNuclearReset = async () => {
      addLog('🚀 Starting nuclear reset...')
      setStep(1)

      // Step 1: Clear all browser storage
      try {
        localStorage.clear()
        sessionStorage.clear()
        addLog('✅ LocalStorage and SessionStorage cleared')
      } catch (e) {
        addLog(`❌ Storage clear failed: ${e}`)
      }

      setStep(2)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 2: Clear all cookies
      try {
        const cookies = document.cookie.split(";")
        for (let cookie of cookies) {
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
          const domains = [window.location.hostname, `.${window.location.hostname}`, 'localhost', '.localhost']
          const paths = ['/', '/admin', '/login', '/dashboard']
          
          for (let domain of domains) {
            for (let path of paths) {
              document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`
            }
          }
        }
        addLog('✅ All cookies cleared')
      } catch (e) {
        addLog(`❌ Cookie clear failed: ${e}`)
      }

      setStep(3)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 3: Clear IndexedDB
      try {
        if ('indexedDB' in window) {
          const databases = await indexedDB.databases()
          for (const db of databases) {
            if (db.name) {
              indexedDB.deleteDatabase(db.name)
              addLog(`✅ Deleted IndexedDB: ${db.name}`)
            }
          }
        }
      } catch (e) {
        addLog(`❌ IndexedDB clear failed: ${e}`)
      }

      setStep(4)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 4: Clear caches
      try {
        if ('caches' in window) {
          const names = await caches.keys()
          await Promise.all(names.map(name => caches.delete(name)))
          addLog(`✅ Cache storage cleared (${names.length} caches)`)
        }
      } catch (e) {
        addLog(`❌ Cache clear failed: ${e}`)
      }

      setStep(5)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 5: Unregister service workers
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          for (const registration of registrations) {
            await registration.unregister()
            addLog('✅ Service worker unregistered')
          }
        }
      } catch (e) {
        addLog(`❌ Service worker clear failed: ${e}`)
      }

      setStep(6)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 6: Clear Supabase auth
      try {
        const { supabase } = await import('@/lib/supabase')
        await supabase.auth.signOut({ scope: 'global' })
        addLog('✅ Supabase auth cleared')
      } catch (e) {
        addLog(`❌ Supabase auth clear failed: ${e}`)
      }

      setStep(7)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 7: Clear auth store
      try {
        const { useAuthStore } = await import('@/lib/auth-store')
        useAuthStore.getState().hardReset()
        addLog('✅ Auth store reset')
      } catch (e) {
        addLog(`❌ Auth store reset failed: ${e}`)
      }

      setStep(8)
      addLog('🎯 Nuclear reset complete! Redirecting...')
      
      // Final redirect with cache busting
      setTimeout(() => {
        window.location.replace(`/?reset=${Date.now()}&cachebust=${Math.random()}`)
      }, 2000)
    }

    performNuclearReset()
  }, [])

  return (
    <div className="min-h-screen bg-red-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">☢️</div>
          <h1 className="text-4xl font-bold mb-2">NUCLEAR RESET</h1>
          <p className="text-xl">Complete browser state annihilation in progress...</p>
        </div>

        <div className="bg-black bg-opacity-50 rounded-lg p-6 mb-6">
          <div className="space-y-2">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-4 h-4 rounded-full ${step >= 1 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
              <span>Clear LocalStorage & SessionStorage</span>
            </div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-4 h-4 rounded-full ${step >= 2 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
              <span>Clear All Cookies</span>
            </div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-4 h-4 rounded-full ${step >= 3 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
              <span>Clear IndexedDB</span>
            </div>
            <div className={`flex items-center space-x-2 ${step >= 4 ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-4 h-4 rounded-full ${step >= 4 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
              <span>Clear Cache Storage</span>
            </div>
            <div className={`flex items-center space-x-2 ${step >= 5 ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-4 h-4 rounded-full ${step >= 5 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
              <span>Unregister Service Workers</span>
            </div>
            <div className={`flex items-center space-x-2 ${step >= 6 ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-4 h-4 rounded-full ${step >= 6 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
              <span>Clear Supabase Auth</span>
            </div>
            <div className={`flex items-center space-x-2 ${step >= 7 ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-4 h-4 rounded-full ${step >= 7 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
              <span>Reset Auth Store</span>
            </div>
            <div className={`flex items-center space-x-2 ${step >= 8 ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-4 h-4 rounded-full ${step >= 8 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
              <span>Redirect to Clean State</span>
            </div>
          </div>
        </div>

        <div className="bg-black bg-opacity-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Reset Log:</h3>
          {logs.map((log, index) => (
            <div key={index} className="text-sm font-mono text-green-400 mb-1">
              {log}
            </div>
          ))}
        </div>

        <div className="text-center mt-8 text-sm opacity-75">
          <p>After this completes, if you still have issues:</p>
          <p>1. Close ALL browser tabs and windows</p>
          <p>2. Restart your browser completely</p>
          <p>3. Press Ctrl+Shift+Del to open browser clearing dialog</p>
        </div>
      </div>
    </div>
  )
}