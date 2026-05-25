export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'

export interface Category {
  id: number
  name: string
  description?: string
}

export interface ProductCatalog {
  id: number
  name: string
  description?: string
  price: number
  categoryId: number
  categoryName: string
}

export interface Product extends ProductCatalog {
  status: ProductStatus
}
