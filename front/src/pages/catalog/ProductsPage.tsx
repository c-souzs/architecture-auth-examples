import { useEffect, useState } from 'react'
import { Table, type Column } from '@/components/ui/Table'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useProductForm } from '@/hooks/useProductForm'
import { catalogService } from '@/services/catalogService'
import { useCart } from '@/context/CartContext'
import type { Category, Product, ProductStatus } from '@/models/catalog'

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'INACTIVE', label: 'Inativo' },
  { value: 'DISCONTINUED', label: 'Descontinuado' },
]

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const { form, errors, setField, validate, toRequest, reset } = useProductForm()
  const { addItem } = useCart()

  useEffect(() => {
    catalogService.findAllCategories().then(setCategories)
  }, [])

  useEffect(() => {
    const params = {
      categoryId: filterCategory ? Number(filterCategory) : undefined,
      status: filterStatus as ProductStatus || undefined,
    }
    catalogService.findAllProducts(params).then(setProducts).finally(() => setLoading(false))
  }, [filterCategory, filterStatus])

  function openCreate() {
    reset()
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    reset({
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      status: p.status,
      categoryId: String(p.categoryId),
    })
    setEditingId(p.id)
    setModalOpen(true)
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    try {
      const body = toRequest()
      if (editingId !== null) {
        const updated = await catalogService.updateProduct(editingId, body)
        setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
      } else {
        const created = await catalogService.createProduct(body)
        setProducts(prev => [...prev, created])
      }
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Excluir "${p.name}"?`)) return
    await catalogService.deleteProduct(p.id)
    setProducts(prev => prev.filter(x => x.id !== p.id))
  }

  const categoryOptions = categories.map(c => ({ value: String(c.id), label: c.name }))

  const columns: Column<Product>[] = [
    { header: 'Nome', render: p => p.name },
    { header: 'Categoria', render: p => p.categoryName },
    { header: 'Preço', render: p => `R$ ${Number(p.price).toFixed(2)}` },
    { header: 'Status', render: p => <Badge label={p.status} variant={statusVariant(p.status)} /> },
    {
      header: 'Ações',
      width: '190px',
      render: p => (
        <div className="flex gap-2">
          {p.status === 'ACTIVE' && (
            <Button
              variant="secondary"
              onClick={() => addItem({ id: p.id, name: p.name, price: Number(p.price) })}
              className="text-xs px-2 py-1"
            >
              + Carrinho
            </Button>
          )}
          <Button variant="secondary" onClick={() => openEdit(p)} className="text-xs px-2 py-1">Editar</Button>
          <Button variant="danger" onClick={() => handleDelete(p)} className="text-xs px-2 py-1">Excluir</Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Produtos</h1>
          <Button onClick={openCreate}>Novo produto</Button>
        </div>

        <div className="flex gap-3">
          <Select
            id="filterCategory"
            placeholder="Todas as categorias"
            options={categoryOptions}
            value={filterCategory}
            onChange={e => { setLoading(true); setFilterCategory(e.target.value) }}
            className="w-48"
          />
          <Select
            id="filterStatus"
            placeholder="Todos os status"
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={e => { setLoading(true); setFilterStatus(e.target.value) }}
            className="w-44"
          />
        </div>

        <Table columns={columns} data={products} loading={loading} keyExtractor={p => p.id} />
      </div>

      <Modal
        open={modalOpen}
        title={editingId !== null ? 'Editar produto' : 'Novo produto'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </>
        }
      >
        <Input id="pname" label="Nome" value={form.name} onChange={e => setField('name', e.target.value)} error={errors.name} />
        <Input id="pdesc" label="Descrição" value={form.description} onChange={e => setField('description', e.target.value)} />
        <Input id="pprice" label="Preço" type="number" min="0.01" step="0.01" value={form.price} onChange={e => setField('price', e.target.value)} error={errors.price} />
        <Select
          id="pstatus"
          label="Status"
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={e => setField('status', e.target.value)}
        />
        <Select
          id="pcat"
          label="Categoria"
          placeholder="Selecione..."
          options={categoryOptions}
          value={form.categoryId}
          onChange={e => setField('categoryId', e.target.value)}
          error={errors.categoryId}
        />
      </Modal>
    </>
  )
}
