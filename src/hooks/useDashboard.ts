import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { listOverdueReservations } from '@/services/reservations'
import type { DashboardStats, ReservationWithRelations } from '@/types'

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [overdueReservations, setOverdueReservations] = useState<ReservationWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)

    Promise.all([
      supabase.from('books').select('stock, available_stock'),
      supabase.from('reservations').select('status').in('status', ['reserved', 'borrowed']),
      listOverdueReservations(),
    ])
      .then(([booksRes, activeRes, overdue]) => {
        if (booksRes.error) throw booksRes.error
        if (activeRes.error) throw activeRes.error

        const books = booksRes.data ?? []
        const totalCopies = books.reduce((sum, b) => sum + b.stock, 0)
        const availableCopies = books.reduce((sum, b) => sum + b.available_stock, 0)

        setStats({
          bookTitles: books.length,
          totalCopies,
          availableCopies,
          activeReservations: (activeRes.data ?? []).length,
          overdueReservations: overdue.length,
        })
        setOverdueReservations(overdue)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { stats, overdueReservations, loading, error, refetch }
}
