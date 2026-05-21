export interface Authority {
  id: number
  name: string
}

export interface Role {
  id: number
  name: string
  authorities: Authority[]
}

export interface User {
  id: number
  email: string
  name: string
  enabled: boolean
  locked: boolean
  createdAt: string
  roles: Role[]
}

// Auth response types (roles/authorities como strings — não objetos completos)
export interface UserInfo {
  id: number
  email: string
  name: string
  roles: string[]
  authorities: string[]
}

export interface LoginResponse {
  accessToken: string
  user: UserInfo
}

export interface RefreshResponse {
  accessToken: string
}
