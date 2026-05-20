import type { Product } from '@/models/catalog'
import type { User } from '@/models/auth'

export type StockStatus = 'REGULAR' | 'DIVERGENT' | 'PENDING_COUNT' | 'LOW_STOCK'

export interface Stock {
  id: number
  product: Product
  quantity: number
  minQuantity: number
  status: StockStatus
  updatedAt: string
}

export interface StockCount {
  id: number
  stock: Stock
  countedBy: User
  countedQuantity: number
  countedAt: string
}
