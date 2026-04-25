'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Usuarios', icon: '👥' },
    { href: '/admin/appointments', label: 'Citas', icon: '📅' },
    { href: '/admin/knowledge', label: 'Base de Conocimiento', icon: '📚' },
    { href: '/admin/bibliography', label: 'Bibliografía', icon: '📖' },
    { href: '/admin/monitoring', label: 'Monitoreos', icon: '📈' },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="w-64 bg-primary text-white h-screen flex flex-col fixed left-0 top-0">
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-2 mb-2">
          <img src="/logo-rino.jpg" alt="RinoEstoma" className="w-8 h-8 rounded" />
          <h2 className="text-xl font-bold">RinoEstoma</h2>
        </div>
        <p className="text-sm text-white/70">Panel de Control</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                pathname.startsWith(item.href)
                  ? 'bg-white/20'
                  : 'hover:bg-white/10'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20 space-y-2">
        <Link href="/">
          <Button variant="outline" className="w-full text-primary">
            Volver al Sitio
          </Button>
        </Link>
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
