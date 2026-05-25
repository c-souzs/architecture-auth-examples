import { useEffect, useState } from 'react'
import { Table, type Column } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCustomerForm } from '@/hooks/useCustomerForm'
import { customerService } from '@/services/customerService'
import type { Customer } from '@/models/customer'

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const { form, errors, setField, validate, toRequest, reset } = useCustomerForm()

  useEffect(() => {
    customerService.findAll().then(setCustomers).finally(() => setLoading(false))
  }, [])


  function openCreate() {
    reset()
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(c: Customer) {
    reset({ cpf: c.cpf, phone: c.phone ?? '', userId: String(c.userId) })
    setEditingId(c.id)
    setModalOpen(true)
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    try {
      const body = toRequest()
      if (editingId !== null) {
        const updated = await customerService.update(editingId, body)
        setCustomers(prev => prev.map(c => (c.id === updated.id ? updated : c)))
      } else {
        const created = await customerService.create(body)
        setCustomers(prev => [...prev, created])
      }
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(c: Customer) {
    if (!confirm(`Excluir cliente ${c.userEmail}?`)) return
    await customerService.delete(c.id)
    setCustomers(prev => prev.filter(x => x.id !== c.id))
  }

  const columns: Column<Customer>[] = [
    { header: 'ID', render: c => c.id, width: '60px' },
    { header: 'Usuário', render: c => c.userEmail },
    { header: 'CPF', render: c => c.cpf },
    { header: 'Telefone', render: c => c.phone ?? '—' },
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
          <h1 className="text-xl font-semibold text-gray-900">Clientes</h1>
          <Button onClick={openCreate}>Novo cliente</Button>
        </div>

        <Table columns={columns} data={customers} loading={loading} keyExtractor={c => c.id} />
      </div>

      <Modal
        open={modalOpen}
        title={editingId !== null ? 'Editar cliente' : 'Novo cliente'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </>
        }
      >
        <Input
          id="cuserId"
          label="ID do usuário"
          type="number"
          value={form.userId}
          onChange={e => setField('userId', e.target.value)}
          error={errors.userId}
        />
        <Input
          id="ccpf"
          label="CPF (11 dígitos)"
          value={form.cpf}
          maxLength={11}
          onChange={e => setField('cpf', e.target.value)}
          error={errors.cpf}
        />
        <Input
          id="cphone"
          label="Telefone"
          value={form.phone}
          onChange={e => setField('phone', e.target.value)}
        />
      </Modal>
    </>
  )
}
