import { supabase } from '@/lib/supabase'
import type { Reservation, ReservationStatus, ReservationWithRelations } from '@/types'

export type ReservationFilterStatus = 'all' | ReservationStatus | 'overdue'

export interface ReservationFilters {
  status?: ReservationFilterStatus
}

const RESERVATION_SELECT = `
  *,
  book:books ( id, title, author ),
  user:users ( id, name, email )
`

export async function listReservations(filters: ReservationFilters = {}): Promise<ReservationWithRelations[]> {
  let query = supabase
    .from('reservations')
    .select(RESERVATION_SELECT)
    .order('reserved_at', { ascending: false })

  if (filters.status === 'overdue') {
    query = query.eq('status', 'borrowed').lt('expected_return_date', new Date().toISOString().slice(0, 10))
  } else if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as ReservationWithRelations[]
}

export async function listOverdueReservations(): Promise<ReservationWithRelations[]> {
  return listReservations({ status: 'overdue' })
}

/** Cantidad de reservas históricas por usuario, para la tabla de usuarios. */
export async function getReservationCountsByUser(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('reservations').select('user_id')
  if (error) throw error
  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.user_id] = (counts[row.user_id] ?? 0) + 1
  }
  return counts
}

export interface CreateReservationInput {
  book_id: string
  user_id: string
  quantity: number
  expected_return_date?: string | null
  notes?: string | null
}

export async function createReservation(input: CreateReservationInput): Promise<Reservation> {
  const { data, error } = await supabase.rpc('create_reservation', {
    p_book_id: input.book_id,
    p_user_id: input.user_id,
    p_quantity: input.quantity,
    p_expected_return_date: input.expected_return_date || null,
    p_notes: input.notes || null,
  })
  if (error) throw error
  return data as unknown as Reservation
}

export async function borrowReservation(reservationId: string, expectedReturnDate: string): Promise<Reservation> {
  const { data, error } = await supabase.rpc('borrow_reservation', {
    p_reservation_id: reservationId,
    p_expected_return_date: expectedReturnDate,
  })
  if (error) throw error
  return data as unknown as Reservation
}

export async function returnReservation(reservationId: string): Promise<Reservation> {
  const { data, error } = await supabase.rpc('return_reservation', {
    p_reservation_id: reservationId,
  })
  if (error) throw error
  return data as unknown as Reservation
}

export async function cancelReservation(reservationId: string): Promise<Reservation> {
  const { data, error } = await supabase.rpc('cancel_reservation', {
    p_reservation_id: reservationId,
  })
  if (error) throw error
  return data as unknown as Reservation
}
