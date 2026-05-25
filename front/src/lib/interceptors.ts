import api from '@/lib/api'
import { authService } from '@/services/authService'

let _accessToken: string | null = null

// Promise compartilhada para a restauração inicial de sessao, como se fosse um state
// Corrige problema do Strice Mode atrapalhando a rotacao do token (Redis no back trataria melhor)
let _restorePromise: Promise<{ accessToken: string }> | null = null

export function restoreSession(): Promise<{ accessToken: string }> {
  // Nao existe uma Promise que restaura a Sesshion? Cria
  if (!_restorePromise) {
    _restorePromise = authService.refresh()
      .finally(() => { _restorePromise = null })
  }

  // Se existe, retorna ela.
  return _restorePromise
}

export const getAccessToken = () => _accessToken
export const updateAccessToken = (token: string | null) => { _accessToken = token }

interface InterceptorCallbacks {
  onRefreshed: (token: string) => void
  onAuthFailed: () => void
}

export function setupInterceptors({ onRefreshed, onAuthFailed }: InterceptorCallbacks): () => void {
  // Injeta o AT, caso exista
  const requestInterceptor = api.interceptors.request.use(config => {
    if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`
    return config
  })

  // Controla se já há uma busca de novo AT em andamento
  let refreshPromise: Promise<{ at: string }> | null = null

  const responseInterceptor = api.interceptors.response.use(
    response => response,
    // Cai aqui somente quando tomamos erro
    // Esse bloco ignora outros erros de AUTH, entao imagine que nele vamos tratar
    // o AT como inválido
    async error => {
      // Dados da request com erro para restaurar ela
      const request = error.config

      // Endpoints que NÃO devem disparar refresh
      const SKIP_REFRESH = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/logout']
      if (SKIP_REFRESH.some(path => request.url?.includes(path))) return Promise.reject(error)
      
      // Ignora se não é problema de AUTH OU a request ja esta marcada com retry true
      if (error.response?.status !== 401 || request._retry) return Promise.reject(error)
      
      request._retry = true

      if (!refreshPromise) {
        refreshPromise = authService.refresh()
          .then(data => {
            // Atuliza a variavel no modulo
            updateAccessToken(data.accessToken)
            // Atualize no AuthContext
            onRefreshed(data.accessToken)

            // Resolve com o novo AT
            return { at: data.accessToken }
          })
          .catch(err => {
            onAuthFailed()
            // Encoda a url para retornar apos o login
            const from = encodeURIComponent(window.location.pathname + window.location.search)
            window.location.href = `/login?from=${from}`
            return Promise.reject(err)
          })
          .finally(() => { refreshPromise = null })
      }

      try {
        // Espera buscar o novo AT
        const { at } = await refreshPromise
        request.headers.Authorization = `Bearer ${at}`

        // Refaz o request que deu erro com o AT válido
        return api(request)
      } catch {
        return Promise.reject(error)
      }
    }
  )

  return () => {
    api.interceptors.request.eject(requestInterceptor)
    api.interceptors.response.eject(responseInterceptor)
  }
}
