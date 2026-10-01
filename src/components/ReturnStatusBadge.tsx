import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { Reservation } from '@/types'
import { getOverdueDays, getDaysUntil } from '@/utils/dates'
import { getReturnStatus } from '@/utils/returnStatus'
import { Badge } from './ui/Badge'

interface ReturnStatusBadgeProps {
  reservation: Pick<Reservation, 'status' | 'expected_return_date'>
}

/**
 * Badge responsable de comunicar el estado de devolución de una reserva:
 * Devuelto, Vence pronto, Prestado, Atrasada · X días, Cancelada.
 * No depende únicamente del color: siempre incluye icono + texto.
 */
export function ReturnStatusBadge({ reservation }: ReturnStatusBadgeProps) {
  const status = getReturnStatus(reservation)

  switch (status) {
    case 'overdue': {
      const days = getOverdueDays(reservation.expected_return_date)
      return (
        <Badge tone="red" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
          Atrasada · {days} {days === 1 ? 'día' : 'días'}
        </Badge>
      )
    }
    case 'due_soon': {
      const days = getDaysUntil(reservation.expected_return_date) ?? 0
      return (
        <Badge tone="amber" icon={<Clock className="h-3.5 w-3.5" />}>
          Vence en {days} {days === 1 ? 'día' : 'días'}
        </Badge>
      )
    }
    case 'upcoming':
      return (
        <Badge tone="blue" icon={<Clock className="h-3.5 w-3.5" />}>
          Prestado
        </Badge>
      )
    case 'returned':
      return (
        <Badge tone="green" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
          Devuelto
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge tone="slate" icon={<XCircle className="h-3.5 w-3.5" />}>
          Cancelada
        </Badge>
      )
    case 'not_applicable':
    default:
      return (
        <Badge tone="purple" icon={<Clock className="h-3.5 w-3.5" />}>
          Reservado
        </Badge>
      )
  }
}
