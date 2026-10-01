import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, BookOpen } from 'lucide-react'
import { useReservations } from '@/hooks/useReservations'
import { borrowReservation, cancelReservation, returnReservation } from '@/services/reservations'
import type { ReservationWithRelations } from '@/types'
import type { ReservationFilterStatus } from '@/services/reservations'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, TableBody, TableHead, TableRow, Th, Td } from '@/components/ui/Table'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ReturnStatusBadge } from '@/components/ReturnStatusBadge'
import { NewReservationModal } from '@/components/reservations/NewReservationModal'
import { BorrowDialog } from '@/components/reservations/BorrowDialog'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/utils/cn'
import { formatDate, formatDateTime } from '@/utils/dates'

const filterTabs: { value: ReservationFilterStatus; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'reserved', label: 'Reservadas' },
  { value: 'borrowed', label: 'Prestadas' },
  { value: 'overdue', label: 'Atrasadas' },
  { value: 'returned', label: 'Devueltas' },
  { value: 'cancelled', label: 'Canceladas' },
]

export function Reservations() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = (searchParams.get('status') as ReservationFilterStatus | null) ?? 'all'

  const [newModalOpen, setNewModalOpen] = useState(false)
  const [borrowTarget, setBorrowTarget] = useState<ReservationWithRelations | null>(null)
  const [cancelTarget, setCancelTarget] = useState<ReservationWithRelations | null>(null)
  const [returnTarget, setReturnTarget] = useState<ReservationWithRelations | null>(null)

  const { reservations, loading, error, refetch } = useReservations(status)
  const { showToast } = useToast()

  const setStatus = (value: ReservationFilterStatus) => {
    if (value === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ status: value })
    }
  }

  const handleBorrow = async (expectedReturnDate: string) => {
    if (!borrowTarget) return
    try {
      await borrowReservation(borrowTarget.id, expectedReturnDate)
      showToast('success', 'Reserva marcada como prestada.')
      setBorrowTarget(null)
      refetch()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'No se pudo marcar el préstamo.')
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    try {
      await cancelReservation(cancelTarget.id)
      showToast('success', 'Reserva cancelada.')
      setCancelTarget(null)
      refetch()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'No se pudo cancelar la reserva.')
    }
  }

  const handleReturn = async () => {
    if (!returnTarget) return
    try {
      await returnReservation(returnTarget.id)
      showToast('success', 'Reserva marcada como devuelta.')
      setReturnTarget(null)
      refetch()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'No se pudo registrar la devolución.')
    }
  }

  const renderActions = (r: ReservationWithRelations) => {
    if (r.status === 'reserved') {
      return (
        <div className="flex justify-end gap-1">
          <Button variant="secondary" size="sm" onClick={() => setBorrowTarget(r)}>
            Marcar como prestado
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCancelTarget(r)}>
            Cancelar
          </Button>
        </div>
      )
    }
    if (r.status === 'borrowed') {
      return (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => setReturnTarget(r)}>
            Marcar como devuelto
          </Button>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Reservas</h1>
          <p className="text-sm text-slate-500">Gestiona préstamos, devoluciones y reservas de libros.</p>
        </div>
        <Button onClick={() => setNewModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nueva reserva
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              status === tab.value ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : reservations.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-8 w-8" />} title="No hay reservas para este filtro." />
      ) : (
        <>
          <Table className="hidden md:table">
            <TableHead>
              <TableRow>
                <Th>Fecha</Th>
                <Th>Usuario</Th>
                <Th>Libro</Th>
                <Th className="text-right">Cantidad</Th>
                <Th>Devolución</Th>
                <Th>Estado</Th>
                <Th />
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id}>
                  <Td>{formatDateTime(r.reserved_at)}</Td>
                  <Td className="font-medium text-slate-900">{r.user.name}</Td>
                  <Td>{r.book.title}</Td>
                  <Td className="text-right">{r.quantity}</Td>
                  <Td>{formatDate(r.expected_return_date)}</Td>
                  <Td>
                    <ReturnStatusBadge reservation={r} />
                  </Td>
                  <Td className="text-right">{renderActions(r)}</Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 md:hidden">
            {reservations.map((r) => (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{r.user.name}</p>
                    <p className="text-sm text-slate-600">{r.book.title}</p>
                  </div>
                  <ReturnStatusBadge reservation={r} />
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Reservado: {formatDateTime(r.reserved_at)} · Cantidad: {r.quantity}
                </div>
                {r.expected_return_date && (
                  <div className="mt-1 text-xs text-slate-500">Devolución: {formatDate(r.expected_return_date)}</div>
                )}
                {renderActions(r) && <div className="mt-3">{renderActions(r)}</div>}
              </Card>
            ))}
          </div>
        </>
      )}

      <NewReservationModal open={newModalOpen} onClose={() => setNewModalOpen(false)} onCreated={refetch} />

      <BorrowDialog open={!!borrowTarget} onClose={() => setBorrowTarget(null)} onConfirm={handleBorrow} />

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancelar reserva"
        description={`¿Cancelar la reserva de "${cancelTarget?.book.title}" para ${cancelTarget?.user.name}? El stock se liberará.`}
        confirmLabel="Cancelar reserva"
        tone="danger"
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />

      <ConfirmDialog
        open={!!returnTarget}
        title="Marcar como devuelto"
        description={`¿Confirmar la devolución de "${returnTarget?.book.title}" por parte de ${returnTarget?.user.name}?`}
        confirmLabel="Confirmar devolución"
        onConfirm={handleReturn}
        onCancel={() => setReturnTarget(null)}
      />
    </div>
  )
}
