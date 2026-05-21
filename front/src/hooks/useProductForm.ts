import { useState } from 'react'
import type { ProductStatus } from '@/models/catalog'

interface ProductFormData {
  name: string
  description: string
  price: string
  status: ProductStatus
  categoryId: string
}

type ProductFormErrors = Partial<Record<keyof ProductFormData, string>>

const defaults: ProductFormData = {
  name: '',
  description: '',
  price: '',
  status: 'ACTIVE',
  categoryId: '',
}

export function useProductForm(initial?: Partial<ProductFormData>) {
  const [form, setForm] = useState<ProductFormData>({ ...defaults, ...initial })
  const [errors, setErrors] = useState<ProductFormErrors>({})

  function setField<K extends keyof ProductFormData>(field: K, value: string) {
    setForm(prev => ({ ...prev, [field]: value as ProductFormData[K] }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const next: ProductFormErrors = {}
    if (!form.name.trim()) next.name = 'Nome é obrigatório'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) next.price = 'Preço inválido'
    if (!form.categoryId) next.categoryId = 'Categoria é obrigatória'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function toRequest() {
    return {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      status: form.status,
      categoryId: Number(form.categoryId),
    }
  }

  function reset(data?: Partial<ProductFormData>) {
    setForm({ ...defaults, ...data })
    setErrors({})
  }

  return { form, errors, setField, validate, toRequest, reset }
}
