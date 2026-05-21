import api from '@/lib/api'
import type { Category, Product, ProductStatus } from '@/models/catalog'

export const catalogService = {
  findAllCategories: () =>
    api.get<Category[]>('/categories').then(r => r.data),

  createCategory: (body: { name: string; description?: string }) =>
    api.post<Category>('/categories', body).then(r => r.data),

  updateCategory: (id: number, body: { name: string; description?: string }) =>
    api.put<Category>(`/categories/${id}`, body).then(r => r.data),

  deleteCategory: (id: number) =>
    api.delete(`/categories/${id}`),

  findAllProducts: (params?: { categoryId?: number; status?: ProductStatus }) =>
    api.get<Product[]>('/products', { params }).then(r => r.data),

  createProduct: (body: { name: string; description?: string; price: number; status?: ProductStatus; categoryId: number }) =>
    api.post<Product>('/products', body).then(r => r.data),

  updateProduct: (id: number, body: { name: string; description?: string; price: number; status?: ProductStatus; categoryId: number }) =>
    api.put<Product>(`/products/${id}`, body).then(r => r.data),

  deleteProduct: (id: number) =>
    api.delete(`/products/${id}`),
}
