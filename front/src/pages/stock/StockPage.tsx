import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Table, type Column } from '@/components/ui/Table'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useStockAdjustForm } from '@/hooks/useStockAdjustForm'
import { stockService } from '@/services/stockService'
import type { Stock, StockStatus } from '@/models/stock'

const STATUS_OPTIONS = [
  { value: 'REGULAR', label: 'Regular' },
  { value: 'DIVERGENT', label: 'Divergente' },
  { value: 'PENDING_COUNT', label: 'Pendente contagem' },
  { value: 'LOW_STOCK', label: 'Estoque baixo' },
]

export function StockPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [adjustModal, setAdjustModal] = useState<Stock | null>(null)
  const [saving, setSaving] = useState(false)

  const { form, errors, setField, validate, toRequest, reset } = useStockAdjustForm()

  useEffect(() => {
    load()
  }, [filterStatus])

  function load() {
    setLoading(true)
    stockService
      .findAll({ status: filterStatus as StockStatus || undefined })
      .then(setStocks)
      .finally(() => setLoading(false))
  }

  function openAdjust(stock: Stock) {
    reset({ quantity: String(stock.quantity), minQuantity: String(stock.minQuantity) })
    setAdjustModal(stock)
  }

  async function handleAdjust() {
    if (!adjustModal || !validate()) return
    setSaving(true)
    try {
      const updated = await stockService.adjust(adjustModal.id, toRequest())
      setStocks(prev => prev.map(s => (s.id === updated.id ? updated : s)))
      setAdjustModal(null)
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<Stock>[] = [
    { header: 'Produto', render: s => s.product.name },
    { header: 'Quantidade', render: s => s.quantity, width: '110px' },
    { header: 'Mínimo', render: s => s.minQuantity, width: '90px' },
    { header: 'Status', render: s => <Badge label={s.status} variant={statusVariant(s.status)} /> },
    { header: 'Atualizado', render: s => new Date(s.updatedAt).toLocaleDateString('pt-BR'), width: '120px' },
    {
      header: 'Ações',
      width: '90px',
      render: s => (
        <Button variant="secondary" onClick={() => openAdjust(s)} className="text-xs px-2 py-1">
          Ajustar
        </Button>
      ),
    },
  ]

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Estoque</h1>
          <Select
            id="filterStatus"
            placeholder="Todos os status"
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-52"
          />
        </div>

        <Table columns={columns} data={stocks} loading={loading} keyExtractor={s => s.id} />
      </div>

      <Modal
        open={!!adjustModal}
        title={`Ajustar estoque — ${adjustModal?.product.name}`}
        onClose={() => setAdjustModal(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdjustModal(null)}>Cancelar</Button>
            <Button onClick={handleAdjust} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </>
        }
      >
        <Input
          id="sqty"
          label="Quantidade"
          type="number"
          min="0"
          value={form.quantity}
          onChange={e => setField('quantity', e.target.value)}
          error={errors.quantity}
        />
        <Input
          id="smqty"
          label="Quantidade mínima"
          type="number"
          min="0"
          value={form.minQuantity}
          onChange={e => setField('minQuantity', e.target.value)}
          error={errors.minQuantity}
        />
      </Modal>
    </AppLayout>
  )
}
