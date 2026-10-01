import { useCallback, useEffect, useState } from 'react'
import * as booksService from '@/services/books'
import type { Book } from '@/types'
import type { BookFilters } from '@/services/books'

export function useBooks(filters: BookFilters) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)
    booksService
      .listBooks(filters)
      .then(setBooks)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.category, filters.availability])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { books, loading, error, refetch }
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    booksService.listCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  return categories
}
