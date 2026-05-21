import api from '@/lib/api'
import type { Customer, Address } from '@/models/customer'

export const customerService = {
  findAll: () =>
    api.get<Customer[]>('/customers').then(r => r.data),

  findById: (id: number) =>
    api.get<Customer>(`/customers/${id}`).then(r => r.data),

  create: (body: { cpf: string; phone?: string; userId: number }) =>
    api.post<Customer>('/customers', body).then(r => r.data),

  update: (id: number, body: { cpf: string; phone?: string; userId: number }) =>
    api.put<Customer>(`/customers/${id}`, body).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/customers/${id}`),

  findAddresses: (customerId: number) =>
    api.get<Address[]>(`/customers/${customerId}/addresses`).then(r => r.data),

  createAddress: (customerId: number, body: { street: string; number: string; complement?: string; city: string; state: string; zipCode: string }) =>
    api.post<Address>(`/customers/${customerId}/addresses`, body).then(r => r.data),

  deleteAddress: (customerId: number, addressId: number) =>
    api.delete(`/customers/${customerId}/addresses/${addressId}`),
}
