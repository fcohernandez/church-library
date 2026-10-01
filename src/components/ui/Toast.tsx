import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '@/utils/cn'

type ToastKind = 'success' | 'error'

interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

interface ToastContextValue {
  showToast: (kind: ToastKind, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((kind: ToastKind, message: string) => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, kind, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg',
              toast.kind === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50',
            )}
          >
            {toast.kind === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            )}
            <p className={cn('flex-1 text-sm', toast.kind === 'success' ? 'text-green-800' : 'text-red-800')}>
              {toast.message}
            </p>
            <button onClick={() => dismiss(toast.id)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
