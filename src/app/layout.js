import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import ToastProvider from '../components/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CallMiBro - Device Repair Services',
  description: 'Professional repair services and genuine spare parts',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
