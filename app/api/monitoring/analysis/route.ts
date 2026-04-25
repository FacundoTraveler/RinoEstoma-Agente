import { NextRequest, NextResponse } from 'next/server'
import { getRinoMonitorClient } from '@/lib/monitoring/rinomonitor-client'
import { supabase } from '@/lib/supabase-client'

/**
 * Monitoring Analysis API
 * GET: Obtener análisis de una sesión
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')
    const analysisType =
      (searchParams.get('type') as
        | 'respiratory_patterns'
        | 'functional_assessment'
        | 'general_report') || 'general_report'
    const includeMetrics = searchParams.get('include_metrics') === 'true'

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id required' },
        { status: 400 }
      )
    }

    const client = getRinoMonitorClient()

    // Obtener análisis de RinoMONITOR
    const analysis = await client.getSessionAnalysis(sessionId, analysisType)

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not available' },
        { status: 404 }
      )
    }

    // Obtener métricas si se solicita
    let metrics = null
    if (includeMetrics) {
      const session = await client.getSession(sessionId)
      if (session) {
        metrics = session.metrics

        // Si la sesión sigue activa, obtener métricas en tiempo real
        if (session.status === 'active') {
          const realtimeMetrics = await client.getRealtimeMetrics(sessionId)
          if (realtimeMetrics) {
            metrics = realtimeMetrics
          }
        }
      }
    }

    // Guardar análisis en DB local
    await supabase
      .from('monitoring_sessions')
      .update({
        analysis_results: {
          type: analysisType,
          findings: analysis.findings,
          recommendations: analysis.recommendations,
          severity: analysis.severity_level,
          generated_at: analysis.generated_at,
        },
      })
      .eq('external_session_id', sessionId)

    return NextResponse.json({
      session_id: sessionId,
      analysis,
      metrics,
    })
  } catch (error) {
    console.error('[v0] Error in GET /api/monitoring/analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    )
  }
}
