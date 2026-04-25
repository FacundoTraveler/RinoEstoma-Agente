/**
 * RinoMONITOR API Client
 * Integración con plataforma de telemonitoreo clínico
 */

export interface MonitoringSession {
  id: string
  patient_id: string
  monitor_type: 'respiratory' | 'functional' | 'general'
  status: 'active' | 'completed' | 'archived'
  started_at: string
  ended_at?: string
  duration_seconds?: number
  video_url?: string
  metrics?: MonitoringMetrics
}

export interface MonitoringMetrics {
  // Respiratorio
  respiratory_rate?: number
  nasal_patency?: number
  airway_resistance?: number

  // Funcional
  vocal_quality?: number
  speech_clarity?: number
  articulation_score?: number
  mobility_range?: number

  // General
  overall_score?: number
  compliance_score?: number
  observations?: string
}

export interface MonitoringAnalysis {
  session_id: string
  analysis_type: 'respiratory_patterns' | 'functional_assessment' | 'general_report'
  findings: string
  recommendations: string[]
  severity_level?: 'normal' | 'mild' | 'moderate' | 'severe'
  generated_at: string
}

class RinoMonitorClient {
  private apiUrl: string
  private apiKey: string

  constructor() {
    this.apiUrl = process.env.RINOMONITOR_API_URL || 'https://api.rinomonitor.com'
    this.apiKey = process.env.RINOMONITOR_API_KEY || ''

    if (!this.apiKey) {
      console.warn(
        '[v0] RinoMONITOR API Key not configured. Some features may not work.'
      )
    }
  }

  /**
   * Obtiene información de una sesión de monitoreo
   */
  async getSession(sessionId: string): Promise<MonitoringSession | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/sessions/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[v0] Error fetching RinoMONITOR session:', error)
      return null
    }
  }

  /**
   * Obtiene sesiones de un paciente
   */
  async getPatientSessions(
    patientId: string,
    limit: number = 10
  ): Promise<MonitoringSession[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/patients/${patientId}/sessions?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return data.sessions || []
    } catch (error) {
      console.error('[v0] Error fetching patient sessions:', error)
      return []
    }
  }

  /**
   * Obtiene análisis de una sesión
   */
  async getSessionAnalysis(
    sessionId: string,
    analysisType: 'respiratory_patterns' | 'functional_assessment' | 'general_report' =
      'general_report'
  ): Promise<MonitoringAnalysis | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/sessions/${sessionId}/analysis/${analysisType}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[v0] Error fetching session analysis:', error)
      return null
    }
  }

  /**
   * Inicia una nueva sesión de monitoreo
   */
  async createSession(
    patientId: string,
    monitorType: 'respiratory' | 'functional' | 'general'
  ): Promise<MonitoringSession | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/sessions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patient_id: patientId,
            monitor_type: monitorType,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[v0] Error creating RinoMONITOR session:', error)
      return null
    }
  }

  /**
   * Finaliza una sesión de monitoreo
   */
  async completeSession(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/sessions/${sessionId}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.ok
    } catch (error) {
      console.error('[v0] Error completing RinoMONITOR session:', error)
      return false
    }
  }

  /**
   * Obtiene métricas en tiempo real de una sesión activa
   */
  async getRealtimeMetrics(sessionId: string): Promise<MonitoringMetrics | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/sessions/${sessionId}/metrics/realtime`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[v0] Error fetching realtime metrics:', error)
      return null
    }
  }

  /**
   * Descarga reporte de una sesión
   */
  async downloadSessionReport(
    sessionId: string,
    format: 'pdf' | 'json' = 'pdf'
  ): Promise<Buffer | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/sessions/${sessionId}/report?format=${format}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      console.error('[v0] Error downloading report:', error)
      return null
    }
  }

  /**
   * Verifica conexión con API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error('[v0] RinoMONITOR API health check failed:', error)
      return false
    }
  }

  /**
   * Obtiene disponibilidad de agenda
   */
  async getAvailableSlots(
    professionId?: string,
    date?: string
  ): Promise<Array<{ start_time: string; end_time: string }>> {
    try {
      let url = `${this.apiUrl}/availability`
      const params = new URLSearchParams()

      if (professionId) params.append('professional_id', professionId)
      if (date) params.append('date', date)

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return data.slots || []
    } catch (error) {
      console.error('[v0] Error fetching available slots:', error)
      return []
    }
  }
}

// Singleton instance
let instance: RinoMonitorClient | null = null

export function getRinoMonitorClient(): RinoMonitorClient {
  if (!instance) {
    instance = new RinoMonitorClient()
  }
  return instance
}

export default RinoMonitorClient
