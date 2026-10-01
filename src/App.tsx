import { Route, Routes } from 'react-router-dom'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { Books } from '@/pages/Books'
import { Users } from '@/pages/Users'
import { Reservations } from '@/pages/Reservations'
import { SetupRequired } from '@/pages/SetupRequired'

export default function App() {
  if (!isSupabaseConfigured) {
    return <SetupRequired />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />
        <Route path="/users" element={<Users />} />
        <Route path="/reservations" element={<Reservations />} />
      </Route>
    </Routes>
  )
}
