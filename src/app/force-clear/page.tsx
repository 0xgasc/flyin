'use client'

import { useEffect } from 'react'

export default function ForceClearPage() {
  useEffect(() => {
    const forceClear = async () => {
      console.log('🔥 FORCE CLEARING EVERYTHING...')
      
      // 1. Clear all storage
      try {
        localStorage.clear()
        sessionStorage.clear()
        console.log('✅ Storage cleared')
      } catch (e) {
        console.error('Storage clear error:', e)
      }
      
      // 2. Clear ALL cookies (more aggressive)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=" + window.location.hostname)
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=." + window.location.hostname)
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=localhost")
      })
      console.log('✅ Cookies cleared')
      
      // 3. Clear IndexedDB
      if (window.indexedDB) {
        try {
          const databases = await indexedDB.databases()
          for (const db of databases) {
            if (db.name) {
              indexedDB.deleteDatabase(db.name)
              console.log(`✅ Deleted IndexedDB: ${db.name}`)
            }
          }
        } catch (e) {
          console.error('IndexedDB clear error:', e)
        }
      }
      
      // 4. Clear Cache Storage
      if ('caches' in window) {
        try {
          const names = await caches.keys()
          await Promise.all(names.map(name => caches.delete(name)))
          console.log('✅ Cache storage cleared')
        } catch (e) {
          console.error('Cache clear error:', e)
        }
      }
      
      // 5. Unregister service workers
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          for (const registration of registrations) {
            await registration.unregister()
            console.log('✅ Service worker unregistered')
          }
        } catch (e) {
          console.error('Service worker error:', e)
        }
      }
      
      // 6. Clear Supabase specific items
      const supabaseKeys = [
        'sb-localhost-auth-token',
        'sb-fyinchszmpxgydnqhzck-auth-token',
        'supabase.auth.token'
      ]
      
      for (const key of supabaseKeys) {
        try {
          localStorage.removeItem(key)
          sessionStorage.removeItem(key)
        } catch (e) {
          console.error(`Error removing ${key}:`, e)
        }
      }
      
      console.log('✅ All Supabase tokens cleared')
      
      // 7. Import and clear auth
      try {
        const { supabase } = await import('@/lib/supabase')
        await supabase.auth.signOut({ scope: 'global' })
        console.log('✅ Supabase global signout')
      } catch (e) {
        console.error('Supabase signout error:', e)
      }
      
      // 8. Hard reload with cache bypass
      setTimeout(() => {
        // This forces Chrome to bypass cache
        window.location.href = '/?cachebust=' + Date.now()
      }, 1000)
    }
    
    forceClear()
  }, [])
  
  return (
    <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔥</div>
        <h1 className="text-3xl font-bold mb-4">FORCE CLEARING ALL BROWSER DATA</h1>
        <div className="text-xl animate-pulse">This will completely reset your browser state...</div>
        <div className="mt-8 text-sm opacity-75">
          After this completes, try:<br/>
          1. Press Ctrl+Shift+R (Cmd+Shift+R on Mac) for hard reload<br/>
          2. Open Chrome DevTools → Application → Clear Storage → Clear site data
        </div>
      </div>
    </div>
  )
}