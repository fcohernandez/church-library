import { supabase } from '@/lib/supabase'
import type { User } from '@/types'
import type { UserFormValues } from '@/schemas/user'

export interface UserFilters {
  search?: string
  status?: 'all' | 'active' | 'inactive'
}

function nullifyEmpty(value: string | undefined): string | null {
  return value && value.trim() !== '' ? value.trim() : null
}

export async function listUsers(filters: UserFilters = {}): Promise<User[]> {
  let query = supabase.from('users').select('*').order('name', { ascending: true })

  if (filters.search) {
    const term = filters.search.trim()
    query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%`)
  }
  if (filters.status === 'active') {
    query = query.eq('active', true)
  } else if (filters.status === 'inactive') {
    query = query.eq('active', false)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function listActiveUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*').eq('active', true).order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getUser(id: string): Promise<User> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createUser(values: UserFormValues): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      name: values.name.trim(),
      email: nullifyEmpty(values.email),
      phone: nullifyEmpty(values.phone),
      active: true,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateUser(id: string, values: UserFormValues): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({
      name: values.name.trim(),
      email: nullifyEmpty(values.email),
      phone: nullifyEmpty(values.phone),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function setUserActive(id: string, active: boolean): Promise<User> {
  const { data, error } = await supabase.from('users').update({ active }).eq('id', id).select().single()
  if (error) throw error
  return data
}

/** Cantidad de reservas históricas (cualquier estado) de un usuario. */
export async function countUserReservations(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('reservations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (error) throw error
  return count ?? 0
}
