import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <AlertTriangle className="h-7 w-7 text-red-500" />
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
