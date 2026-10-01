export type ReservationStatus = 'reserved' | 'borrowed' | 'returned' | 'cancelled'

export interface Book {
  id: string
  title: string
  author: string | null
  description: string | null
  category: string | null
  isbn: string | null
  stock: number
  available_stock: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  name: string
  email: string | null
  phone: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  book_id: string
  user_id: string
  quantity: number
  status: ReservationStatus
  reserved_at: string
  expected_return_date: string | null
  updated_at: string
  notes: string | null
}

/** Reserva con los datos del libro y usuario relacionados (join). */
export interface ReservationWithRelations extends Reservation {
  book: Pick<Book, 'id' | 'title' | 'author'>
  user: Pick<User, 'id' | 'name' | 'email'>
}

/** Estado de devolución derivado, calculado en el cliente. Nunca se persiste. */
export type ReservationReturnStatus =
  | 'not_applicable'
  | 'upcoming'
  | 'due_soon'
  | 'overdue'
  | 'returned'
  | 'cancelled'

export interface DashboardStats {
  bookTitles: number
  totalCopies: number
  availableCopies: number
  activeReservations: number
  overdueReservations: number
}
