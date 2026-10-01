import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createReservationSchema, type ReservationFormValues } from '@/schemas/reservation'
import { listActiveUsers } from '@/services/users'
import { listAvailableBooks } from '@/services/books'
import { createReservation } from '@/services/reservations'
import type { Book, User } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { DatePicker } from '@/components/ui/DatePicker'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatDate, todayIsoDate } from '@/utils/dates'

interface NewReservationModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function NewReservationModal({ open, onClose, onCreated }: NewReservationModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [step, setStep] = useState<'form' | 'summary'>('form')
  const [creating, setCreating] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (!open) return
    setStep('form')
    Promise.all([listActiveUsers(), listAvailableBooks()])
      .then(([u, b]) => {
        setUsers(u)
        setBooks(b)
      })
      .catch((err: Error) => {
        showToast('error', err.message || 'No se pudieron cargar usuarios y libros.')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const availableStockRef = useRef(0)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    resolver: (values, context, options) =>
      zodResolver(createReservationSchema(availableStockRef.current))(values, context, options),
    defaultValues: { user_id: '', book_id: '', quantity: 1, expected_return_date: '', notes: '' },
  })

  const selectedBookId = watch('book_id')
  const selectedUserId = watch('user_id')
  const quantity = watch('quantity')
  const expectedReturnDate = watch('expected_return_date')
  const notes = watch('notes')

  const selectedBook = useMemo(() => books.find((b) => b.id === selectedBookId), [books, selectedBookId])
  const selectedUser = useMemo(() => users.find((u) => u.id === selectedUserId), [users, selectedUserId])
  const availableStock = selectedBook?.available_stock ?? 0
  availableStockRef.current = availableStock

  useEffect(() => {
    if (!open) {
      reset({ user_id: '', book_id: '', quantity: 1, expected_return_date: '', notes: '' })
    }
  }, [open, reset])

  const goToSummary = handleSubmit(() => {
    if (Number(quantity) > availableStock) return
    setStep('summary')
  })

  const confirm = async () => {
    setCreating(true)
    try {
      await createReservation({
        book_id: selectedBookId,
        user_id: selectedUserId,
        quantity: Number(quantity),
        expected_return_date: expectedReturnDate || null,
        notes: notes || null,
      })
      showToast('success', 'Reserva creada correctamente.')
      onCreated()
      onClose()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'No se pudo crear la reserva.')
      setStep('form')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva reserva"
      footer={
        step === 'form' ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={goToSummary} disabled={!selectedBookId || !selectedUserId}>
              Continuar
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setStep('form')} disabled={creating}>
              Volver
            </Button>
            <Button onClick={confirm} loading={creating}>
              Confirmar reserva
            </Button>
          </>
        )
      }
    >
      {step === 'form' ? (
        <form className="flex flex-col gap-4">
          <Select label="Usuario" required {...register('user_id')} error={errors.user_id?.message}>
            <option value="">Selecciona un usuario…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>

          <Select label="Libro" required {...register('book_id')} error={errors.book_id?.message}>
            <option value="">Selecciona un libro…</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} ({b.available_stock} disponibles)
              </option>
            ))}
          </Select>

          {selectedBook && <p className="text-xs text-slate-500">Stock disponible: {selectedBook.available_stock}</p>}

          <Input
            label="Cantidad"
            type="number"
            min={1}
            max={availableStock || 1}
            required
            disabled={!selectedBookId}
            {...register('quantity')}
            error={errors.quantity?.message}
          />

          <DatePicker
            label="Fecha esperada de devolución"
            min={todayIsoDate()}
            {...register('expected_return_date')}
            error={errors.expected_return_date?.message}
            hint="Opcional al crear; será obligatoria al marcar el préstamo como entregado."
          />

          <Textarea label="Notas" {...register('notes')} />
        </form>
      ) : (
        <dl className="grid grid-cols-2 gap-y-4 text-sm">
          <dt className="text-slate-500">Usuario</dt>
          <dd className="text-right font-medium text-slate-900">{selectedUser?.name}</dd>

          <dt className="text-slate-500">Libro</dt>
          <dd className="text-right font-medium text-slate-900">{selectedBook?.title}</dd>

          <dt className="text-slate-500">Cantidad</dt>
          <dd className="text-right font-medium text-slate-900">{quantity}</dd>

          <dt className="text-slate-500">Fecha esperada de devolución</dt>
          <dd className="text-right font-medium text-slate-900">
            {expectedReturnDate ? formatDate(expectedReturnDate) : 'Por definir'}
          </dd>

          <dt className="text-slate-500">Stock disponible</dt>
          <dd className="text-right font-medium text-slate-900">{selectedBook?.available_stock}</dd>

          <dt className="text-slate-500">Stock restante</dt>
          <dd className="text-right font-medium text-slate-900">{availableStock - Number(quantity || 0)}</dd>
        </dl>
      )}
    </Modal>
  )
}
