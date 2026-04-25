import { NextRequest, NextResponse } from 'next/server'
import { getRinoMonitorClient } from '@/lib/monitoring/rinomonitor-client'
import { supabase } from '@/lib/supabase-client'

/**
 * Monitoring Sessions API
 * GET: Obtener sesiones de un paciente o una sesión específica
 * POST: Crear nueva sesión de monitoreo
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')
    const patientId = searchParams.get('patient_id')
    const includeAnalysis = searchParams.get('include_analysis') === 'true'

    const client = getRinoMonitorClient()

    if (sessionId) {
      // Obtener una sesión específica
      const session = await client.getSession(sessionId)

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }

      // Obtener análisis si se solicita
      if (includeAnalysis) {
        const analysis = await client.getSessionAnalysis(
          sessionId,
          'general_report'
        )
        return NextResponse.json({ session, analysis })
      }

      return NextResponse.json({ session })
    }

    if (patientId) {
      // Obtener sesiones del paciente
      const sessions = await client.getPatientSessions(patientId)

      return NextResponse.json({ sessions, count: sessions.length })
    }

    return NextResponse.json(
      { error: 'session_id or patient_id required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[v0] Error in GET /api/monitoring/sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patient_id, monitor_type, action } = body

    const client = getRinoMonitorClient()

    if (action === 'create') {
      // Crear nueva sesión
      if (!patient_id || !monitor_type) {
        return NextResponse.json(
          { error: 'patient_id and monitor_type required' },
          { status: 400 }
        )
      }

      const session = await client.createSession(patient_id, monitor_type)

      if (!session) {
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        )
      }

      // Guardar en DB local también
      await supabase.from('monitoring_sessions').insert([
        {
          user_id: patient_id,
          monitor_type,
          external_session_id: session.id,
          status: 'active',
        },
      ])

      return NextResponse.json(session, { status: 201 })
    }

    if (action === 'complete') {
      // Completar sesión
      const { session_id } = body

      if (!session_id) {
        return NextResponse.json(
          { error: 'session_id required' },
          { status: 400 }
        )
      }

      const success = await client.completeSession(session_id)

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to complete session' },
          { status: 500 }
        )
      }

      // Actualizar en DB local
      await supabase
        .from('monitoring_sessions')
        .update({ status: 'completed' })
        .eq('external_session_id', session_id)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[v0] Error in POST /api/monitoring/sessions:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
