import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

/**
 * Admin Statistics API
 * GET: Obtener estadísticas del sistema
 */

export async function GET() {
  try {
    // Contar usuarios totales
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Contar sesiones activas
    const { count: activeSessions } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', new Date().toISOString())

    // Contar chats totales
    const { count: totalChats } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })

    // Contar sesiones de monitoreo
    const { count: totalMonitoringSessions } = await supabase
      .from('monitoring_sessions')
      .select('*', { count: 'exact', head: true })

    // Contar artículos en knowledge base
    const { count: knowledgeArticles } = await supabase
      .from('knowledge_articles')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)

    // Calcular tiempo promedio de respuesta (simulado)
    // En producción, esto vendría de logs/métricas reales
    const avgResponseTime = Math.floor(Math.random() * 200) + 50

    return NextResponse.json({
      total_users: totalUsers || 0,
      active_sessions: activeSessions || 0,
      total_chats: totalChats || 0,
      total_monitoring_sessions: totalMonitoringSessions || 0,
      avg_response_time: avgResponseTime,
      knowledge_articles: knowledgeArticles || 0,
      last_updated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
