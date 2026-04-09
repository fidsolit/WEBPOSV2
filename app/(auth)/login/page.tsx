'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/app/actions/auth'
import toast from 'react-hot-toast'
import { ShoppingCart, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useAppDispatch } from '@/store/hooks'
import { setAuth } from '@/store/slices/authSlice'
import { setTokenInStorage } from '@/lib/jwt/client'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth();
  const [isPending, startTransition] = useTransition()
  const dispatch = useAppDispatch()
  const supabase = createClient()

  // Prevent back navigation after logout
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href)
    }
  }, [])

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
     router.push ('/dashboard')
    }
  }, [authLoading, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await loginAction(email, password)

      if (result.error) {
        toast.error(result.error)
        setLoading(false)
        return
      }

      if (result.success && result.user && result.profile && result.token) {
        // Set session in client-side Supabase
        if (result.session) {
          await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          })
        }
        
        // Store JWT token and dispatch to Redux
        setTokenInStorage(result.token)
        dispatch(setAuth({
          user: result.user,
          profile: result.profile,
          token: result.token,
        }))
        
        // Wait for redux-persist to save
        await new Promise(resolve => setTimeout(resolve, 300))
        
        toast.success('Login successful!')
       router.push('/dashboard')
      } else {
        toast.error('Login failed: Incomplete data received')
        setLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred during login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-primary-500 p-4 rounded-full">
              <ShoppingCart className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Web POS System
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Sign in to access your dashboard
          </p>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="you@gmail.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>

          {/* Approval Notice */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              ℹ️ New accounts require admin approval before login
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white mt-6 text-sm">
          &copy; 2025 Web POS System. All rights reserved.
        </p>
      </div>
    </div>
  )
}

