import { Bus } from 'lucide-react'
import { cn } from '@/lib/cn'

type BrandSize = 'sm' | 'md' | 'lg'
type BrandTone = 'light' | 'dark'

interface BrandProps {
  size?: BrandSize
  tone?: BrandTone
  showSubtitle?: boolean
  className?: string
}

const sizeMap: Record<BrandSize, { icon: number; box: string; title: string; subtitle: string }> = {
  sm: { icon: 18, box: 'h-9 w-9 rounded-lg', title: 'text-base', subtitle: 'text-[10px]' },
  md: { icon: 22, box: 'h-11 w-11 rounded-xl', title: 'text-lg', subtitle: 'text-xs' },
  lg: { icon: 30, box: 'h-14 w-14 rounded-2xl', title: 'text-2xl', subtitle: 'text-sm' },
}

export function Brand({ size = 'md', tone = 'light', showSubtitle = true, className }: BrandProps) {
  const s = sizeMap[size]
  const isLight = tone === 'light'

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex items-center justify-center shadow-soft',
          s.box,
          isLight ? 'bg-accent-500 text-white' : 'bg-cream text-brand-500',
        )}
      >
        <Bus size={s.icon} strokeWidth={2.2} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className={cn('font-bold tracking-tight', s.title, isLight ? 'text-white' : 'text-ink')}>
          花蓮復康巴士
        </span>
        {showSubtitle && (
          <span className={cn('font-medium', s.subtitle, isLight ? 'text-brand-50/80' : 'text-ink-soft')}>
            Hualien Rehabilitation Bus
          </span>
        )}
      </span>
    </div>
  )
}
