export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'

export interface Category {
  id: number
  name: string
  description?: string
}

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  status: ProductStatus
  category: Category
}
