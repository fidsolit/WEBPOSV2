'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function loginAction(email: string, password: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Login failed' }
  }

  // Check if user is approved
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_active, role')
    .eq('id', data.user.id)
    .single()

  if (profileError) {
    return { error: 'Error loading profile' }
  }

  if (!profile?.is_active) {
    await supabase.auth.signOut()
    return { error: 'Your account is pending admin approval. Please wait for activation.' }
  }

  // Set session cookies
  if (data.session) {
    const cookieStore = cookies()
    cookieStore.set('sb-auth-token', data.session.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  }

  return { success: true }
}

export async function signupAction(email: string, password: string, fullName: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Set user as inactive by default
    await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', data.user.id)
  }

  return { success: true }
}

export async function logoutAction() {
  const supabase = createServerClient()
  
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Server logout error:', error)
  }
  
  // Clear all Supabase cookies
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  
  // Delete all Supabase-related cookies
  allCookies.forEach(cookie => {
    if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
      cookieStore.delete(cookie.name)
    }
  })
  
  redirect('/login')
}

