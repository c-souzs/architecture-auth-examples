export interface Address {
  id: number
  customerId: number
  street: string
  number: string
  complement?: string
  city: string
  state: string
  zipCode: string
}

export interface Customer {
  id: number;
  cpf: string;
  phone: string;
  userId: number;
  userName: string;
  userEmail: string;
}
