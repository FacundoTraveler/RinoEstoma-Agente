'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, Download, BarChart3 } from 'lucide-react'

interface MonitoringSession {
  id: string
  patient_id: string
  monitor_type: 'respiratory' | 'functional' | 'general'
  status: 'active' | 'completed' | 'archived'
  started_at: string
  ended_at?: string
  metrics?: Record<string, any>
}

interface MonitoringAnalysis {
  findings: string
  recommendations: string[]
  severity_level?: 'normal' | 'mild' | 'moderate' | 'severe'
}

interface MonitoringDisplayProps {
  sessionId?: string
  patientId?: string
  includeAnalysis?: boolean
}

export function MonitoringDisplay({
  sessionId,
  patientId,
  includeAnalysis = false,
}: MonitoringDisplayProps) {
  const [session, setSession] = useState<MonitoringSession | null>(null)
  const [analysis, setAnalysis] = useState<MonitoringAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      loadSession()
    } else if (patientId) {
      loadPatientSessions()
    }
  }, [sessionId, patientId])

  const loadSession = async () => {
    if (!sessionId) return

    setIsLoading(true)
    setError(null)

    try {
      const url = new URL('/api/monitoring/sessions', window.location.origin)
      url.searchParams.set('session_id', sessionId)
      if (includeAnalysis) url.searchParams.set('include_analysis', 'true')

      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to load session')
        return
      }

      setSession(data.session)

      // Cargar análisis si se solicita
      if (includeAnalysis && data.session.status === 'completed') {
        loadAnalysis(sessionId)
      }
    } catch (error) {
      setError('Failed to load session')
      console.error('[v0] Error loading session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnalysis = async (id: string) => {
    try {
      const url = new URL('/api/monitoring/analysis', window.location.origin)
      url.searchParams.set('session_id', id)
      url.searchParams.set('include_metrics', 'true')

      const res = await fetch(url)
      const data = await res.json()

      if (res.ok && data.analysis) {
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('[v0] Error loading analysis:', error)
    }
  }

  const loadPatientSessions = async () => {
    if (!patientId) return

    setIsLoading(true)
    setError(null)

    try {
      const url = new URL('/api/monitoring/sessions', window.location.origin)
      url.searchParams.set('patient_id', patientId)

      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to load sessions')
        return
      }

      // Cargar la sesión más reciente
      if (data.sessions && data.sessions.length > 0) {
        setSession(data.sessions[0])
      }
    } catch (error) {
      setError('Failed to load sessions')
      console.error('[v0] Error loading sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Spinner className="h-6 w-6" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border-destructive/50 bg-destructive/5">
        <div className="flex gap-4">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive">Error</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!session) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No session found</p>
      </Card>
    )
  }

  const duration = session.ended_at
    ? Math.round(
        (new Date(session.ended_at).getTime() -
          new Date(session.started_at).getTime()) /
          60000
      )
    : null

  const severityColor: Record<string, string> = {
    normal: 'bg-green-100 text-green-800',
    mild: 'bg-blue-100 text-blue-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    severe: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-4">
      {/* Session Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Sesión de Monitoreo
            </h3>
            <p className="text-sm text-muted-foreground">
              {new Date(session.started_at).toLocaleString('es-ES')}
            </p>
          </div>
          <Badge
            variant={session.status === 'active' ? 'default' : 'secondary'}
          >
            {session.status === 'active' ? '🔴 Activa' : '✓ Completada'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Tipo</p>
            <p className="font-medium text-foreground capitalize">
              {session.monitor_type}
            </p>
          </div>
          {duration && (
            <div>
              <p className="text-xs text-muted-foreground">Duración</p>
              <p className="font-medium text-foreground">{duration} minutos</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">ID Sesión</p>
            <p className="font-mono text-sm text-foreground">
              {session.id.substring(0, 8)}...
            </p>
          </div>
        </div>

        {session.status === 'completed' && (
          <div className="flex gap-2 pt-4">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Descargar Reporte
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAnalysis(session.id)}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Ver Análisis
            </Button>
          </div>
        )}
      </Card>

      {/* Metrics */}
      {session.metrics && (
        <Card className="p-6">
          <h4 className="font-semibold text-foreground mb-4">Métricas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(session.metrics).map(([key, value]) => (
              <div key={key} className="border-b border-border pb-3">
                <p className="text-xs text-muted-foreground capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="font-medium text-foreground">
                  {typeof value === 'number' ? value.toFixed(2) : String(value)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Analysis */}
      {analysis && (
        <Card className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-foreground">Análisis Clínico</h4>
              {analysis.severity_level && (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                    severityColor[analysis.severity_level] || 'bg-gray-100'
                  }`}
                >
                  {analysis.severity_level}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-semibold text-foreground mb-2">
                Hallazgos
              </h5>
              <p className="text-sm text-muted-foreground">
                {analysis.findings}
              </p>
            </div>

            {analysis.recommendations && (
              <div>
                <h5 className="text-sm font-semibold text-foreground mb-2">
                  Recomendaciones
                </h5>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
