import { z } from 'zod'

export const bookSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio'),
  author: z.string().trim().optional().or(z.literal('')),
  description: z.string().trim().optional().or(z.literal('')),
  category: z.string().trim().optional().or(z.literal('')),
  isbn: z.string().trim().optional().or(z.literal('')),
  stock: z.coerce
    .number({ invalid_type_error: 'El stock debe ser un número' })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
})

export type BookFormValues = z.infer<typeof bookSchema>
