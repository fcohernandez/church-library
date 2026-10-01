import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema, type UserFormValues } from '@/schemas/user'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { User } from '@/types'

interface UserFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: UserFormValues) => Promise<void>
  user?: User | null
}

const emptyValues: UserFormValues = { name: '', email: '', phone: '' }

export function UserFormModal({ open, onClose, onSubmit, user }: UserFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    reset(user ? { name: user.name, email: user.email ?? '', phone: user.phone ?? '' } : emptyValues)
  }, [open, user, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? 'Editar usuario' : 'Nuevo usuario'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="user-form" loading={isSubmitting}>
            {user ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} className="flex flex-col gap-4">
        <Input label="Nombre" required {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Teléfono" {...register('phone')} error={errors.phone?.message} />
      </form>
    </Modal>
  )
}
