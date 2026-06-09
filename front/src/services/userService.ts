import { authApi as api } from '@/lib/api'
import type { Page } from '@/models/pagination'
import type { UserSummaryResponse, AssignRolesRequest, UserStatusRequest } from '@/models/user-management'

export const userService = {
  findAll: (page = 0, size = 10) =>
    api.get<Page<UserSummaryResponse>>('/users', { params: { page, size } }).then(r => r.data),

  findById: (id: number) =>
    api.get<UserSummaryResponse>(`/users/${id}`).then(r => r.data),

  assignRoles: (id: number, body: AssignRolesRequest) =>
    api.put<UserSummaryResponse>(`/users/${id}/roles`, body).then(r => r.data),

  updateStatus: (id: number, body: UserStatusRequest) =>
    api.patch<UserSummaryResponse>(`/users/${id}/status`, body).then(r => r.data),

  disable: (id: number) =>
    api.delete(`/users/${id}`),
}
