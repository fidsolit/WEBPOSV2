'use client'

import { removeTokenFromStorage } from '@/lib/jwt/client'
import { persistor } from '@/store'

export async function clearAuthState() {
  // Clear JWT token from localStorage
  removeTokenFromStorage()
  
  // Clear redux-persist storage
  try {
    // persistor may be undefined during SSR; only call purge when available
    if (typeof window !== 'undefined' && persistor) {
      await persistor.purge()
      // Also clear from localStorage directly
      localStorage.removeItem('persist:root')
    }
  } catch (error) {
    console.error('Error clearing persisted state:', error)
  }
}

