import { createClient } from '@/lib/supabase/client'

export const ensureUserProfile = async (userId: string) => {
  const supabase = createClient()
  
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return existingProfile
    }

    // Get user data from auth
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not found')
    }

    // Create profile
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: 'cashier',
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return newProfile
  } catch (error) {
    console.error('Error ensuring user profile:', error)
    throw error
  }
}
