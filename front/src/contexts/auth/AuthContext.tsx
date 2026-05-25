import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { authService } from '@/services/authService'
import { setupInterceptors, updateAccessToken, restoreSession } from '@/lib/interceptors'
import { AuthContext } from '@/contexts/auth/authContext'
import type { UserInfo } from '@/models/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  // Guarda no state para evitar que seja roubado no local/session Storage
  const [accessToken, _setAccessToken] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Wrapper do state accessToken
  function setToken(token: string | null) {
    updateAccessToken(token) // atualiza ele no interceptor
    _setAccessToken(token)   // atualiza ele no state do react
  }

  const clearAuth = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    // Interceptors registrados primeiro, me() pode receber 401 e precisar do refresh
    const eject = setupInterceptors({
      onRefreshed: token => _setAccessToken(token),
      onAuthFailed: clearAuth,
    })

    // Restaura AT primeiro
    restoreSession()
      .then(data => {
        setToken(data.accessToken)
        return authService.me() // Se sucesso, busca os dados do usuario autenticado
      })
      .then(data => setUser(data))
      .catch(() => {})
      .finally(() => setInitializing(false))

    return eject
  }, [clearAuth])

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
    setIsLoggingOut(true)
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
      initializing,
      isLoggingOut,
      login,
      register,
      logout,
      setAccessToken,
    }}>
      {children}
    </AuthContext>
  )
}
