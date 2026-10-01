import { useMemo, useState } from 'react'
import { Plus, Library, PackageX } from 'lucide-react'
import { useBooks, useCategories } from '@/hooks/useBooks'
import { createBook, updateBook } from '@/services/books'
import type { Book } from '@/types'
import type { BookFormValues } from '@/schemas/book'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, TableBody, TableHead, TableRow, Th, Td } from '@/components/ui/Table'
import { BookFormModal } from '@/components/books/BookFormModal'
import { useToast } from '@/components/ui/Toast'

export function Books() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [availability, setAvailability] = useState<'all' | 'available' | 'out_of_stock'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  const filters = useMemo(() => ({ search, category, availability }), [search, category, availability])
  const { books, loading, error, refetch } = useBooks(filters)
  const categories = useCategories()
  const { showToast } = useToast()

  const openCreate = () => {
    setEditingBook(null)
    setModalOpen(true)
  }

  const openEdit = (book: Book) => {
    setEditingBook(book)
    setModalOpen(true)
  }

  const handleSubmit = async (values: BookFormValues) => {
    try {
      if (editingBook) {
        await updateBook(editingBook.id, values, editingBook.stock)
        showToast('success', 'Libro actualizado correctamente.')
      } else {
        await createBook(values)
        showToast('success', 'Libro creado correctamente.')
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'No se pudo guardar el libro.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Libros</h1>
          <p className="text-sm text-slate-500">Administra el catálogo e inventario de la biblioteca.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Agregar libro
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar por título, autor o ISBN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="md:w-48">
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          value={availability}
          onChange={(e) => setAvailability(e.target.value as typeof availability)}
          className="md:w-48"
        >
          <option value="all">Todos</option>
          <option value="available">Disponibles</option>
          <option value="out_of_stock">Sin stock</option>
        </Select>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : books.length === 0 ? (
        <EmptyState
          icon={<Library className="h-8 w-8" />}
          title="No se encontraron libros."
          description="Prueba con otros filtros o agrega un nuevo libro."
        />
      ) : (
        <>
          <Table className="hidden md:table">
            <TableHead>
              <TableRow>
                <Th>Libro</Th>
                <Th>Autor</Th>
                <Th>Categoría</Th>
                <Th className="text-right">Stock</Th>
                <Th className="text-right">Disponible</Th>
                <Th>Estado</Th>
                <Th />
              </TableRow>
            </TableHead>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <Td className="font-medium text-slate-900">{book.title}</Td>
                  <Td>{book.author || '—'}</Td>
                  <Td>{book.category || '—'}</Td>
                  <Td className="text-right">{book.stock}</Td>
                  <Td className="text-right">{book.available_stock}</Td>
                  <Td>
                    {book.available_stock === 0 ? (
                      <Badge tone="red" icon={<PackageX className="h-3.5 w-3.5" />}>
                        Sin stock
                      </Badge>
                    ) : (
                      <Badge tone="green">Disponible</Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(book)}>
                      Editar
                    </Button>
                  </Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 md:hidden">
            {books.map((book) => (
              <Card key={book.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{book.title}</p>
                    <p className="text-sm text-slate-500">{book.author || 'Autor desconocido'}</p>
                  </div>
                  {book.available_stock === 0 ? (
                    <Badge tone="red">Sin stock</Badge>
                  ) : (
                    <Badge tone="green">Disponible</Badge>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <span>
                    Stock: <strong>{book.stock}</strong> · Disponible: <strong>{book.available_stock}</strong>
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(book)}>
                    Editar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <BookFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} book={editingBook} />
    </div>
  )
}
