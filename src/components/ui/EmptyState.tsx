import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-ink">{title}</p>
        {description && <p className="text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  )
}
