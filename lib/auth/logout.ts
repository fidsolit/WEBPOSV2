'use client'

import { removeTokenFromStorage } from '@/lib/jwt/client'
import { persistor } from '@/store'

export async function clearAuthState() {
  // Clear JWT token from localStorage
  removeTokenFromStorage()
  
  // Clear redux-persist storage
  try {
    await persistor.purge()
    // Also clear from localStorage directly
    localStorage.removeItem('persist:root')
  } catch (error) {
    console.error('Error clearing persisted state:', error)
  }
}

