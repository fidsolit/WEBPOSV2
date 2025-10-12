import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types'
import { getPermissions, Permission, UserRole } from '@/lib/auth/permissions'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  permissions: Permission
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    permissions: getPermissions(null),
  })

  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user)
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
          permissions: getPermissions(null),
        })
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user)
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
          permissions: getPermissions(null),
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setState({
        user,
        profile,
        loading: false,
        permissions: getPermissions(profile?.role as UserRole),
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      setState({
        user,
        profile: null,
        loading: false,
        permissions: getPermissions(null),
      })
    }
  }

  return state
}

