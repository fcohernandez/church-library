import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { borrowReservationSchema, type BorrowReservationFormValues } from '@/schemas/reservation'
import { Modal } from '@/components/ui/Modal'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import { todayIsoDate } from '@/utils/dates'

interface BorrowDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (expectedReturnDate: string) => Promise<void>
}

export function BorrowDialog({ open, onClose, onConfirm }: BorrowDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BorrowReservationFormValues>({
    resolver: zodResolver(borrowReservationSchema),
    defaultValues: { expected_return_date: '' },
  })

  const submit = handleSubmit(async (values) => {
    await onConfirm(values.expected_return_date)
    reset()
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Marcar como prestado"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="borrow-form" loading={isSubmitting}>
            Confirmar préstamo
          </Button>
        </>
      }
    >
      <form id="borrow-form" onSubmit={submit}>
        <DatePicker
          label="Fecha esperada de devolución"
          required
          min={todayIsoDate()}
          {...register('expected_return_date')}
          error={errors.expected_return_date?.message}
        />
      </form>
    </Modal>
  )
}
