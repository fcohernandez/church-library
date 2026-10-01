/**
 * Utilidades de fecha basadas en días calendario (no timestamps), para
 * evitar desfases de timezone al comparar `expected_return_date` (DATE)
 * contra la fecha actual.
 */

/** Convierte un string 'YYYY-MM-DD' a un Date en UTC a medianoche. */
function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/** Fecha actual truncada a día calendario (UTC medianoche). */
function todayDateOnly(reference: Date = new Date()): Date {
  return new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()))
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Retorna la cantidad de días de atraso entre `expectedReturnDate` y
 * `currentDate`. Retorna 0 si aún no está atrasada.
 */
export function getOverdueDays(expectedReturnDate: string | null, currentDate: Date = new Date()): number {
  if (!expectedReturnDate) return 0
  const expected = parseDateOnly(expectedReturnDate)
  const today = todayDateOnly(currentDate)
  const diffDays = Math.round((today.getTime() - expected.getTime()) / MS_PER_DAY)
  return diffDays > 0 ? diffDays : 0
}

/** Días restantes hasta la fecha esperada (negativo si ya pasó). */
export function getDaysUntil(expectedReturnDate: string | null, currentDate: Date = new Date()): number | null {
  if (!expectedReturnDate) return null
  const expected = parseDateOnly(expectedReturnDate)
  const today = todayDateOnly(currentDate)
  return Math.round((expected.getTime() - today.getTime()) / MS_PER_DAY)
}

/** Formatea 'YYYY-MM-DD' como dd/mm/aaaa. */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = parseDateOnly(dateStr)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()
  return `${day}/${month}/${year}`
}

/** Formatea un timestamp ISO como dd/mm/aaaa. */
export function formatDateTime(isoStr: string | null): string {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/** 'YYYY-MM-DD' de hoy, para usar como min en inputs de fecha. */
export function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
