import api from '@/lib/api'
import type { Stock, StockCount, StockStatus } from '@/models/stock'

export const stockService = {
  findAll: (params?: { status?: StockStatus }) =>
    api.get<Stock[]>('/stocks', { params }).then(r => r.data),

  adjust: (id: number, body: { quantity: number; minQuantity: number }) =>
    api.put<Stock>(`/stocks/${id}/adjust`, body).then(r => r.data),

  validate: (id: number, body: { resolvedQuantity: number }) =>
    api.put<Stock>(`/stocks/${id}/validate`, body).then(r => r.data),

  findCounts: (stockId: number) =>
    api.get<StockCount[]>(`/stocks/${stockId}/counts`).then(r => r.data),

  createCount: (stockId: number, body: { countedByUserId: number; countedQuantity: number }) =>
    api.post<StockCount>(`/stocks/${stockId}/counts`, body).then(r => r.data),
}
