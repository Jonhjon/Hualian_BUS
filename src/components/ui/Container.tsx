import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type ContainerSize = 'narrow' | 'content' | 'wide'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize
  as?: 'div' | 'section' | 'main'
}

const sizeClasses: Record<ContainerSize, string> = {
  narrow: 'max-w-narrow',
  content: 'max-w-content',
  wide: 'max-w-wide',
}

export function Container({ size = 'content', as = 'div', className, ...rest }: ContainerProps) {
  const Comp = as as 'div'
  return (
    <Comp
      className={cn('mx-auto w-full px-4 sm:px-6', sizeClasses[size], className)}
      {...rest}
    />
  )
}
