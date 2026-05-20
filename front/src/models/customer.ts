import type { User } from '@/models/auth'

export interface Address {
  id: number
  street: string
  number: string
  complement?: string
  city: string
  state: string
  zipCode: string
}

export interface Customer {
  id: number
  user: User
  cpf: string
  phone?: string
  addresses: Address[]
}
