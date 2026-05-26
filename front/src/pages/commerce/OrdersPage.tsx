import { useEffect, useState } from 'react'
import { Table, type Column } from '@/components/ui/Table'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
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

  useEffect(() => {
    commerceService
      .findAllOrders({ status: filterStatus as OrderStatus || undefined })
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [filterStatus])

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Pedidos</h1>
        <Select
          id="filterStatus"
          placeholder="Todos os status"
          options={STATUS_OPTIONS}
          value={filterStatus}
          onChange={e => { setLoading(true); setFilterStatus(e.target.value) }}
          className="w-52"
        />
      </div>

      <Table columns={columns} data={orders} loading={loading} keyExtractor={o => o.id} />
    </div>
  )
}
