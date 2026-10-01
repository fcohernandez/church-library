import { Link } from 'react-router-dom'
import { AlertTriangle, BookMarked, Library, PackageCheck, PackageSearch } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { Card } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, TableBody, TableHead, TableRow, Th, Td } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { getOverdueDays } from '@/utils/dates'
import { formatDate } from '@/utils/dates'

function StatCard({
  icon: Icon,
  label,
  value,
  to,
  tone = 'default',
}: {
  icon: typeof Library
  label: string
  value: number
  to?: string
  tone?: 'default' | 'danger'
}) {
  const content = (
    <Card className={tone === 'danger' && value > 0 ? 'border-red-200 bg-red-50' : undefined}>
      <div className="flex items-center gap-3">
        <div
          className={
            tone === 'danger' && value > 0
              ? 'rounded-lg bg-red-100 p-2 text-red-600'
              : 'rounded-lg bg-brand-50 p-2 text-brand-600'
          }
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </Card>
  )

  return to ? (
    <Link to={to} className="block transition-transform hover:-translate-y-0.5">
      {content}
    </Link>
  ) : (
    content
  )
}

export function Dashboard() {
  const { stats, overdueReservations, loading, error, refetch } = useDashboard()

  if (loading) return <LoadingState label="Cargando panel…" />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!stats) return null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Panel general</h1>
        <p className="text-sm text-slate-500">Resumen del estado de la biblioteca.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Library} label="Títulos" value={stats.bookTitles} to="/books" />
        <StatCard icon={PackageSearch} label="Ejemplares" value={stats.totalCopies} to="/books" />
        <StatCard icon={PackageCheck} label="Disponibles" value={stats.availableCopies} to="/books" />
        <StatCard icon={BookMarked} label="Reservas activas" value={stats.activeReservations} to="/reservations" />
        <StatCard
          icon={AlertTriangle}
          label="Reservas atrasadas"
          value={stats.overdueReservations}
          to="/reservations?status=overdue"
          tone="danger"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Reservas atrasadas</h2>
          {overdueReservations.length > 0 && (
            <Link to="/reservations?status=overdue">
              <Button variant="secondary" size="sm">
                Ver todas
              </Button>
            </Link>
          )}
        </div>

        {overdueReservations.length === 0 ? (
          <EmptyState icon={<AlertTriangle className="h-8 w-8" />} title="No hay reservas atrasadas." />
        ) : (
          <>
            <Table className="hidden md:table">
              <TableHead>
                <TableRow>
                  <Th>Usuario</Th>
                  <Th>Libro</Th>
                  <Th>Fecha devolución</Th>
                  <Th className="text-right">Atraso</Th>
                  <Th />
                </TableRow>
              </TableHead>
              <TableBody>
                {overdueReservations.map((r) => (
                  <TableRow key={r.id}>
                    <Td>{r.user.name}</Td>
                    <Td>{r.book.title}</Td>
                    <Td>{formatDate(r.expected_return_date)}</Td>
                    <Td className="text-right font-medium text-red-600">{getOverdueDays(r.expected_return_date)} días</Td>
                    <Td className="text-right">
                      <Link to="/reservations?status=overdue">
                        <Button variant="ghost" size="sm">
                          Ver reserva
                        </Button>
                      </Link>
                    </Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-3 md:hidden">
              {overdueReservations.map((r) => (
                <Card key={r.id} className="border-red-200 bg-red-50">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    Atrasada · {getOverdueDays(r.expected_return_date)} días
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-900">{r.user.name}</p>
                  <p className="text-sm text-slate-600">{r.book.title}</p>
                  <p className="mt-1 text-xs text-slate-500">Devolución: {formatDate(r.expected_return_date)}</p>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
