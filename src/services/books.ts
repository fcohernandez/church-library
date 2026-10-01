import { supabase } from '@/lib/supabase'
import type { Book } from '@/types'
import type { BookFormValues } from '@/schemas/book'

export interface BookFilters {
  search?: string
  category?: string
  availability?: 'all' | 'available' | 'out_of_stock'
}

function nullifyEmpty(value: string | undefined): string | null {
  return value && value.trim() !== '' ? value.trim() : null
}

export async function listBooks(filters: BookFilters = {}): Promise<Book[]> {
  let query = supabase.from('books').select('*').order('title', { ascending: true })

  if (filters.search) {
    const term = filters.search.trim()
    query = query.or(`title.ilike.%${term}%,author.ilike.%${term}%,isbn.ilike.%${term}%`)
  }
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.availability === 'available') {
    query = query.gt('available_stock', 0)
  } else if (filters.availability === 'out_of_stock') {
    query = query.eq('available_stock', 0)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function listAvailableBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .gt('available_stock', 0)
    .order('title', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getBook(id: string): Promise<Book> {
  const { data, error } = await supabase.from('books').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function listCategories(): Promise<string[]> {
  const { data, error } = await supabase.from('books').select('category').not('category', 'is', null)
  if (error) throw error
  const categories = new Set((data ?? []).map((row) => row.category).filter(Boolean) as string[])
  return Array.from(categories).sort()
}

export async function createBook(values: BookFormValues): Promise<Book> {
  const { data, error } = await supabase
    .from('books')
    .insert({
      title: values.title.trim(),
      author: nullifyEmpty(values.author),
      description: nullifyEmpty(values.description),
      category: nullifyEmpty(values.category),
      isbn: nullifyEmpty(values.isbn),
      stock: values.stock,
      available_stock: values.stock,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Actualiza los metadatos del libro. Si `stock` cambió respecto al valor
 * actual, delega el ajuste de `available_stock` a la RPC `update_book_stock`
 * para que la validación de "no bajar del comprometido" y el cálculo
 * atómico ocurran en la base de datos.
 */
export async function updateBook(id: string, values: BookFormValues, currentStock: number): Promise<Book> {
  const { error: metaError } = await supabase
    .from('books')
    .update({
      title: values.title.trim(),
      author: nullifyEmpty(values.author),
      description: nullifyEmpty(values.description),
      category: nullifyEmpty(values.category),
      isbn: nullifyEmpty(values.isbn),
    })
    .eq('id', id)
  if (metaError) throw metaError

  if (values.stock !== currentStock) {
    const { data, error } = await supabase.rpc('update_book_stock', {
      p_book_id: id,
      p_new_stock: values.stock,
    })
    if (error) throw error
    return data as unknown as Book
  }

  return getBook(id)
}
