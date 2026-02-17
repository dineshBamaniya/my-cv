import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bamaniya Dinesh - Full Stack Developer',
  description:
    'Professional CV of Bamaniya Dinesh - Full Stack Developer with 4+ years of experience in Angular, Node.js, and microservices',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
