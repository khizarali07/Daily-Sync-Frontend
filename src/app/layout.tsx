import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DailySync AI - Life Operating System',
  description: 'Organize, track, and analyze your daily life',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
