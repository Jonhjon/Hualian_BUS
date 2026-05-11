import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 border-b border-border/70 pb-6 mb-6 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span
            className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-ink-soft sm:text-base">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
