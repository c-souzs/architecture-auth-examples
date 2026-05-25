import { useEffect, useState } from 'react'
import { Table, type Column } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCategoryForm } from '@/hooks/useCategoryForm'
import { catalogService } from '@/services/catalogService'
import type { Category } from '@/models/catalog'

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const { form, errors, setField, validate, reset } = useCategoryForm()

  useEffect(() => {
    catalogService.findAllCategories().then(setCategories).finally(() => setLoading(false))
  }, [])

  function openCreate() {
    reset()
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    reset({ name: cat.name, description: cat.description ?? '' })
    setEditingId(cat.id)
    setModalOpen(true)
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    try {
      const body = { name: form.name.trim(), description: form.description.trim() || undefined }
      if (editingId !== null) {
        const updated = await catalogService.updateCategory(editingId, body)
        setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)))
      } else {
        const created = await catalogService.createCategory(body)
        setCategories(prev => [...prev, created])
      }
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Excluir "${cat.name}"?`)) return
    await catalogService.deleteCategory(cat.id)
    setCategories(prev => prev.filter(c => c.id !== cat.id))
  }

  const columns: Column<Category>[] = [
    { header: 'ID', render: c => c.id, width: '60px' },
    { header: 'Nome', render: c => c.name },
    { header: 'Descrição', render: c => c.description ?? '—' },
    {
      header: 'Ações',
      width: '120px',
      render: c => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => openEdit(c)} className="text-xs px-2 py-1">Editar</Button>
          <Button variant="danger" onClick={() => handleDelete(c)} className="text-xs px-2 py-1">Excluir</Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Categorias</h1>
          <Button onClick={openCreate}>Nova categoria</Button>
        </div>

        <Table columns={columns} data={categories} loading={loading} keyExtractor={c => c.id} />
      </div>

      <Modal
        open={modalOpen}
        title={editingId !== null ? 'Editar categoria' : 'Nova categoria'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </>
        }
      >
        <Input
          id="name"
          label="Nome"
          value={form.name}
          onChange={e => setField('name', e.target.value)}
          error={errors.name}
        />
        <Input
          id="description"
          label="Descrição"
          value={form.description}
          onChange={e => setField('description', e.target.value)}
        />
      </Modal>
    </>
  )
}
