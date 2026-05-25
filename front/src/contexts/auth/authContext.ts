import { createContext } from 'react'
import type { UserInfo } from '@/models/auth'

export interface AuthContextValue {
  user: UserInfo | null
  accessToken: string | null
  isAuthenticated: boolean
  initializing: boolean
  isLoggingOut: boolean
  login: (body: { email: string; password: string }) => Promise<UserInfo>
  register: (body: { name: string; email: string; password: string }) => Promise<UserInfo>
  logout: () => Promise<void>
  setAccessToken: (token: string) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
