import { cookies } from 'next/headers'
import Link from 'next/link'
import {
  CalendarCheck,
  MapPin,
  Users,
  ArrowRight,
  UserPlus,
  PhoneCall,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'

const FEATURES = [
  {
    icon: CalendarCheck,
    title: '便捷預約',
    desc: '線上預約復康巴士，可預約今日至 7 天後的時段，去回程一次完成。',
    href: '/bookings/new',
    cta: '立即預約',
  },
  {
    icon: MapPin,
    title: '即時追蹤',
    desc: '預約成功後即可查看車輛即時位置，30 秒自動更新，安心等候服務。',
    href: '/bookings',
    cta: '查看預約',
  },
  {
    icon: Users,
    title: '家屬陪同',
    desc: '支援家屬代為預約，全程提供同行無障礙服務，照護更貼心。',
    href: '/register',
    cta: '申請帳號',
  },
] as const

const STEPS = [
  { num: '01', title: '申請帳號', desc: '填寫基本資料完成註冊' },
  { num: '02', title: '線上預約', desc: '選擇日期時段與起訖點' },
  { num: '03', title: '等候追蹤', desc: '即時查看車輛位置' },
  { num: '04', title: '完成回饋', desc: '為服務評分留言' },
] as const

export default function HomePage() {
  const isLoggedIn = Boolean(cookies().get('auth_token')?.value)
  const bookingHref = isLoggedIn ? '/bookings/new' : '/login?next=/bookings/new'

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navigation isLoggedIn={isLoggedIn} />
      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden bg-cream-gradient pt-12 pb-16 sm:pt-16 sm:pb-24">
          <div className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-accent-100/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl" />
          <Container size="wide" className="relative">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
              <div className="flex flex-col gap-6">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-accent-700">
                  <ShieldCheck size={14} aria-hidden="true" />
                  花蓮縣政府服務
                </span>
                <h1 className="text-4xl font-bold leading-[1.15] text-ink sm:text-hero">
                  為您而行<span className="text-accent-500">，</span><br />
                  安心抵達每一段旅程
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
                  花蓮縣復康巴士預約系統 — 為行動不便者提供便捷、安全的無障礙交通服務。線上預約、即時追蹤、家屬代辦，全部在這裡完成。
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={bookingHref}
                    className="inline-flex h-14 items-center gap-2 rounded-md bg-accent-500 px-7 text-lg font-semibold text-white shadow-soft hover:bg-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                  >
                    立即預約
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/announcements"
                    className="inline-flex h-14 items-center gap-2 rounded-md border border-brand-500 bg-surface px-7 text-lg font-semibold text-brand-500 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                  >
                    查看公告
                  </Link>
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-border/70 pt-6 text-sm">
                  <div>
                    <dt className="inline-flex items-center gap-1.5 text-ink-muted">
                      <Clock size={14} className="text-brand-500" aria-hidden="true" />服務時段
                    </dt>
                    <dd className="mt-1 text-base font-bold text-ink">08:00–17:00</dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-1.5 text-ink-muted">
                      <PhoneCall size={14} className="text-brand-500" aria-hidden="true" />預約專線
                    </dt>
                    <dd className="mt-1 text-base font-bold text-ink">03-822-7171</dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-1.5 text-ink-muted">
                      <CalendarCheck size={14} className="text-brand-500" aria-hidden="true" />預約期限
                    </dt>
                    <dd className="mt-1 text-base font-bold text-ink">今日起 7 天</dd>
                  </div>
                </dl>
              </div>

              <div className="relative mx-auto w-full max-w-md">
                <HeroIllustration />
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20" aria-labelledby="features-heading">
          <Container size="wide">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-700">服務說明</p>
              <h2 id="features-heading" className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
                三大核心服務，為您量身打造
              </h2>
              <p className="mt-3 text-base text-ink-soft">
                從預約到完成，每個環節都為行動不便者與家屬的需求設計。
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, desc, href, cta }) => (
                <Card key={title} className="group flex flex-col gap-4 transition-shadow hover:shadow-card">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 text-accent-500">
                    <Icon size={26} strokeWidth={2.1} aria-hidden="true" />
                  </span>
                  <h3 className="text-xl font-bold text-ink">{title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{desc}</p>
                  <Link
                    href={href}
                    className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-accent-500"
                  >
                    {cta}
                    <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-brand-50 py-16 sm:py-20" aria-labelledby="steps-heading">
          <Container size="wide">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-700">使用流程</p>
              <h2 id="steps-heading" className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
                四個步驟，輕鬆完成預約
              </h2>
            </div>
            <ol className="grid gap-5 md:grid-cols-4">
              {STEPS.map(({ num, title, desc }, i) => (
                <li key={num} className="relative flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
                  <span className="text-sm font-bold tracking-[0.2em] text-accent-500">{num}</span>
                  <h3 className="text-lg font-bold text-ink">{title}</h3>
                  <p className="text-sm text-ink-soft">{desc}</p>
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-accent-500/40 md:block"
                    />
                  )}
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {!isLoggedIn && (
          <section className="py-16 sm:py-20" aria-labelledby="cta-heading">
            <Container size="content">
              <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-8 text-white shadow-card sm:p-12">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-500/30 blur-3xl" />
                <div className="relative grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
                  <div>
                    <h2 id="cta-heading" className="text-3xl font-bold leading-tight">
                      尚未有帳號？立即申請
                    </h2>
                    <p className="mt-2 text-base text-white/80">
                      只需 3 步驟，輕鬆完成註冊，馬上享受便利的預約服務。
                    </p>
                    <ul className="mt-5 grid gap-2 text-sm">
                      <li className="inline-flex items-center gap-2 text-white/90">
                        <CheckCircle2 size={16} className="text-accent-300" aria-hidden="true" />
                        免費註冊，全程線上完成
                      </li>
                      <li className="inline-flex items-center gap-2 text-white/90">
                        <CheckCircle2 size={16} className="text-accent-300" aria-hidden="true" />
                        個資加密保護，符合政府資安規範
                      </li>
                    </ul>
                  </div>
                  <Link
                    href="/register"
                    className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-accent-500 px-8 text-lg font-semibold text-white shadow-soft transition-colors hover:bg-accent-700 md:w-auto"
                  >
                    <UserPlus size={20} aria-hidden="true" />
                    立即申請
                  </Link>
                </div>
              </div>
            </Container>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 420"
      role="img"
      aria-label="花蓮山海景與復康巴士插圖"
      className="h-auto w-full drop-shadow-[0_18px_30px_rgba(15,76,92,0.18)]"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFCF5" />
          <stop offset="100%" stopColor="#FBEFE6" />
        </linearGradient>
        <linearGradient id="mountain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F4C5C" />
          <stop offset="100%" stopColor="#093945" />
        </linearGradient>
        <linearGradient id="mountain2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3E7280" />
          <stop offset="100%" stopColor="#0F4C5C" />
        </linearGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CFE0E5" />
          <stop offset="100%" stopColor="#A6C5CD" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="480" height="420" rx="28" fill="url(#sky)" />
      <circle cx="370" cy="92" r="46" fill="#FBEFE6" />
      <circle cx="370" cy="92" r="32" fill="#E36414" opacity="0.9" />
      <path d="M0 240 L90 170 L150 210 L220 150 L300 200 L380 160 L480 220 L480 300 L0 300 Z" fill="url(#mountain2)" />
      <path d="M0 280 L70 220 L150 260 L240 200 L320 250 L400 210 L480 270 L480 360 L0 360 Z" fill="url(#mountain)" />
      <path d="M0 320 L480 320 L480 420 L0 420 Z" fill="url(#sea)" />
      <path d="M0 348 C 80 340, 160 360, 240 350 S 400 340, 480 352 L 480 358 C 400 348, 320 366, 240 358 S 80 348, 0 354 Z" fill="#FFFFFF" opacity="0.55" />
      <path d="M40 332 C 120 326, 200 344, 280 332 S 440 328, 480 336" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.5" />

      <g transform="translate(110 250)">
        <rect x="0" y="0" width="260" height="90" rx="20" fill="#FFFFFF" stroke="#E8DFD2" strokeWidth="2" />
        <rect x="0" y="0" width="260" height="32" rx="20" fill="#0F4C5C" />
        <rect x="0" y="20" width="260" height="14" fill="#0F4C5C" />
        <rect x="14" y="42" width="44" height="32" rx="6" fill="#CFE0E5" stroke="#0F4C5C" strokeWidth="1.5" />
        <rect x="68" y="42" width="44" height="32" rx="6" fill="#CFE0E5" stroke="#0F4C5C" strokeWidth="1.5" />
        <rect x="122" y="42" width="44" height="32" rx="6" fill="#CFE0E5" stroke="#0F4C5C" strokeWidth="1.5" />
        <rect x="176" y="42" width="44" height="32" rx="6" fill="#CFE0E5" stroke="#0F4C5C" strokeWidth="1.5" />
        <rect x="226" y="44" width="20" height="28" rx="4" fill="#E36414" />
        <circle cx="50" cy="90" r="14" fill="#1A2D33" />
        <circle cx="50" cy="90" r="6" fill="#7A8A8F" />
        <circle cx="210" cy="90" r="14" fill="#1A2D33" />
        <circle cx="210" cy="90" r="6" fill="#7A8A8F" />
        <rect x="6" y="12" width="80" height="12" rx="3" fill="#E36414" />
        <text x="46" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FFFFFF" fontFamily="sans-serif">復康巴士</text>
        <g transform="translate(108 50)">
          <circle cx="8" cy="9" r="6" fill="#FFFFFF" stroke="#0F4C5C" strokeWidth="1.5" />
          <rect x="2" y="14" width="12" height="8" rx="2" fill="#FFFFFF" stroke="#0F4C5C" strokeWidth="1.5" />
        </g>
      </g>

      <g transform="translate(60 110)">
        <rect x="0" y="0" width="120" height="68" rx="14" fill="#FFFFFF" stroke="#E8DFD2" strokeWidth="1.5" />
        <circle cx="20" cy="22" r="9" fill="#E36414" />
        <path d="M16 22 l3 3 l5 -6" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="36" y="14" width="70" height="6" rx="3" fill="#0F4C5C" />
        <rect x="36" y="24" width="50" height="6" rx="3" fill="#CFE0E5" />
        <rect x="10" y="42" width="100" height="6" rx="3" fill="#FBEFE6" />
        <rect x="10" y="52" width="70" height="6" rx="3" fill="#FBEFE6" />
      </g>
    </svg>
  )
}
