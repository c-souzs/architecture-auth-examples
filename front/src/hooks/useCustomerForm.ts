import { useState } from 'react'

interface CustomerFormData {
  cpf: string
  phone: string
  userId: string
}

type CustomerFormErrors = Partial<Record<keyof CustomerFormData, string>>

const defaults: CustomerFormData = { cpf: '', phone: '', userId: '' }

export function useCustomerForm(initial?: Partial<CustomerFormData>) {
  const [form, setForm] = useState<CustomerFormData>({ ...defaults, ...initial })
  const [errors, setErrors] = useState<CustomerFormErrors>({})

  function setField<K extends keyof CustomerFormData>(field: K, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const next: CustomerFormErrors = {}
    if (!/^\d{11}$/.test(form.cpf)) next.cpf = 'CPF deve ter 11 dígitos numéricos'
    if (!form.userId || isNaN(Number(form.userId))) next.userId = 'ID do usuário é obrigatório'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function toRequest() {
    return {
      cpf: form.cpf,
      phone: form.phone.trim() || undefined,
      userId: Number(form.userId),
    }
  }

  function reset(data?: Partial<CustomerFormData>) {
    setForm({ ...defaults, ...data })
    setErrors({})
  }

  return { form, errors, setField, validate, toRequest, reset }
}
