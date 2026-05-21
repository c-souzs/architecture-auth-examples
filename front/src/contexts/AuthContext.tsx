import { createContext, useContext, useState, type ReactNode } from 'react'
import { authService } from '@/services/authService'
import type { UserInfo } from '@/models/auth'

// Variável de módulo — leitura síncrona pelo interceptor Axios sem overhead do React
let _accessToken: string | null = null
export const getAccessToken = () => _accessToken

interface AuthContextValue {
  user: UserInfo | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (body: { email: string; password: string }) => Promise<void>
  register: (body: { name: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  setAccessToken: (token: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [accessToken, _setAccessToken] = useState<string | null>(null)

  function setToken(token: string | null) {
    _accessToken = token
    _setAccessToken(token)
  }

  async function login(body: { email: string; password: string }) {
    const data = await authService.login(body)
    setToken(data.accessToken)
    setUser(data.user)
  }

  async function register(body: { name: string; email: string; password: string }) {
    const data = await authService.register(body)
    setToken(data.accessToken)
    setUser(data.user)
  }

  async function logout() {
    await authService.logout().catch(() => {})
    setToken(null)
    setUser(null)
  }

  function setAccessToken(token: string) {
    setToken(token)
  }

  return (
    <AuthContext value={{
      user,
      accessToken,
      isAuthenticated: accessToken !== null,
      login,
      register,
      logout,
      setAccessToken,
    }}>
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
