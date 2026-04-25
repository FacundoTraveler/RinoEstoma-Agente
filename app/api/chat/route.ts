import { NextRequest, NextResponse } from 'next/server'
import { processAgentMessage } from '@/lib/agent/agent-handler'

/**
 * Chat API Endpoint
 * Permite interactuar con el agente via HTTP (útil para web chat, testing, etc)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, userId } = body

    // Validar entrada
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      )
    }

    // Procesar con el agente
    const response = await processAgentMessage(message, {
      userId: userId,
      sessionId: sessionId,
      userType: 'patient',
      metadata: {
        source: 'web_chat',
        timestamp: new Date().toISOString(),
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[v0] Error in chat endpoint:', error)

    return NextResponse.json(
      {
        error: 'Failed to process message',
        message:
          'Disculpa, ocurrió un error procesando tu mensaje. Por favor intenta de nuevo.',
        actions: [],
        sessionId: '',
      },
      { status: 500 }
    )
  }
}
