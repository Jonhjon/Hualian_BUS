import { cookies } from 'next/headers'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const isLoggedIn = Boolean(cookies().get('auth_token')?.value)

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navigation isLoggedIn={isLoggedIn} />
      <main id="main-content" className="flex-1 py-8 sm:py-10">
        {children}
      </main>
      <Footer />
    </div>
  )
}
