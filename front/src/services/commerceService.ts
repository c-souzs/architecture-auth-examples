import api from '@/lib/api'
import type { Order, OrderStatus, PaymentMethod } from '@/models/commerce'

export const commerceService = {
  findAllOrders: (params?: { customerId?: number; status?: OrderStatus }) =>
    api.get<Order[]>('/orders', { params }).then(r => r.data),

  findOrderById: (id: number) =>
    api.get<Order>(`/orders/${id}`).then(r => r.data),

  createOrder: (body: { customerId: number; deliveryAddressId: number; items: { productId: number; quantity: number }[] }) =>
    api.post<Order>('/orders', body).then(r => r.data),

  cancelOrder: (id: number) =>
    api.post<Order>(`/orders/${id}/cancel`).then(r => r.data),

  advanceOrder: (id: number) =>
    api.post<Order>(`/orders/${id}/advance`).then(r => r.data),

  refundOrder: (id: number) =>
    api.post<Order>(`/orders/${id}/refund`).then(r => r.data),

  confirmPayment: (orderId: number, body: { method: PaymentMethod; transactionId?: string }) =>
    api.post(`/orders/${orderId}/payment`, body).then(r => r.data),

  shipOrder: (orderId: number, body: { trackingCode?: string; estimatedDelivery?: string }) =>
    api.put(`/orders/${orderId}/delivery/ship`, body).then(r => r.data),

  deliverOrder: (orderId: number) =>
    api.put(`/orders/${orderId}/delivery/deliver`).then(r => r.data),
}
