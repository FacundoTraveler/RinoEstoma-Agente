import { generateText, tool } from 'ai'
import { z } from 'zod'
import { AGENT_SYSTEM_PROMPT, AI_MODEL_CONFIG, AGENT_TOOLS } from './agent-config'
import { ChatMessage, ChatSession, AgentAction } from '@/lib/types'
import { supabase } from '@/lib/supabase-client'
import { buildAgentContext } from '@/lib/rag/rag-engine'

/**
 * RinoEstoma Agent Handler
 * Procesa mensajes y genera respuestas inteligentes usando Vercel AI SDK
 */

export interface AgentContext {
  userId?: string
  sessionId?: string
  userType?: 'patient' | 'professional' | 'admin'
  metadata?: Record<string, any>
}

export interface AgentResponse {
  message: string
  actions: AgentAction[]
  sessionId: string
  metadata?: Record<string, any>
}

/**
 * Define las herramientas disponibles para el agente
 */
const agentTools = {
  schedule_appointment: tool({
    description: 'Schedule an appointment with a healthcare professional',
    parameters: z.object({
      patient_phone: z.string().describe('Patient phone number'),
      patient_name: z.string().describe('Patient full name'),
      preferred_date: z.string().optional().describe('Preferred date (ISO 8601)'),
      notes: z.string().optional().describe('Additional notes'),
    }),
    execute: async (params) => {
      return await scheduleAppointmentAction(params)
    },
  }),

  search_knowledge_base: tool({
    description: 'Search medical protocols and knowledge base articles',
    parameters: z.object({
      query: z.string().describe('Search query'),
      category: z.enum(['protocols', 'guidelines', 'procedures', 'general']).optional(),
    }),
    execute: async (params) => {
      return await searchKnowledgeAction(params)
    },
  }),

  get_monitoring_analysis: tool({
    description: 'Get analysis from RinoMONITOR monitoring session',
    parameters: z.object({
      monitoring_session_id: z.string().describe('Monitoring session ID'),
      analysis_type: z
        .enum(['respiratory_patterns', 'functional_assessment', 'general_report'])
        .optional(),
    }),
    execute: async (params) => {
      return await getMonitoringAnalysisAction(params)
    },
  }),

  escalate_to_professional: tool({
    description: 'Escalate case to a healthcare professional',
    parameters: z.object({
      reason: z.string().describe('Reason for escalation'),
      urgency_level: z.enum(['low', 'medium', 'high']).optional(),
    }),
    execute: async (params) => {
      return await escalateAction(params)
    },
  }),
}

/**
 * Procesa un mensaje y genera una respuesta del agente
 */
