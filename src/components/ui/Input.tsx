import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const sharedInputClasses =
  'block w-full rounded-md border bg-surface px-3.5 text-base text-ink placeholder:text-ink-muted ' +
  'transition-colors focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-accent-500/30 ' +
  'disabled:cursor-not-allowed disabled:bg-brand-50 disabled:text-ink-muted'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        sharedInputClasses,
        'h-12',
        invalid ? 'border-danger focus:border-danger focus:ring-danger/25' : 'border-border',
        className,
      )}
      {...rest}
    />
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        sharedInputClasses,
        'py-3 leading-relaxed',
        invalid ? 'border-danger focus:border-danger focus:ring-danger/25' : 'border-border',
        className,
      )}
      {...rest}
    />
  )
})

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        sharedInputClasses,
        'h-12 pr-10 appearance-none bg-no-repeat',
        invalid ? 'border-danger focus:border-danger focus:ring-danger/25' : 'border-border',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath fill='none' stroke='%234A5C61' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' d='M1 1.5l5 5 5-5'/%3e%3c/svg%3e\")",
        backgroundPosition: 'right 0.875rem center',
        backgroundSize: '12px 8px',
      }}
      {...rest}
    >
      {children}
    </select>
  )
})
