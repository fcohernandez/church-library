import { useCallback, useEffect, useState } from 'react'
import * as reservationsService from '@/services/reservations'
import type { ReservationWithRelations } from '@/types'
import type { ReservationFilterStatus } from '@/services/reservations'

export function useReservations(status: ReservationFilterStatus) {
  const [reservations, setReservations] = useState<ReservationWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)
    reservationsService
      .listReservations({ status })
      .then(setReservations)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [status])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { reservations, loading, error, refetch }
}
