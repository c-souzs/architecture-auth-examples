import { useEffect, useState } from 'react'
import { Table, type Column } from '@/components/ui/Table'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useOrderForm } from '@/hooks/useOrderForm'
import { commerceService } from '@/services/commerceService'
import type { Order, OrderStatus } from '@/models/commerce'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'PAYMENT_CONFIRMED', label: 'Pagamento confirmado' },
  { value: 'PROCESSING', label: 'Em processamento' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'REFUNDED', label: 'Estornado' },
]

const ADVANCEABLE: OrderStatus[] = ['PAYMENT_CONFIRMED', 'PROCESSING', 'SHIPPED']
const CANCELLABLE: OrderStatus[] = ['PENDING', 'PAYMENT_CONFIRMED']

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [createModal, setCreateModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const { form, errors, setField, setItemField, addItem, removeItem, validate, toRequest, reset } = useOrderForm()

  useEffect(() => {
    commerceService
      .findAllOrders({ status: filterStatus as OrderStatus || undefined })
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [filterStatus])

  async function handleCreate() {
    if (!validate()) return
    setSaving(true)
    try {
      const created = await commerceService.createOrder(toRequest())
      setOrders(prev => [created, ...prev])
      setCreateModal(false)
      reset()
    } finally {
      setSaving(false)
    }
  }

  async function handleAdvance(order: Order) {
    const updated = await commerceService.advanceOrder(order.id)
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)))
  }

  async function handleCancel(order: Order) {
    if (!confirm(`Cancelar pedido #${order.id}?`)) return
    const updated = await commerceService.cancelOrder(order.id)
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)))
  }

  async function handleRefund(order: Order) {
    if (!confirm(`Estornar pedido #${order.id}?`)) return
    const updated = await commerceService.refundOrder(order.id)
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)))
  }

  const columns: Column<Order>[] = [
    { header: 'ID', render: o => `#${o.id}`, width: '60px' },
    { header: 'Cliente', render: o => o.customerName },
    { header: 'Status', render: o => <Badge label={o.status} variant={statusVariant(o.status)} /> },
    { header: 'Total', render: o => `R$ ${Number(o.totalAmount).toFixed(2)}`, width: '100px' },
    { header: 'Criado em', render: o => new Date(o.createdAt).toLocaleDateString('pt-BR'), width: '110px' },
    {
      header: 'Ações',
      width: '200px',
      render: o => (
        <div className="flex gap-1.5 flex-wrap">
          {ADVANCEABLE.includes(o.status) && (
            <Button variant="secondary" onClick={() => handleAdvance(o)} className="text-xs px-2 py-1">Avançar</Button>
          )}
          {CANCELLABLE.includes(o.status) && (
            <Button variant="danger" onClick={() => handleCancel(o)} className="text-xs px-2 py-1">Cancelar</Button>
          )}
          {o.status === 'DELIVERED' && (
            <Button variant="secondary" onClick={() => handleRefund(o)} className="text-xs px-2 py-1">Estornar</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Pedidos</h1>
          <div className="flex gap-3">
            <Select
              id="filterStatus"
              placeholder="Todos os status"
              options={STATUS_OPTIONS}
              value={filterStatus}
              onChange={e => { setLoading(true); setFilterStatus(e.target.value) }}
              className="w-52"
            />
            <Button onClick={() => { reset(); setCreateModal(true) }}>Novo pedido</Button>
          </div>
        </div>

        <Table columns={columns} data={orders} loading={loading} keyExtractor={o => o.id} />
      </div>

      <Modal
        open={createModal}
        title="Novo pedido"
        onClose={() => setCreateModal(false)}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Criando...' : 'Criar pedido'}</Button>
          </>
        }
      >
        <Input
          id="ocustomer"
          label="ID do cliente"
          type="number"
          value={form.customerId}
          onChange={e => setField('customerId', e.target.value)}
          error={errors.customerId}
        />
        <Input
          id="oaddress"
          label="ID do endereço de entrega"
          type="number"
          value={form.deliveryAddressId}
          onChange={e => setField('deliveryAddressId', e.target.value)}
          error={errors.deliveryAddressId}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Itens</span>
            <Button variant="secondary" onClick={addItem} className="text-xs px-2 py-1">+ Item</Button>
          </div>
          {errors.items && <span className="text-xs text-red-600">{errors.items}</span>}
          {form.items.map((item, i) => (
            <div key={i} className="flex gap-2 items-end">
              <Input
                id={`oprod-${i}`}
                label="ID do produto"
                type="number"
                value={item.productId}
                onChange={e => setItemField(i, 'productId', e.target.value)}
                className="flex-1"
              />
              <Input
                id={`oqty-${i}`}
                label="Qtd"
                type="number"
                min="1"
                value={item.quantity}
                onChange={e => setItemField(i, 'quantity', e.target.value)}
                className="w-20"
              />
              {form.items.length > 1 && (
                <Button variant="danger" onClick={() => removeItem(i)} className="text-xs px-2 py-1 mb-0.5">×</Button>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}
