import { useEffect, useState } from 'react'
import { Table, type Column } from '@/components/ui/Table'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useStockAdjustForm } from '@/hooks/useStockAdjustForm'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/hooks/useAuth'
import { stockService } from '@/services/stockService'
import { AccessGuard } from '@/components/layout/AccessGuard'
import { Authority } from '@/models/permissions'
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
  const [countModal, setCountModal] = useState<Stock | null>(null)
  const [countQuantity, setCountQuantity] = useState('')
  const [countSaving, setCountSaving] = useState(false)
  const [validateModal, setValidateModal] = useState<Stock | null>(null)
  const [resolvedQuantity, setResolvedQuantity] = useState('')
  const [validateSaving, setValidateSaving] = useState(false)

  const { form, errors, setField, validate, toRequest, reset } = useStockAdjustForm()
  const { canAccess } = usePermissions()
  const { user } = useAuth()
  const canWrite = canAccess({ authorities: [Authority.STOCK_WRITE] })
  const canCount = canAccess({ authorities: [Authority.STOCK_COUNT] })
  const canValidate = canAccess({ authorities: [Authority.STOCK_VALIDATE] })

  useEffect(() => {
    stockService
      .findAll({ status: filterStatus as StockStatus || undefined })
      .then(setStocks)
      .finally(() => setLoading(false))
  }, [filterStatus])

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

  function openCount(stock: Stock) {
    setCountQuantity('')
    setCountModal(stock)
  }

  function openValidate(stock: Stock) {
    setResolvedQuantity('')
    setValidateModal(stock)
  }

  async function handleValidate() {
    if (!validateModal || resolvedQuantity === '') return
    setValidateSaving(true)
    try {
      const updated = await stockService.validate(validateModal.id, { resolvedQuantity: Number(resolvedQuantity) })
      setStocks(prev => prev.map(s => (s.id === updated.id ? updated : s)))
      setValidateModal(null)
    } finally {
      setValidateSaving(false)
    }
  }

  async function handleCount() {
    if (!countModal || countQuantity === '') return
    setCountSaving(true)
    try {
      await stockService.createCount(countModal.id, {
        countedByUserId: user!.id,
        countedQuantity: Number(countQuantity),
      })
      const updated = await stockService.findAll({ status: filterStatus as StockStatus || undefined })
      setStocks(updated)
      setCountModal(null)
    } finally {
      setCountSaving(false)
    }
  }

  const columns: Column<Stock>[] = [
    { header: 'Produto', render: s => s.productName },
    { header: 'Quantidade', render: s => s.quantity, width: '110px' },
    { header: 'Mínimo', render: s => s.minQuantity, width: '90px' },
    { header: 'Status', render: s => <Badge label={s.status} variant={statusVariant(s.status)} /> },
    { header: 'Atualizado', render: s => new Date(s.updatedAt).toLocaleDateString('pt-BR'), width: '120px' },
    ...(canWrite || canCount || canValidate ? [{
      header: 'Ações',
      width: '210px',
      render: (s: Stock) => (
        <div className="flex gap-2">
          <AccessGuard authorities={[Authority.STOCK_WRITE]} fallback={null}>
            <Button variant="secondary" onClick={() => openAdjust(s)} className="text-xs px-2 py-1">Ajustar</Button>
          </AccessGuard>
          {canCount && s.status === 'PENDING_COUNT' && (
            <Button variant="secondary" onClick={() => openCount(s)} className="text-xs px-2 py-1">Contar</Button>
          )}
          {canValidate && s.status === 'DIVERGENT' && (
            <Button variant="secondary" onClick={() => openValidate(s)} className="text-xs px-2 py-1">Validar</Button>
          )}
        </div>
      ),
    }] : []),
  ]

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Estoque</h1>
          <Select
            id="filterStatus"
            placeholder="Todos os status"
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={e => { setLoading(true); setFilterStatus(e.target.value) }}
            className="w-52"
          />
        </div>

        <Table columns={columns} data={stocks} loading={loading} keyExtractor={s => s.id} />
      </div>

      <Modal
        open={!!adjustModal}
        title={`Ajustar estoque — ${adjustModal?.productName}`}
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

      <Modal
        open={!!countModal}
        title={`Registrar contagem — ${countModal?.productName}`}
        onClose={() => setCountModal(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCountModal(null)}>Cancelar</Button>
            <Button onClick={handleCount} disabled={countSaving || countQuantity === ''}>
              {countSaving ? 'Salvando...' : 'Confirmar contagem'}
            </Button>
          </>
        }
      >
        <Input
          id="cqty"
          label="Quantidade contada"
          type="number"
          min="0"
          value={countQuantity}
          onChange={e => setCountQuantity(e.target.value)}
        />
      </Modal>

      <Modal
        open={!!validateModal}
        title={`Resolver divergência — ${validateModal?.productName}`}
        onClose={() => setValidateModal(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setValidateModal(null)}>Cancelar</Button>
            <Button onClick={handleValidate} disabled={validateSaving || resolvedQuantity === ''}>
              {validateSaving ? 'Salvando...' : 'Confirmar'}
            </Button>
          </>
        }
      >
        <Input
          id="vqty"
          label="Quantidade correta"
          type="number"
          min="0"
          value={resolvedQuantity}
          onChange={e => setResolvedQuantity(e.target.value)}
        />
      </Modal>
    </>
  )
}
