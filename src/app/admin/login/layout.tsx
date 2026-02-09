import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './login.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Connexion - Riad Admin Dar Al Andalus',
  description: 'Accès réservé au personnel',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Login layout should not include its own <html> or <body> (handled by root layout)
  return (
    <div className={`${inter.className} login-background`}>
      {children}
    </div>
  )
}
