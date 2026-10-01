import { z } from 'zod'
import { todayIsoDate } from '@/utils/dates'

/**
 * Schema de creación de reserva. `availableStock` se inyecta dinámicamente
 * porque el máximo permitido de `quantity` depende del libro seleccionado.
 */
export function createReservationSchema(availableStock: number) {
  return z
    .object({
      user_id: z.string().uuid('Selecciona un usuario'),
      book_id: z.string().uuid('Selecciona un libro'),
      quantity: z.coerce
        .number({ invalid_type_error: 'La cantidad debe ser un número' })
        .int('La cantidad debe ser un número entero')
        .min(1, 'La cantidad mínima es 1')
        .max(Math.max(availableStock, 0), `La cantidad no puede superar el stock disponible (${availableStock})`),
      expected_return_date: z
        .string()
        .optional()
        .or(z.literal('')),
      notes: z.string().trim().optional().or(z.literal('')),
    })
    .refine(
      (data) => !data.expected_return_date || data.expected_return_date >= todayIsoDate(),
      {
        message: 'La fecha esperada de devolución no puede ser anterior a hoy',
        path: ['expected_return_date'],
      },
    )
}

export type ReservationFormValues = z.infer<ReturnType<typeof createReservationSchema>>

export const borrowReservationSchema = z.object({
  expected_return_date: z
    .string()
    .min(1, 'La fecha esperada de devolución es obligatoria')
    .refine((date) => date >= todayIsoDate(), 'La fecha no puede ser anterior a hoy'),
})

export type BorrowReservationFormValues = z.infer<typeof borrowReservationSchema>
