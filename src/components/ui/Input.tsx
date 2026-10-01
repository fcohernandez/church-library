import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, required, ...props }, ref) => {
    const inputId = id ?? props.name
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
            'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
            'disabled:bg-slate-100 disabled:text-slate-400',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500',
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
