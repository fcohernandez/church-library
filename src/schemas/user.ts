import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  email: z
    .string()
    .trim()
    .email('Correo inválido')
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
})

export type UserFormValues = z.infer<typeof userSchema>
