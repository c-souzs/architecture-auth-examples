import { useState } from 'react'

interface CategoryFormData {
  name: string
  description: string
}

type CategoryFormErrors = Partial<Record<keyof CategoryFormData, string>>

const defaults: CategoryFormData = { name: '', description: '' }

export function useCategoryForm(initial?: Partial<CategoryFormData>) {
  const [form, setForm] = useState<CategoryFormData>({ ...defaults, ...initial })
  const [errors, setErrors] = useState<CategoryFormErrors>({})

  function setField<K extends keyof CategoryFormData>(field: K, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const next: CategoryFormErrors = {}
    if (!form.name.trim()) next.name = 'Nome é obrigatório'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function reset(data?: Partial<CategoryFormData>) {
    setForm({ ...defaults, ...data })
    setErrors({})
  }

  return { form, errors, setField, validate, reset }
}
