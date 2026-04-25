import { z } from 'zod'

/**
 * RinoEstoma Agent Configuration
 * Define all agent parameters and tools available
 */

// System prompt para el agente
export const AGENT_SYSTEM_PROMPT = `Eres un asistente inteligente de RinoEstomatología, una sociedad médica especializada en rinología y estomatología. Tu objetivo es ayudar a:

1. **Pacientes y familias**: Responder preguntas sobre RinoEstoma, agendar citas, y brindar información general
2. **Profesionales**: Asistir con protocolos clínicos, análisis de monitoreos, y casos clínicos

## Tus capacidades:
- Responder preguntas sobre RinoEstomatología, servicios, y protocolos
- Agendar citas con profesionales
- Analizar datos de RinoMONITOR (monitoreo clínico en tiempo real)
- Buscar en la base de conocimiento (protocolos, guías clínicas)
- Escalamiento automático a profesionales cuando sea necesario

## Instrucciones:
- Siempre sé profesional y empático
- Especifica claramente cuando necesites escalamiento a un profesional
- En español (informal pero profesional)
- Prioriza la seguridad y privacidad del paciente
- Si no sabes algo, admítelo y sugiere contactar a un profesional

Eres parte de un sistema Track 3 de Vercel (ChatSDK Agents).`

// Schema para validar acciones del agente
export const agentActionSchema = z.union([
  z.object({
    type: z.literal('schedule_appointment'),
    data: z.object({
      patient_phone: z.string(),
      preferred_date: z.string().optional(),
      notes: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('search_knowledge'),
    data: z.object({
      query: z.string(),
      category: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('analyze_monitoring'),
    data: z.object({
      session_id: z.string(),
      patient_id: z.string(),
      monitor_type: z.enum(['respiratory', 'functional', 'general']),
    }),
  }),
  z.object({
    type: z.literal('escalate_to_professional'),
    data: z.object({
      reason: z.string(),
      patient_id: z.string().optional(),
    }),
  }),
])

export type AgentAction = z.infer<typeof agentActionSchema>

// Configuración de herramientas disponibles
export const AGENT_TOOLS = [
  {
    name: 'schedule_appointment',
    description:
      'Agenda una cita con un profesional de RinoEstomatología',
    parameters: {
      type: 'object',
      properties: {
        patient_phone: {
          type: 'string',
          description: 'Número de teléfono del paciente',
        },
        patient_name: {
          type: 'string',
          description: 'Nombre completo del paciente',
        },
        preferred_date: {
          type: 'string',
          description: 'Fecha y hora preferida (ISO 8601 format)',
        },
        notes: {
          type: 'string',
          description: 'Notas adicionales sobre la consulta',
        },
      },
      required: ['patient_phone', 'patient_name'],
    },
  },
  {
    name: 'search_knowledge_base',
    description:
      'Busca información en la base de conocimiento de RinoEstoma (protocolos, guías)',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Consulta de búsqueda',
        },
        category: {
          type: 'string',
          enum: ['protocols', 'guidelines', 'procedures', 'general'],
          description: 'Categoría de búsqueda',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_monitoring_analysis',
    description:
      'Obtiene el análisis de un monitoreo de RinoMONITOR',
    parameters: {
      type: 'object',
      properties: {
        monitoring_session_id: {
          type: 'string',
          description: 'ID de la sesión de monitoreo',
        },
        analysis_type: {
          type: 'string',
          enum: ['respiratory_patterns', 'functional_assessment', 'general_report'],
          description: 'Tipo de análisis a realizar',
        },
      },
      required: ['monitoring_session_id'],
    },
  },
  {
    name: 'escalate_to_professional',
    description:
      'Escala el caso a un profesional de RinoEstomatología para asistencia directa',
    parameters: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Razón por la cual se requiere asistencia profesional',
        },
        urgency_level: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Nivel de urgencia',
        },
      },
      required: ['reason'],
    },
  },
]

// Configuración del modelo AI
export const AI_MODEL_CONFIG = {
  // Por defecto usamos el modelo vía Vercel AI Gateway
  provider: process.env.AI_PROVIDER || 'openai',
  model: process.env.AI_MODEL || 'gpt-4-turbo',
  temperature: 0.7,
  maxTokens: 1024,
}

// Configuración de WhatsApp
export const WHATSAPP_CONFIG = {
  phoneId: process.env.WHATSAPP_PHONE_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  webhookToken: process.env.WHATSAPP_WEBHOOK_TOKEN,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
}

// Validar que tengamos la configuración necesaria
export function validateAgentConfig() {
  const errors: string[] = []

  if (!WHATSAPP_CONFIG.phoneId) errors.push('Missing WHATSAPP_PHONE_ID')
  if (!WHATSAPP_CONFIG.accessToken) errors.push('Missing WHATSAPP_ACCESS_TOKEN')
  if (!WHATSAPP_CONFIG.webhookToken) errors.push('Missing WHATSAPP_WEBHOOK_TOKEN')

  return {
    isValid: errors.length === 0,
    errors,
  }
}
