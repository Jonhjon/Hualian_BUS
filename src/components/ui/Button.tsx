import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-700 active:bg-brand-700 shadow-soft',
  accent:
    'bg-accent-500 text-white hover:bg-accent-700 active:bg-accent-700 shadow-soft',
  secondary:
    'bg-surface text-brand-500 border border-brand-500 hover:bg-brand-50 active:bg-brand-100',
  ghost:
    'bg-transparent text-brand-500 hover:bg-brand-50 active:bg-brand-100',
  danger:
    'bg-danger text-white hover:bg-danger/90 active:bg-danger/90 shadow-soft',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm gap-1.5',
  md: 'h-12 px-6 text-base gap-2',
  lg: 'h-14 px-8 text-lg gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  )
})
