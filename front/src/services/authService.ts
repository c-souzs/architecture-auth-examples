import api from '@/lib/api'
import type { LoginResponse, RefreshResponse, UserInfo } from '@/models/auth'

export const authService = {
  register: (body: { name: string; email: string; password: string }) =>
    api.post<LoginResponse>('/auth/register', body).then(r => r.data),

  login: (body: { email: string; password: string }) =>
    api.post<LoginResponse>('/auth/login', body).then(r => r.data),

  refresh: () =>
    api.post<RefreshResponse>('/auth/refresh').then(r => r.data),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get<UserInfo>('/auth/me').then(r => r.data),
}
