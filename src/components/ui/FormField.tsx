import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface FormFieldProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  const errorId = `${htmlFor}-error`
  const hintId = `${htmlFor}-hint`

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="inline-flex items-center gap-1">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-soft">
          {label}
        </label>
        {required && (
          <span aria-hidden="true" className="text-danger font-bold">
            *
          </span>
        )}
      </div>
      {children}
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
