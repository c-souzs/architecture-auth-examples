import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import api from '@/lib/api'
import { authService } from '@/services/authService'
import type { UserInfo } from '@/models/auth'

// Variável de módulo — leitura síncrona pelo interceptor de request sem overhead do React
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

  function clearAuth() {
    setToken(null)
    setUser(null)
  }

  // Interceptors montados uma vez. Captura setToken/clearAuth via closure — ambos
  // são estáveis: setToken chama _setAccessToken (setter do useState, nunca muda)
  // e atualiza _accessToken (módulo-level).
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(config => {
      const token = _accessToken
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Compartilhado entre requests concorrentes — evita múltiplos refreshes simultâneos
    let refreshPromise: Promise<string> | null = null

    const responseInterceptor = api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config

        // Não tenta refresh para endpoints de auth (evita loop infinito)
        if (originalRequest.url?.includes('/auth/')) {
          return Promise.reject(error)
        }

        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error)
        }

        originalRequest._retry = true

        if (!refreshPromise) {
          refreshPromise = authService.refresh()
            .then(data => {
              setToken(data.accessToken)
              return data.accessToken
            })
            .catch(err => {
              clearAuth()
              window.location.href = '/login'
              return Promise.reject(err)
            })
            .finally(() => {
              refreshPromise = null
            })
        }

        try {
          const token = await refreshPromise
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        } catch {
          return Promise.reject(error)
        }
      }
    )

    return () => {
      api.interceptors.request.eject(requestInterceptor)
      api.interceptors.response.eject(responseInterceptor)
    }
  }, [])

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
    clearAuth()
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
