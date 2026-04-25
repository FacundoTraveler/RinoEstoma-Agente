'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo y nombre */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            <Image
              src="/logo-rino.jpg"
              alt="RinoEstoma Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">RinoEstoma</span>
            <span className="text-xs text-muted-foreground">Agent AI</span>
          </div>
        </Link>

        {/* Nav right */}
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            Inicio
          </Button>
          <Button variant="ghost" size="sm">
            Cómo funciona
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            Hablar con agente
          </Button>
        </nav>
      </div>
    </header>
  )
}
