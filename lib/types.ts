// User types
export type UserType = 'patient' | 'professional' | 'admin'

export interface User {
  id: string
  email: string
  phone_number?: string
  full_name?: string
  user_type: UserType
  profile_data?: Record<string, any>
  created_at: string
  updated_at: string
}

// Appointment types
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Appointment {
  id: string
  user_id: string
  professional_id?: string
  appointment_date: string
  status: AppointmentStatus
  notes?: string
  created_at: string
  updated_at: string
}

// Chat types
export type SessionType = 'whatsapp' | 'web' | 'slack'
export type SenderType = 'user' | 'agent' | 'system'
export type MessageType = 'text' | 'image' | 'file' | 'action'

export interface ChatSession {
  id: string
  user_id: string
  session_type: SessionType
  external_id?: string
  started_at: string
  ended_at?: string
  metadata?: Record<string, any>
}

export interface ChatMessage {
  id: string
  session_id: string
  sender_type: SenderType
  sender_id?: string
  content: string
  message_type: MessageType
  metadata?: Record<string, any>
  created_at: string
}

// Monitoring types
export type MonitorType = 'respiratory' | 'functional' | 'general'
export type MonitoringStatus = 'active' | 'completed' | 'archived'

export interface MonitoringSession {
  id: string
  user_id: string
  monitor_type: MonitorType
  external_session_id?: string
  status: MonitoringStatus
  data?: Record<string, any>
  analysis_results?: Record<string, any>
  created_at: string
  updated_at: string
}

// Knowledge Base types
export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  is_public: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

// Agent types
export interface AgentConfig {
  whatsappPhoneId: string
  whatsappAccessToken: string
  rinomonitorApiKey?: string
  rinomonitorApiUrl?: string
  modelProvider: 'openai' | 'anthropic' | 'groq'
}

export interface ChatRequest {
  message: string
  sessionId?: string
  userId?: string
  context?: Record<string, any>
}

export interface ChatResponse {
  message: string
  sessionId: string
  actions?: AgentAction[]
  metadata?: Record<string, any>
}

export type AgentActionType = 'schedule_appointment' | 'fetch_monitoring' | 'search_knowledge' | 'send_notification'

export interface AgentAction {
  type: AgentActionType
  data: Record<string, any>
  status: 'pending' | 'completed' | 'failed'
  result?: any
}
