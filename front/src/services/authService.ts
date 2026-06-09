import { authApi } from '@/lib/api'
import type { LoginResponse, UserInfo } from '@/models/auth'

export const authService = {
  register: (body: { name: string; email: string; password: string }) =>
    authApi.post<LoginResponse>('/auth/register', body).then(r => r.data),

  login: (body: { email: string; password: string }) =>
    authApi.post<LoginResponse>('/auth/login', body).then(r => r.data),

  logout: () =>
    authApi.post('/auth/logout'),

  me: () =>
    authApi.get<UserInfo>('/auth/me').then(r => r.data),
}
