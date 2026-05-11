import Link from 'next/link'
import { ShieldCheck, MapPinned, HeartHandshake } from 'lucide-react'
import { Brand } from '@/components/ui/Brand'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[1fr_minmax(0,1.1fr)]">
      <aside
        className="relative hidden flex-col justify-between overflow-hidden bg-brand-gradient px-12 py-12 text-white lg:flex"
        aria-hidden="true"
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent-500/25 blur-3xl"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-50/10 blur-3xl"
        />

        <div className="relative">
          <Brand size="lg" tone="light" />
        </div>

        <div className="relative max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-300">
            為您而行 · 安心抵達
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            專為行動不便者打造的<br />
            無障礙交通預約服務
          </h2>
          <p className="mt-4 text-base text-white/80 leading-relaxed">
            線上預約復康巴士、即時掌握車輛位置、家屬可代為申辦，讓每一段旅程都更從容。
          </p>

          <ul className="mt-8 flex flex-col gap-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-300">
                <ShieldCheck size={18} />
              </span>
              <span className="text-white/85">資料加密保護，符合無障礙標準</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-300">
                <MapPinned size={18} />
              </span>
              <span className="text-white/85">即時車輛位置追蹤，安心等候</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-300">
                <HeartHandshake size={18} />
              </span>
              <span className="text-white/85">家屬陪同支援，提供完整協助</span>
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          © {new Date().getFullYear()} 花蓮縣政府
        </p>
      </aside>

      <main id="main-content" className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:py-16">
        <div className="w-full max-w-narrow">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link href="/">
              <Brand size="md" tone="dark" showSubtitle={false} />
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
