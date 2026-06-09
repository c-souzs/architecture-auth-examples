import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useCart } from '@/context/CartContext'
import { usePermissions } from '@/hooks/usePermissions'
import { customerService } from '@/services/customerService'
import { commerceService } from '@/services/commerceService'
import { Authority } from '@/models/permissions'
import type { Customer, Address } from '@/models/customer'

interface CartModalProps {
  open: boolean
  onClose: () => void
}

function formatAddress(a: Address): string {
  const complement = a.complement ? ` ${a.complement}` : ''
  return `${a.street}, ${a.number}${complement} — ${a.city}/${a.state}`
}

export function CartModal({ open, onClose }: CartModalProps) {
  const { items, removeItem, updateQuantity, clearCart } = useCart()
  const { canAccess } = usePermissions()

  const canWrite = canAccess({ authorities: [Authority.ORDER_WRITE] })
  const canOwn = canAccess({ authorities: [Authority.ORDER_OWN] })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [customerId, setCustomerId] = useState('')
  const [addressId, setAddressId] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ customerId?: string; addressId?: string }>({})

  useEffect(() => {
    if (open && canWrite) customerService.findAll().then(setCustomers)
  }, [open, canWrite])

  useEffect(() => {
    if (!customerId) { setAddresses([]); setAddressId(''); return }
    customerService.findAddresses(Number(customerId)).then(data => {
      setAddresses(data)
      setAddressId('')
    })
  }, [customerId])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  async function handleFinalize() {
    if (canWrite) {
      const next: typeof errors = {}
      if (!customerId) next.customerId = 'Selecione um cliente'
      if (!addressId) next.addressId = 'Selecione um endereço'
      setErrors(next)
      if (Object.keys(next).length > 0) return

      setSaving(true)
      try {
        await commerceService.createOrder({
          customerId: Number(customerId),
          deliveryAddressId: Number(addressId),
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        })
        clearCart()
        handleClose()
      } finally {
        setSaving(false)
      }
    } else if (canOwn) {
      const next: typeof errors = {}
      if (!addressId) next.addressId = 'Informe o ID do endereço'
      setErrors(next)
      if (Object.keys(next).length > 0) return

      setSaving(true)
      try {
        await commerceService.createMyOrder({
          deliveryAddressId: Number(addressId),
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        })
        clearCart()
        handleClose()
      } finally {
        setSaving(false)
      }
    }
  }

  function handleClose() {
    setCustomerId('')
    setAddressId('')
    setErrors({})
    onClose()
  }

  const canFinalize = canWrite || canOwn

  return (
    <Modal
      open={open}
      title={`Carrinho (${items.length} ${items.length === 1 ? 'item' : 'itens'})`}
      onClose={handleClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Fechar</Button>
          <Button onClick={handleFinalize} disabled={saving || items.length === 0 || !canFinalize}>
            {saving ? 'Criando...' : 'Finalizar pedido'}
          </Button>
        </>
      }
    >
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Nenhum item no carrinho.</p>
      ) : (
        <>
          <div className="flex flex-col">
            {items.map(item => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">R$ {Number(item.price).toFixed(2)} / un</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-6 h-6 rounded border border-gray-300 text-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-6 h-6 rounded border border-gray-300 text-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm font-medium w-20 text-right shrink-0">
                  R$ {(Number(item.price) * item.quantity).toFixed(2)}
                </p>
                <Button
                  variant="danger"
                  onClick={() => removeItem(item.productId)}
                  className="text-xs px-2 py-1 shrink-0"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="text-base font-semibold text-gray-900">R$ {total.toFixed(2)}</span>
          </div>
        </>
      )}

      {canWrite && (
        <>
          <Select
            id="cart-customer"
            label="Cliente"
            placeholder="Selecione um cliente..."
            options={customers.map(c => ({ value: String(c.id), label: `Cliente #${c.id} — CPF: ${c.cpf}` }))}
            value={customerId}
            onChange={e => { setCustomerId(e.target.value); setErrors(prev => ({ ...prev, customerId: undefined })) }}
            error={errors.customerId}
          />
          <Select
            id="cart-address"
            label="Endereço de entrega"
            placeholder={customerId ? 'Selecione um endereço...' : 'Selecione um cliente primeiro'}
            options={addresses.map(a => ({ value: String(a.id), label: formatAddress(a) }))}
            value={addressId}
            onChange={e => { setAddressId(e.target.value); setErrors(prev => ({ ...prev, addressId: undefined })) }}
            disabled={!customerId}
            error={errors.addressId}
          />
        </>
      )}

      {!canWrite && canOwn && (
        <Input
          id="cart-address-id"
          label="ID do endereço de entrega"
          type="number"
          min="1"
          placeholder="Ex: 1"
          value={addressId}
          onChange={e => { setAddressId(e.target.value); setErrors(prev => ({ ...prev, addressId: undefined })) }}
          error={errors.addressId}
        />
      )}
    </Modal>
  )
}
