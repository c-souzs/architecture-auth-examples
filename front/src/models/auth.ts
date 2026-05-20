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
