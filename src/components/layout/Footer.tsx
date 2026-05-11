import Link from 'next/link'
import { Phone, MapPin, Clock, Mail } from 'lucide-react'
import { Brand } from '@/components/ui/Brand'

const QUICK_LINKS = [
  { href: '/bookings/new', label: '新增預約' },
  { href: '/announcements', label: '系統公告' },
  { href: '/profile', label: '個人資料' },
  { href: '/login', label: '登入' },
] as const

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-wide gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <Brand size="md" tone="dark" />
          <p className="text-sm leading-relaxed text-ink-soft">
            花蓮縣政府委託辦理之復康巴士無障礙交通預約管理系統，致力為行動不便者提供安全便捷的乘車服務。
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-ink-soft">
          <h2 className="text-base font-bold text-ink">服務資訊</h2>
          <p className="inline-flex items-center gap-2">
            <Clock size={16} aria-hidden="true" className="text-brand-500" />
            服務時段：08:00 – 17:00（每日）
          </p>
          <p className="inline-flex items-center gap-2">
            <Phone size={16} aria-hidden="true" className="text-brand-500" />
            預約專線：03-822-7171
          </p>
          <p className="inline-flex items-start gap-2">
            <MapPin size={16} aria-hidden="true" className="mt-0.5 text-brand-500" />
            <span>花蓮縣花蓮市府前路 17 號</span>
          </p>
          <p className="inline-flex items-center gap-2">
            <Mail size={16} aria-hidden="true" className="text-brand-500" />
            service@hl.gov.tw
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <h2 className="text-base font-bold text-ink">快速連結</h2>
          <ul className="flex flex-col gap-2">
            {QUICK_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-ink-soft hover:text-brand-500">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <p className="mx-auto max-w-wide px-4 py-4 text-center text-xs text-ink-muted sm:px-6">
          © {new Date().getFullYear()} 花蓮縣政府復康巴士預約系統 ・ 本系統供行動不便者使用
        </p>
      </div>
    </footer>
  )
}
