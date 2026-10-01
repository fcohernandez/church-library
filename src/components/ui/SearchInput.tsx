import type { InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/utils/cn'

export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        className={cn(
          'w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400',
          'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
          className,
        )}
        {...props}
      />
    </div>
  )
}
