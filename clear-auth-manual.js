// Manual auth clearing script
// Run this in browser console (F12) if the /clear-auth page doesn't work

console.log('🔄 Starting manual auth clear...')

// Clear localStorage
console.log('🔄 Clearing localStorage...')
localStorage.clear()

// Clear sessionStorage  
console.log('🔄 Clearing sessionStorage...')
sessionStorage.clear()

// Clear cookies
console.log('🔄 Clearing cookies...')
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

console.log('✅ Auth cleared! Reloading page...')

// Reload the page
setTimeout(() => {
  window.location.href = '/'
}, 1000)