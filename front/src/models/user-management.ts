export interface UserSummaryResponse {
  id: number
  email: string
  name: string
  enabled: boolean
  locked: boolean
  createdAt: string
  roles: string[]
  authorities: string[]
}

export interface AssignRolesRequest {
  roleNames: string[]
}

export interface UserStatusRequest {
  enabled?: boolean
  locked?: boolean
}
