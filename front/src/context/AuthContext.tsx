import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { setupInterceptors } from '@/lib/api'
import { authService } from '@/services/authService'
import type { UserInfo } from '@/models/auth'

interface AuthContextValue {
  user: UserInfo | null
  isAuthenticated: boolean
  initializing: boolean
  login: (email: string, password: string) => Promise<UserInfo>
  register: (name: string, email: string, password: string) => Promise<UserInfo>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [initializing, setInitializing] = useState(true)

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken')
    setUser(null)
  }, [])

  useEffect(() => {
    setupInterceptors({ onAuthFailed: clearAuth })

    const token = localStorage.getItem('accessToken')
    if (!token) {
      setInitializing(false)
      return
    }

    authService.me()
      .then(setUser)
      .catch(clearAuth)
      .finally(() => setInitializing(false))
  }, [clearAuth])

  async function login(email: string, password: string): Promise<UserInfo> {
    const data = await authService.login({ email, password })
    localStorage.setItem('accessToken', data.accessToken)
    setUser(data.user)
    return data.user
  }

  async function register(name: string, email: string, password: string): Promise<UserInfo> {
    const data = await authService.register({ name, email, password })
    localStorage.setItem('accessToken', data.accessToken)
    setUser(data.user)
    return data.user
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      clearAuth()
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
