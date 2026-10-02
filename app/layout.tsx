import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { IBM_Plex_Sans } from 'next/font/google'
import './globals.css'

const plex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dashboard KOPDES',
  description: 'Monitoring Action Plan Q4 2026 Lombok',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className={plex.className}>{children}</body>
    </html>
  )
}
