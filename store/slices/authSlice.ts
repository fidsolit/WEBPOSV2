import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types'

interface AuthState {
  user: User | null
  profile: Profile | null
  token: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  profile: null,
  token: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    setProfile: (state, action: PayloadAction<Profile | null>) => {
      state.profile = action.payload
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload
    },
    setAuth: (state, action: PayloadAction<{ user: User; profile: Profile; token: string }>) => {
      state.user = action.payload.user
      state.profile = action.payload.profile
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    clearAuth: (state) => {
      state.user = null
      state.profile = null
      state.token = null
      state.isAuthenticated = false
    },
  },
})

export const { setUser, setProfile, setToken, setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer

