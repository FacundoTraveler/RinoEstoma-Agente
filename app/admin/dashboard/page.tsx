'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useRequireRole } from '@/hooks/use-auth'
import {
  Users,
  MessageSquare,
  Activity,
  Settings,
  TrendingUp,
  BarChart3,
} from 'lucide-react'

interface DashboardStats {
  total_users: number
  active_sessions: number
  total_chats: number
  total_monitoring_sessions: number
  avg_response_time: number
  knowledge_articles: number
}

export default function AdminDashboardPage() {
  const { isLoading } = useRequireRole('admin')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('[v0] Error loading stats:', error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Panel Administrativo
            </h1>
            <p className="text-muted-foreground">
              Gestión centralizada de RinoEstoma
            </p>
          </div>

          {/* Stats Grid */}
          {isLoadingStats ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total Usuarios */}
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Usuarios</p>
                    <p className="text-3xl font-bold text-foreground pt-2">
                      {stats.total_users}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary/30" />
                </div>
              </Card>

              {/* Sesiones Activas */}
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sesiones Activas</p>
                    <p className="text-3xl font-bold text-foreground pt-2">
                      {stats.active_sessions}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500/30" />
                </div>
              </Card>

              {/* Total Chats */}
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Chats Totales</p>
                    <p className="text-3xl font-bold text-foreground pt-2">
                      {stats.total_chats}
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500/30" />
                </div>
              </Card>

              {/* Sesiones Monitoreo */}
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Sesiones Monitoreo
                    </p>
                    <p className="text-3xl font-bold text-foreground pt-2">
                      {stats.total_monitoring_sessions}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500/30" />
                </div>
              </Card>

              {/* Tiempo Promedio Respuesta */}
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tiempo Respuesta Prom.
                    </p>
                    <p className="text-3xl font-bold text-foreground pt-2">
                      {stats.avg_response_time}ms
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500/30" />
                </div>
              </Card>

              {/* Artículos Knowledge Base */}
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Artículos KB
                    </p>
                    <p className="text-3xl font-bold text-foreground pt-2">
                      {stats.knowledge_articles}
                    </p>
                  </div>
                  <Settings className="h-8 w-8 text-teal-500/30" />
                </div>
              </Card>
            </div>
          ) : null}

          {/* Management Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gestión de Usuarios */}
            <Card className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Gestión de Usuarios
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Administra perfiles y permisos
                  </p>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Ir a Usuarios
              </Button>
            </Card>

            {/* Base de Conocimiento */}
            <Card className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Base de Conocimiento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Gestiona artículos y protocolos
                  </p>
                </div>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Ir a Knowledge Base
              </Button>
            </Card>

            {/* Analítica de Chat */}
            <Card className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Analítica de Chat
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Estadísticas y reportes
                  </p>
                </div>
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Ver Analítica
              </Button>
            </Card>

            {/* Configuración */}
            <Card className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Configuración
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ajustes del sistema
                  </p>
                </div>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Configurar
              </Button>
            </Card>
          </div>

          {/* System Status */}
          <Card className="p-6 bg-muted/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Estado del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Base de Datos</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-foreground">
                    Operativo
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">API Gateway</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-foreground">
                    Operativo
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Chat SDK</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-foreground">
                    Operativo
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">RinoMONITOR</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium text-foreground">
                    Configurando
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
