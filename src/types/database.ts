import type { Book, Reservation, ReservationStatus, User } from './index'

type Insertable<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>
type Updatable<T> = Partial<Insertable<T>>

interface Relationship {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}

/**
 * Tipado mínimo de la base de datos Supabase, suficiente para tipar
 * `createClient<Database>()`. Refleja el esquema de
 * supabase/migrations/001_initial_schema.sql.
 */
export interface Database {
  public: {
    Tables: {
      books: {
        Row: Book
        Insert: Insertable<Book>
        Update: Updatable<Book>
        Relationships: Relationship[]
      }
      users: {
        Row: User
        Insert: Insertable<User>
        Update: Updatable<User>
        Relationships: Relationship[]
      }
      reservations: {
        Row: Reservation
        Insert: Insertable<Reservation> & { status?: ReservationStatus }
        Update: Updatable<Reservation>
        Relationships: [
          {
            foreignKeyName: 'reservations_book_id_fkey'
            columns: ['book_id']
            isOneToOne: false
            referencedRelation: 'books'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reservations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      create_reservation: {
        Args: {
          p_book_id: string
          p_user_id: string
          p_quantity: number
          p_expected_return_date?: string | null
          p_notes?: string | null
        }
        Returns: Reservation
      }
      borrow_reservation: {
        Args: {
          p_reservation_id: string
          p_expected_return_date: string
        }
        Returns: Reservation
      }
      return_reservation: {
        Args: { p_reservation_id: string }
        Returns: Reservation
      }
      cancel_reservation: {
        Args: { p_reservation_id: string }
        Returns: Reservation
      }
      update_book_stock: {
        Args: { p_book_id: string; p_new_stock: number }
        Returns: Book
      }
    }
    Enums: Record<string, never>
  }
}
