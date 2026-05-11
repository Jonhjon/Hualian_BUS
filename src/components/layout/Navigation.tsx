'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, PlusCircle, Bell, User, LogOut, LogIn, UserPlus, Menu, X } from 'lucide-react'
import { useLogout } from '@/hooks/useAuth'
import { Brand } from '@/components/ui/Brand'
import { cn } from '@/lib/cn'

interface NavigationProps {
  isLoggedIn: boolean
}

const NAV_LINKS = [
  { href: '/bookings', label: '我的預約', icon: Calendar },
  { href: '/bookings/new', label: '新增預約', icon: PlusCircle },
  { href: '/announcements', label: '公告', icon: Bell },
  { href: '/profile', label: '個人資料', icon: User },
] as const

export function Navigation({ isLoggedIn }: NavigationProps) {
  const pathname = usePathname()
  const logout = useLogout()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/bookings') return pathname === '/bookings' || pathname.startsWith('/bookings/')
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-30 bg-brand-500 text-white shadow-soft">
      <a href="#main-content" className="skip-link">
        跳至主要內容
      </a>
      <nav aria-label="主要導覽" className="mx-auto flex max-w-wide items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-lg">
          <Brand size="md" tone="light" showSubtitle={false} />
        </Link>

        <ul className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-white/10',
                    active ? 'text-white' : 'text-white/80',
                  )}
                >
                  <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
                  {label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-accent-500"
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {isLoggedIn ? (
            <button
              onClick={() => logout.mutate()}
              className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-white/90 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              <LogOut size={16} strokeWidth={2.2} aria-hidden="true" />
              登出
            </button>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-white/90 hover:bg-white/10"
              >
                <UserPlus size={16} strokeWidth={2.2} aria-hidden="true" />
                申請帳號
              </Link>
              <Link
                href="/login"
                className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent-500 px-4 text-sm font-semibold text-white shadow-soft hover:bg-accent-700"
              >
                <LogIn size={16} strokeWidth={2.2} aria-hidden="true" />
                登入
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? '關閉選單' : '開啟選單'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen(v => !v)}
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-md text-white hover:bg-white/10 lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </nav>

      {mobileOpen && (
        <div id="mobile-nav" className="border-t border-white/10 bg-brand-700 lg:hidden">
          <ul className="mx-auto flex max-w-wide flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-3 py-3 text-base font-medium',
                      active ? 'bg-accent-500 text-white' : 'text-white/90 hover:bg-white/10',
                    )}
                  >
                    <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              )
            })}
            <li className="mt-2 border-t border-white/10 pt-2">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    logout.mutate()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-3 text-base font-medium text-white/90 hover:bg-white/10"
                >
                  <LogOut size={18} strokeWidth={2.2} aria-hidden="true" />
                  登出
                </button>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3 py-3 text-base font-medium text-white/90 hover:bg-white/10"
                  >
                    <UserPlus size={18} strokeWidth={2.2} aria-hidden="true" />
                    申請帳號
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-md bg-accent-500 px-3 py-3 text-base font-semibold text-white"
                  >
                    <LogIn size={18} strokeWidth={2.2} aria-hidden="true" />
                    登入
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
