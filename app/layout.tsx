import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ChatWidget } from '@/components/chat-widget'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'RinoEstoma Agent - Telemedicine Assistant',
  description: 'AI-powered telemedicine assistant for RinoEstomatología. Real-time monitoring analysis, appointment scheduling, and patient support via WhatsApp.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logo-rino.jpg',
        type: 'image/jpg',
      },
    ],
    apple: '/logo-rino.jpg',
  },
  openGraph: {
    title: 'RinoEstoma Agent',
    description: 'AI-powered telemedicine assistant for RinoEstomatología',
    images: [
      {
        url: '/logo-rino.jpg',
        width: 1200,
        height: 1200,
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className="font-sans antialiased text-foreground">
        {children}
        <ChatWidget position="bottom-right" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
