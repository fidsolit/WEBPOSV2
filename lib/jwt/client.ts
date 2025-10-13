'use client'

const TOKEN_KEY = 'jwt_token'

export function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setTokenInStorage(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeTokenFromStorage(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
}

export function getAuthHeaders(): HeadersInit {
  const token = getTokenFromStorage()
  if (!token) return {}
  
  return {
    'Authorization': `Bearer ${token}`,
  }
}

