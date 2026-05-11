import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  icon?: ReactNode
}

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-success-soft text-success border-success/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
  info: 'bg-info-soft text-info border-info/20',
  accent: 'bg-accent-50 text-accent-700 border-accent-100',
  neutral: 'bg-brand-50 text-ink-soft border-border',
}

export function Badge({ tone = 'neutral', icon, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </span>
  )
}
