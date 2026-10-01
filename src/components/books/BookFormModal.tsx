import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookSchema, type BookFormValues } from '@/schemas/book'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { Book } from '@/types'

interface BookFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: BookFormValues) => Promise<void>
  book?: Book | null
}

const emptyValues: BookFormValues = {
  title: '',
  author: '',
  description: '',
  category: '',
  isbn: '',
  stock: 0,
}

export function BookFormModal({ open, onClose, onSubmit, book }: BookFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    reset(
      book
        ? {
            title: book.title,
            author: book.author ?? '',
            description: book.description ?? '',
            category: book.category ?? '',
            isbn: book.isbn ?? '',
            stock: book.stock,
          }
        : emptyValues,
    )
  }, [open, book, reset])

  const committed = book ? book.stock - book.available_stock : 0

  const submit = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={book ? 'Editar libro' : 'Nuevo libro'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="book-form" loading={isSubmitting}>
            {book ? 'Guardar cambios' : 'Crear libro'}
          </Button>
        </>
      }
    >
      <form id="book-form" onSubmit={submit} className="flex flex-col gap-4">
        <Input label="Título" required {...register('title')} error={errors.title?.message} />
        <Input label="Autor" {...register('author')} error={errors.author?.message} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Categoría" {...register('category')} error={errors.category?.message} />
          <Input label="ISBN" {...register('isbn')} error={errors.isbn?.message} />
        </div>
        <Textarea label="Descripción" {...register('description')} error={errors.description?.message} />
        <Input
          label="Stock"
          type="number"
          min={committed}
          required
          {...register('stock')}
          error={errors.stock?.message}
          hint={book && committed > 0 ? `No puede ser menor a ${committed} (ejemplares prestados/reservados)` : undefined}
        />
      </form>
    </Modal>
  )
}
