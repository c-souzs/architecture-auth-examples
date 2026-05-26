import { useEffect, useState } from 'react'
import { Table, type Column } from '@/components/ui/Table'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { usePermissions } from '@/hooks/usePermissions'
import { commerceService } from '@/services/commerceService'
import { AccessGuard } from '@/components/layout/AccessGuard'
import { Authority } from '@/models/permissions'
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

  const { canAccess } = usePermissions()
  const isOwnView = canAccess({ authorities: [Authority.ORDER_OWN] }) && !canAccess({ authorities: [Authority.ORDER_READ] })
  const canManage = canAccess({ authorities: [Authority.ORDER_MANAGE] })
  const canCancel = canAccess({ authorities: [Authority.ORDER_CANCEL] })
  const canOwn = canAccess({ authorities: [Authority.ORDER_OWN] })

  useEffect(() => {
    setLoading(true)
    const params = { status: filterStatus as OrderStatus || undefined }
    const fetch = isOwnView
      ? commerceService.findMyOrders(params)
      : commerceService.findAllOrders(params)
    fetch.then(setOrders).finally(() => setLoading(false))
  }, [isOwnView, filterStatus])

  async function handleAdvance(order: Order) {
    const updated = await commerceService.advanceOrder(order.id)
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)))
  }

  async function handleCancel(order: Order) {
    if (!confirm(`Cancelar pedido #${order.id}?`)) return
    const updated = isOwnView
      ? await commerceService.cancelMyOrder(order.id)
      : await commerceService.cancelOrder(order.id)
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)))
  }

  async function handleRefund(order: Order) {
    if (!confirm(`Estornar pedido #${order.id}?`)) return
    const updated = await commerceService.refundOrder(order.id)
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)))
  }

  const columns: Column<Order>[] = [
    { header: 'ID', render: o => `#${o.id}`, width: '60px' },
    ...(!isOwnView ? [{ header: 'Cliente', render: (o: Order) => o.customerName }] : []),
    { header: 'Status', render: o => <Badge label={o.status} variant={statusVariant(o.status)} /> },
    { header: 'Total', render: o => `R$ ${Number(o.totalAmount).toFixed(2)}`, width: '100px' },
    { header: 'Criado em', render: o => new Date(o.createdAt).toLocaleDateString('pt-BR'), width: '110px' },
    ...(canManage || canCancel || canOwn ? [{
      header: 'Ações',
      width: '200px',
      render: (o: Order) => (
        <div className="flex gap-1.5 flex-wrap">
          <AccessGuard authorities={[Authority.ORDER_MANAGE]} fallback={null}>
            {ADVANCEABLE.includes(o.status) && (
              <Button variant="secondary" onClick={() => handleAdvance(o)} className="text-xs px-2 py-1">Avançar</Button>
            )}
          </AccessGuard>
          {(canCancel || canOwn) && CANCELLABLE.includes(o.status) && (
            <Button variant="danger" onClick={() => handleCancel(o)} className="text-xs px-2 py-1">Cancelar</Button>
          )}
          <AccessGuard authorities={[Authority.ORDER_MANAGE]} fallback={null}>
            {o.status === 'DELIVERED' && (
              <Button variant="secondary" onClick={() => handleRefund(o)} className="text-xs px-2 py-1">Estornar</Button>
            )}
          </AccessGuard>
        </div>
      ),
    }] : []),
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
