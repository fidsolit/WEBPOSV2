import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPermissions, Permission, UserRole } from '@/lib/auth/permissions'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setAuth, clearAuth } from '@/store/slices/authSlice'
import { selectUser, selectProfile, selectToken } from '@/store/selectors'
import { getTokenFromStorage, setTokenInStorage, removeTokenFromStorage } from '@/lib/jwt/client'
import { generateToken } from '@/lib/jwt/token'

interface AuthState {
  user: ReturnType<typeof selectUser>
  profile: ReturnType<typeof selectProfile>
  loading: boolean
  permissions: Permission
}

export function useAuth() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const profile = useAppSelector(selectProfile)
  const token = useAppSelector(selectToken)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    // Check for existing JWT token
    const storedToken = getTokenFromStorage()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user)
      } else if (storedToken) {
        // Token exists but no session, clear it
        removeTokenFromStorage()
        dispatch(clearAuth())
        setLoading(false)
      } else {
        dispatch(clearAuth())
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user)
      } else {
        removeTokenFromStorage()
        dispatch(clearAuth())
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (user: any) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      // Generate or retrieve JWT token
      let jwtToken = getTokenFromStorage()
      if (!jwtToken) {
        jwtToken = generateToken({
          userId: user.id,
          email: user.email,
          role: profile.role,
        })
        setTokenInStorage(jwtToken)
      }

      dispatch(setAuth({
        user,
        profile,
        token: jwtToken,
      }))
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading profile:', error)
      dispatch(clearAuth())
      setLoading(false)
    }
  }

  return {
    user,
    profile,
    loading,
    permissions: getPermissions(profile?.role as UserRole),
  } as AuthState
}

