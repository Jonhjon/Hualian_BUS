import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type CardVariant = 'default' | 'featured' | 'flat' | 'subtle'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  as?: 'div' | 'article' | 'section'
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-surface border border-border shadow-soft',
  featured:
    'bg-surface border border-border shadow-card border-l-4 border-l-accent-500',
  flat: 'bg-surface border border-border',
  subtle: 'bg-brand-50 border border-brand-100',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', as = 'div', className, ...rest },
  ref,
) {
  const Comp = as as 'div'
  return (
    <Comp
      ref={ref}
      className={cn('rounded-lg p-6', variantClasses[variant], className)}
      {...rest}
    />
  )
})

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex items-start gap-3', className)} {...rest} />
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-bold text-ink', className)} {...rest} />
}

export function CardDescription({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-ink-soft', className)} {...rest} />
}
