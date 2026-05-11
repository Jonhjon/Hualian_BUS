import type { Metadata } from 'next'
import { Noto_Sans_TC } from 'next/font/google'
import { QueryProvider } from '@/components/providers/QueryProvider'
import './globals.css'

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-tc',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '花蓮縣復康巴士預約系統',
  description: '花蓮縣政府復康巴士無障礙交通預約管理系統',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={notoSansTC.variable}>
      <body className="bg-cream text-ink antialiased min-h-screen">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
