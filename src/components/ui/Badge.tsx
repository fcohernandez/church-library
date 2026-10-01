import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type BadgeTone = 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'purple'

interface BadgeProps {
  tone?: BadgeTone
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const toneClasses: Record<BadgeTone, string> = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-300',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  green: 'bg-green-50 text-green-700 ring-green-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-300',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
}

export function Badge({ tone = 'slate', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
