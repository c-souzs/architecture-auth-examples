export type StockStatus = 'REGULAR' | 'DIVERGENT' | 'PENDING_COUNT' | 'LOW_STOCK'

export interface Stock {
  id: number
  productId: number
  productName: string
  quantity: number
  minQuantity: number
  status: StockStatus
  updatedAt: string
}

export interface StockCount {
  id: number
  stockId: number
  productName: string
  countedByUserId: number
  countedByName: string
  countedQuantity: number
  countedAt: string
}