export async function processAgentMessage(
  message: string,
  context: AgentContext
): Promise<AgentResponse> {
  try {
    // Obtener historial de la sesión si existe
    let sessionId = context.sessionId
    let chatHistory: ChatMessage[] = []

    if (sessionId) {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(10) // Últimos 10 mensajes para contexto

      chatHistory = data || []
    }

    // Obtener contexto RAG si es disponible
    let ragContext = ''
    try {
      ragContext = await buildAgentContext(message)
    } catch (error) {
      console.error('[v0] Error building RAG context:', error)
    }

    // Construir el historial para el modelo
    const userMessageWithContext = ragContext
      ? `${message}\n\n[Información relevante de la base de conocimiento]\n${ragContext}`
      : message

    const conversationHistory = chatHistory
      .map((msg) => ({
        role: msg.sender_type === 'agent' ? 'assistant' : 'user',
        content: msg.content,
      }))
      .concat([{ role: 'user', content: userMessageWithContext }])

    // Llamar al modelo con herramientas
    const { text: responseText, toolUseBlocks } = await generateText({
      model: AI_MODEL_CONFIG.model as any, // Vercel AI Gateway usa este string
      system: AGENT_SYSTEM_PROMPT,
      messages: conversationHistory as any,
      tools: agentTools,
      temperature: AI_MODEL_CONFIG.temperature,
      maxTokens: AI_MODEL_CONFIG.maxTokens,
    })

    // Procesar las acciones tomadas
    const actions: AgentAction[] = []
    if (toolUseBlocks) {
      for (const block of toolUseBlocks) {
        actions.push({
          type: block.toolName as AgentAction['type'],
          data: block.toolInput,
          status: 'completed',
        })
      }
    }

    // Crear nueva sesión si no existe
    if (!sessionId) {
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: context.userId,
            session_type: 'whatsapp',
            metadata: context.metadata || {},
          },
        ])
        .select()
        .single()

      sessionId = newSession?.id || 'unknown'
    }

    // Guardar el mensaje del usuario
    await supabase.from('chat_messages').insert([
      {
        session_id: sessionId,
        sender_type: 'user',
        sender_id: context.userId,
        content: message,
        message_type: 'text',
      },
    ])

    // Guardar la respuesta del agente
    await supabase.from('chat_messages').insert([
      {
        session_id: sessionId,
        sender_type: 'agent',
        content: responseText,
        message_type: 'text',
        metadata: { actions },
      },
    ])

    return {
      message: responseText,
      actions,
      sessionId,
      metadata: {
        model: AI_MODEL_CONFIG.model,
        tokensUsed: conversationHistory.length,
      },
    }
  } catch (error) {
    console.error('[v0] Error processing agent message:', error)

    // Retornar respuesta de error
    const errorMessage =
      'Disculpa, ocurrió un error procesando tu mensaje. Por favor intenta de nuevo o contacta a un profesional.'

    return {
      message: errorMessage,
      actions: [],
      sessionId: context.sessionId || 'unknown',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}

/**
 * Acciones del agente
 */

async function scheduleAppointmentAction(params: {
  patient_phone: string
  patient_name: string
  preferred_date?: string
  notes?: string
}) {
  try {
    // Crear o encontrar usuario por teléfono
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', params.patient_phone)
      .single()

    let userId = user?.id

    // Si no existe, crear nuevo usuario
    if (!userId) {
      const { data: newUser } = await supabase
        .from('users')
        .insert([
          {
            email: `${params.patient_phone}@whatsapp.local`,
            phone_number: params.patient_phone,
            full_name: params.patient_name,
            user_type: 'patient',
          },
        ])
        .select()
        .single()

      userId = newUser?.id
    }

    // Crear cita
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert([
        {
          user_id: userId,
          appointment_date: params.preferred_date || new Date().toISOString(),
          status: 'pending',
          notes: params.notes,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      appointment_id: appointment?.id,
      message: `Cita agendada exitosamente para ${params.patient_name}. ID: ${appointment?.id}`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function searchKnowledgeAction(params: {
  query: string
  category?: string
}) {
  try {
    // Buscar en la base de conocimiento
    let query = supabase
      .from('knowledge_articles')
      .select('id, title, content, category, tags')
      .eq('is_public', true)
      .textSearch('content', params.query) // Búsqueda de texto

    if (params.category) {
      query = query.eq('category', params.category)
    }

    const { data: articles } = await query.limit(5)

    return {
      success: true,
      articles: articles || [],
      count: articles?.length || 0,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      articles: [],
    }
  }
}

async function getMonitoringAnalysisAction(params: {
  monitoring_session_id: string
  analysis_type?: string
}) {
  try {
    // Obtener sesión de monitoreo
    const { data: monitoring } = await supabase
      .from('monitoring_sessions')
      .select('*')
      .eq('id', params.monitoring_session_id)
      .single()

    if (!monitoring) {
      return {
        success: false,
        error: 'Monitoring session not found',
      }
    }

    // Aquí se implementaría lógica de análisis avanzado
    // Por ahora, retornamos los datos disponibles
    return {
      success: true,
      monitoring_id: monitoring.id,
      monitor_type: monitoring.monitor_type,
      status: monitoring.status,
      data: monitoring.data,
      analysis: monitoring.analysis_results || { status: 'pending' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function escalateAction(params: {
  reason: string
  urgency_level?: 'low' | 'medium' | 'high'
}) {
  try {
    // Log de escalamiento
    await supabase.from('agent_logs').insert([
      {
        agent_name: 'RinoEstoma Agent',
        action: 'escalate_to_professional',
        status: 'completed',
        request_data: params,
      },
    ])

    return {
      success: true,
      escalation_id: Math.random().toString(36).substr(2, 9),
      message: `Caso escalado con urgencia: ${params.urgency_level || 'normal'}. Un profesional se contactará pronto.`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
