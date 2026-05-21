import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Table, type Column } from '@/components/ui/Table'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { usePagination } from '@/hooks/usePagination'
import { userService } from '@/services/userService'
import { Role } from '@/models/permissions'
import type { UserSummaryResponse } from '@/models/user-management'
import type { Page } from '@/models/pagination'

const ALL_ROLES = Object.values(Role)

export function UsersPage() {
  const { page, size, goToPage } = usePagination(0, 10)
  const [data, setData] = useState<Page<UserSummaryResponse> | null>(null)
  const [loading, setLoading] = useState(true)

  const [rolesModal, setRolesModal] = useState<UserSummaryResponse | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    userService.findAll(page, size).then(setData).finally(() => setLoading(false))
  }, [page, size])

  function openRolesModal(user: UserSummaryResponse) {
    setRolesModal(user)
    setSelectedRoles([...user.roles])
  }

  function toggleRole(role: string) {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  async function saveRoles() {
    if (!rolesModal) return
    setSaving(true)
    try {
      const updated = await userService.assignRoles(rolesModal.id, { roleNames: selectedRoles })
      setData(prev =>
        prev ? { ...prev, content: prev.content.map(u => (u.id === updated.id ? updated : u)) } : prev
      )
      setRolesModal(null)
    } finally {
      setSaving(false)
    }
  }

  async function toggleEnabled(user: UserSummaryResponse) {
    const updated = await userService.updateStatus(user.id, { enabled: !user.enabled })
    setData(prev =>
      prev ? { ...prev, content: prev.content.map(u => (u.id === updated.id ? updated : u)) } : prev
    )
  }

  async function toggleLocked(user: UserSummaryResponse) {
    const updated = await userService.updateStatus(user.id, { locked: !user.locked })
    setData(prev =>
      prev ? { ...prev, content: prev.content.map(u => (u.id === updated.id ? updated : u)) } : prev
    )
  }

  async function disableUser(user: UserSummaryResponse) {
    if (!confirm(`Desativar ${user.email}?`)) return
    await userService.disable(user.id)
    setData(prev =>
      prev ? { ...prev, content: prev.content.map(u => (u.id === user.id ? { ...u, enabled: false } : u)) } : prev
    )
  }

  const columns: Column<UserSummaryResponse>[] = [
    { header: 'E-mail', render: u => u.email },
    { header: 'Nome', render: u => u.name },
    {
      header: 'Status',
      render: u => (
        <div className="flex gap-1.5">
          <Badge label={u.enabled ? 'Ativo' : 'Inativo'} variant={u.enabled ? 'green' : 'gray'} />
          {u.locked && <Badge label="Bloqueado" variant="red" />}
        </div>
      ),
    },
    {
      header: 'Roles',
      render: u => (
        <div className="flex flex-wrap gap-1">
          {u.roles.map(r => <Badge key={r} label={r} variant="indigo" />)}
        </div>
      ),
    },
    {
      header: 'Ações',
      width: '200px',
      render: u => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => openRolesModal(u)} className="text-xs px-2 py-1">
            Roles
          </Button>
          <Button variant="secondary" onClick={() => toggleEnabled(u)} className="text-xs px-2 py-1">
            {u.enabled ? 'Desativar' : 'Ativar'}
          </Button>
          <Button variant="secondary" onClick={() => toggleLocked(u)} className="text-xs px-2 py-1">
            {u.locked ? 'Desbloquear' : 'Bloquear'}
          </Button>
          <Button variant="danger" onClick={() => disableUser(u)} className="text-xs px-2 py-1">
            Remover
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-900">Usuários</h1>

        <Table
          columns={columns}
          data={data?.content ?? []}
          loading={loading}
          keyExtractor={u => u.id}
        />

        {data && (
          <Pagination
            page={data.number}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            size={data.size}
            onPageChange={goToPage}
          />
        )}
      </div>

      <Modal
        open={!!rolesModal}
        title={`Roles — ${rolesModal?.email}`}
        onClose={() => setRolesModal(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRolesModal(null)}>Cancelar</Button>
            <Button onClick={saveRoles} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          {ALL_ROLES.map(role => (
            <label key={role} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={() => toggleRole(role)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">{role}</span>
            </label>
          ))}
        </div>
      </Modal>
    </AppLayout>
  )
}
