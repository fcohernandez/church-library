import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, LayoutDashboard, Library, Menu, Users, X } from 'lucide-react'
import { cn } from '@/utils/cn'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/books', label: 'Libros', icon: Library, end: false },
  { to: '/users', label: 'Usuarios', icon: Users, end: false },
  { to: '/reservations', label: 'Reservas', icon: BookOpen, end: false },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
            )
          }
        >
          <item.icon className="h-4.5 w-4.5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <Library className="h-5 w-5 text-brand-600" />
          Biblioteca
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <div className="relative flex h-full w-64 flex-col gap-4 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Library className="h-5 w-5 text-brand-600" />
                Biblioteca
              </div>
              <button onClick={() => setMobileOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r border-slate-200 bg-white p-4 md:flex">
          <div className="flex items-center gap-2 px-2 font-semibold text-slate-900">
            <Library className="h-5 w-5 text-brand-600" />
            Biblioteca
          </div>
          <NavLinks />
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
