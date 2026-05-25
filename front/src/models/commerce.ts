export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED'

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BOLETO'

export type DeliveryStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'FAILED'

export interface OrderItem {
  id: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
}

export interface Payment {
  id: number
  orderId: number
  status: PaymentStatus
  method: PaymentMethod
  amount: number
  transactionId?: string
}

export interface Delivery {
  id: number
  orderId: number
  status: DeliveryStatus
  deliveryAddress: string
  trackingCode?: string
  estimatedDelivery?: string
}

export interface Order {
  id: number
  customerId: number
  customerName: string
  status: OrderStatus
  totalAmount: number
  createdAt: string
  items: OrderItem[]
  payment?: Payment
  delivery?: Delivery
}
