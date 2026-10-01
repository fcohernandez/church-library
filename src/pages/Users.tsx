import { useMemo, useState } from 'react'
import { Plus, Users as UsersIcon } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { createUser, updateUser, setUserActive } from '@/services/users'
import type { User } from '@/types'
import type { UserFormValues } from '@/schemas/user'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, TableBody, TableHead, TableRow, Th, Td } from '@/components/ui/Table'
import { UserFormModal } from '@/components/users/UserFormModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'

export function Users() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [toggleTarget, setToggleTarget] = useState<User | null>(null)

  const filters = useMemo(() => ({ search, status }), [search, status])
  const { users, reservationCounts, loading, error, refetch } = useUsers(filters)
  const { showToast } = useToast()

  const openCreate = () => {
    setEditingUser(null)
    setModalOpen(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setModalOpen(true)
  }

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, values)
        showToast('success', 'Usuario actualizado correctamente.')
      } else {
        await createUser(values)
        showToast('success', 'Usuario creado correctamente.')
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'No se pudo guardar el usuario.')
    }
  }

  const handleToggleActive = async () => {
    if (!toggleTarget) return
    try {
      await setUserActive(toggleTarget.id, !toggleTarget.active)
      showToast('success', toggleTarget.active ? 'Usuario desactivado.' : 'Usuario activado.')
      setToggleTarget(null)
      refetch()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'No se pudo actualizar el usuario.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500">Miembros de la iglesia que pueden reservar libros.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Agregar usuario
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1">
          <SearchInput placeholder="Buscar por nombre o email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="md:w-48">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </Select>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-8 w-8" />}
          title="No se encontraron usuarios."
          description="Prueba con otros filtros o agrega un nuevo usuario."
        />
      ) : (
        <>
          <Table className="hidden md:table">
            <TableHead>
              <TableRow>
                <Th>Nombre</Th>
                <Th>Email</Th>
                <Th>Teléfono</Th>
                <Th>Estado</Th>
                <Th className="text-right">Reservas</Th>
                <Th />
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <Td className="font-medium text-slate-900">{user.name}</Td>
                  <Td>{user.email || '—'}</Td>
                  <Td>{user.phone || '—'}</Td>
                  <Td>
                    <Badge tone={user.active ? 'green' : 'slate'}>{user.active ? 'Activo' : 'Inactivo'}</Badge>
                  </Td>
                  <Td className="text-right">{reservationCounts[user.id] ?? 0}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setToggleTarget(user)}>
                        {user.active ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 md:hidden">
            {users.map((user) => (
              <Card key={user.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email || 'Sin email'}</p>
                  </div>
                  <Badge tone={user.active ? 'green' : 'slate'}>{user.active ? 'Activo' : 'Inactivo'}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <span>{reservationCounts[user.id] ?? 0} reservas</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setToggleTarget(user)}>
                      {user.active ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <UserFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} user={editingUser} />

      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.active ? 'Desactivar usuario' : 'Activar usuario'}
        description={
          toggleTarget?.active
            ? `${toggleTarget?.name} no podrá realizar nuevas reservas mientras esté inactivo. Su historial se conserva.`
            : `${toggleTarget?.name} podrá volver a realizar reservas.`
        }
        confirmLabel={toggleTarget?.active ? 'Desactivar' : 'Activar'}
        tone={toggleTarget?.active ? 'danger' : 'primary'}
        onConfirm={handleToggleActive}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  )
}
