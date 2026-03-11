import { createClient } from '@/lib/supabase/client'

export const debugDatabase = async () => {
  const supabase = createClient()
  
  try {
    // Check auth state
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Debug - Session:', { session, sessionError })
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('Debug - User:', { user, userError })
    
    // Try to query products without any filters
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5)
    
    console.log('Debug - Products:', { products, productsError })
    
    // Try to query categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5)
    
    console.log('Debug - Categories:', { categories, categoriesError })
    
    return {
      session,
      user,
      products,
      categories,
      errors: {
        sessionError,
        userError,
        productsError,
        categoriesError
      }
    }
  } catch (error) {
    console.error('Debug error:', error)
    return { error }
  }
}
