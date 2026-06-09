import axios from 'axios'
import type { AxiosInstance } from 'axios'

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const resourceApi = axios.create({
  baseURL: import.meta.env.VITE_RESOURCE_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

type Callbacks = { onAuthFailed: () => void }

export function setupInterceptors({ onAuthFailed }: Callbacks) {
  const inject = (instance: AxiosInstance) => {
    instance.interceptors.request.use(config => {
      const token = localStorage.getItem('accessToken')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })

    instance.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401 && localStorage.getItem('accessToken')) {
          onAuthFailed()
        }
        return Promise.reject(err)
      }
    )
  }

  inject(authApi)
  inject(resourceApi)
}
