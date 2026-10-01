import { useCallback, useEffect, useState } from 'react'
import * as usersService from '@/services/users'
import * as reservationsService from '@/services/reservations'
import type { User } from '@/types'
import type { UserFilters } from '@/services/users'

export function useUsers(filters: UserFilters) {
  const [users, setUsers] = useState<User[]>([])
  const [reservationCounts, setReservationCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([usersService.listUsers(filters), reservationsService.getReservationCountsByUser()])
      .then(([userList, counts]) => {
        setUsers(userList)
        setReservationCounts(counts)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { users, reservationCounts, loading, error, refetch }
}
