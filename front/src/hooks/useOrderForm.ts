import { useState } from 'react'

interface OrderItemFormData {
  productId: string
  quantity: string
}

interface OrderFormData {
  customerId: string
  deliveryAddressId: string
  items: OrderItemFormData[]
}

interface OrderFormErrors {
  customerId?: string
  deliveryAddressId?: string
  items?: string
}

const defaultItem: OrderItemFormData = { productId: '', quantity: '1' }
const defaults: OrderFormData = { customerId: '', deliveryAddressId: '', items: [{ ...defaultItem }] }

export function useOrderForm(initial?: Partial<OrderFormData>) {
  const [form, setForm] = useState<OrderFormData>({ ...defaults, ...initial })
  const [errors, setErrors] = useState<OrderFormErrors>({})

  function setField<K extends keyof Omit<OrderFormData, 'items'>>(field: K, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function setItemField(index: number, field: keyof OrderItemFormData, value: string) {
    setForm(prev => {
      const items = prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
      return { ...prev, items }
    })
    setErrors(prev => ({ ...prev, items: undefined }))
  }

  function addItem() {
    setForm(prev => ({ ...prev, items: [...prev.items, { ...defaultItem }] }))
  }

  function removeItem(index: number) {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  function validate(): boolean {
    const next: OrderFormErrors = {}
    if (!form.customerId || isNaN(Number(form.customerId))) next.customerId = 'Cliente é obrigatório'
    if (!form.deliveryAddressId || isNaN(Number(form.deliveryAddressId))) next.deliveryAddressId = 'Endereço é obrigatório'
    if (form.items.length === 0 || form.items.some(i => !i.productId || !i.quantity || Number(i.quantity) < 1))
      next.items = 'Adicione ao menos um item válido'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function validateOwn(): boolean {
    const next: OrderFormErrors = {}
    if (!form.deliveryAddressId || isNaN(Number(form.deliveryAddressId))) next.deliveryAddressId = 'Endereço é obrigatório'
    if (form.items.length === 0 || form.items.some(i => !i.productId || !i.quantity || Number(i.quantity) < 1))
      next.items = 'Adicione ao menos um item válido'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function toRequest() {
    return {
      customerId: Number(form.customerId),
      deliveryAddressId: Number(form.deliveryAddressId),
      items: form.items.map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity) })),
    }
  }

  function toOwnRequest() {
    return {
      deliveryAddressId: Number(form.deliveryAddressId),
      items: form.items.map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity) })),
    }
  }

  function reset() {
    setForm({ ...defaults })
    setErrors({})
  }

  return { form, errors, setField, setItemField, addItem, removeItem, validate, validateOwn, toRequest, toOwnRequest, reset }
}
