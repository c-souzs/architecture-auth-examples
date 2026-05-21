import { useState } from 'react'

interface StockAdjustFormData {
  quantity: string
  minQuantity: string
}

type StockAdjustFormErrors = Partial<Record<keyof StockAdjustFormData, string>>

const defaults: StockAdjustFormData = { quantity: '', minQuantity: '' }

export function useStockAdjustForm(initial?: Partial<StockAdjustFormData>) {
  const [form, setForm] = useState<StockAdjustFormData>({ ...defaults, ...initial })
  const [errors, setErrors] = useState<StockAdjustFormErrors>({})

  function setField<K extends keyof StockAdjustFormData>(field: K, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const next: StockAdjustFormErrors = {}
    if (isNaN(Number(form.quantity)) || Number(form.quantity) < 0) next.quantity = 'Quantidade inválida'
    if (isNaN(Number(form.minQuantity)) || Number(form.minQuantity) < 0) next.minQuantity = 'Mínimo inválido'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function toRequest() {
    return {
      quantity: Number(form.quantity),
      minQuantity: Number(form.minQuantity),
    }
  }

  function reset(data?: Partial<StockAdjustFormData>) {
    setForm({ ...defaults, ...data })
    setErrors({})
  }

  return { form, errors, setField, validate, toRequest, reset }
}
