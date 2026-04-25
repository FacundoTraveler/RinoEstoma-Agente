'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MonitoringDisplay } from '@/components/monitoring-display'

interface MonitoringSession {
  id: string
  patient_id: string
  patient_name: string
  status: 'active' | 'completed' | 'stopped'
  started_at: string
  ended_at: string | null
  metrics_count: number
}

export default function MonitoringPage() {
  const { user, loading: authLoading } = useAuth()
  const [sessions, setSessions] = useState<MonitoringSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/monitoring/sessions')
        if (!response.ok) throw new Error('Failed to fetch sessions')
        const data = await response.json()
        setSessions(data.sessions || [])
      } catch (error) {
        console.error('[v0] Error fetching monitoring sessions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [authLoading])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando sesiones de monitoreo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sesiones de Monitoreo</h1>
        <p className="text-muted-foreground mt-2">
          Total de sesiones: {sessions.length}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No hay sesiones de monitoreo
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card
                key={session.id}
                className={`cursor-pointer transition-all border-l-4 ${
                  selectedSession === session.id
                    ? 'border-l-primary bg-primary/5'
                    : 'border-l-gray-300'
                }`}
                onClick={() => setSelectedSession(session.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{session.patient_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        ID: {session.id.substring(0, 8)}...
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      session.status === 'active' ? 'bg-green-100 text-green-800' :
                      session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {session.status === 'active' && 'Activo'}
                      {session.status === 'completed' && 'Completado'}
                      {session.status === 'stopped' && 'Detenido'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Métricas: {session.metrics_count}</p>
                  <p className="text-muted-foreground">
                    Iniciado: {new Date(session.started_at).toLocaleString('es-ES')}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedSession && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles de Sesión</CardTitle>
              </CardHeader>
              <CardContent>
                <MonitoringDisplay sessionId={selectedSession} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
