import type { Reservation, ReservationReturnStatus } from '@/types'
import { getDaysUntil, getOverdueDays } from './dates'

/** Días de anticipación para considerar una reserva "próxima a vencer". */
export const DUE_SOON_THRESHOLD_DAYS = 3

/**
 * Calcula el estado de devolución derivado de una reserva. Nunca se
 * persiste en la base de datos: se calcula a partir de `status`,
 * `expected_return_date` y la fecha actual.
 */
export function getReturnStatus(
  reservation: Pick<Reservation, 'status' | 'expected_return_date'>,
  currentDate: Date = new Date(),
): ReservationReturnStatus {
  const { status, expected_return_date } = reservation

  if (status === 'returned') return 'returned'
  if (status === 'cancelled') return 'cancelled'
  if (status === 'reserved') return 'not_applicable'

  // status === 'borrowed'
  if (!expected_return_date) return 'not_applicable'

  const overdueDays = getOverdueDays(expected_return_date, currentDate)
  if (overdueDays > 0) return 'overdue'

  const daysUntil = getDaysUntil(expected_return_date, currentDate)
  if (daysUntil !== null && daysUntil <= DUE_SOON_THRESHOLD_DAYS) return 'due_soon'

  return 'upcoming'
}

/** true si la reserva debe contarse/filtrarse como atrasada. */
export function isOverdue(reservation: Pick<Reservation, 'status' | 'expected_return_date'>, currentDate: Date = new Date()): boolean {
  return getReturnStatus(reservation, currentDate) === 'overdue'
}
