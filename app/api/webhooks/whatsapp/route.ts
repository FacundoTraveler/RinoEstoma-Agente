import { NextRequest, NextResponse } from 'next/server'
import { WHATSAPP_CONFIG } from '@/lib/agent/agent-config'
import { processAgentMessage } from '@/lib/agent/agent-handler'
import { supabase } from '@/lib/supabase-client'

/**
 * WhatsApp Webhook Handler
 * Recibe mensajes de WhatsApp Business API y los procesa con el agente
 */

// GET para verificación del webhook
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

// Verificar token
  if (token === WHATSAPP_CONFIG.webhookToken) {
    console.log('[WhatsApp Webhook] ✅ Verification successful')
    // Meta espera texto plano, no JSON
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  console.log('[WhatsApp Webhook] ❌ Verification failed - token mismatch')
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// POST para procesar mensajes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[v0] WhatsApp webhook received:', JSON.stringify(body, null, 2))

    // Estructura esperada de WhatsApp Business API
    const { entry } = body

    if (!entry || !Array.isArray(entry)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Procesar cada entrada
    for (const item of entry) {
      const changes = item.changes || []

      for (const change of changes) {
        const { value } = change

        if (!value.messages || !Array.isArray(value.messages)) {
          continue
        }

        // Procesar cada mensaje
        for (const message of value.messages) {
          await handleWhatsAppMessage(message, value)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error processing WhatsApp webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Maneja un mensaje individual de WhatsApp
 */
async function handleWhatsAppMessage(
  message: any,
  context: any
) {
  try {
    // Extraer información del mensaje
    const messageId = message.id
    const fromPhone = message.from
    const messageType = message.type
    let messageText = ''

    // Soportar diferentes tipos de mensajes
    if (messageType === 'text') {
      messageText = message.text?.body || ''
    } else if (messageType === 'button') {
      messageText = message.button?.text || ''
    } else if (messageType === 'interactive') {
      messageText = message.interactive?.button_reply?.title || ''
    } else {
      // No soportado
      await sendWhatsAppMessage(
        fromPhone,
        'Disculpa, ese tipo de mensaje no es soportado. Por favor envía un mensaje de texto.'
      )
      return
    }

    if (!messageText.trim()) {
      return
    }

    console.log(`[v0] Processing message from ${fromPhone}: "${messageText}"`)

    // Procesar con el agente
    const response = await processAgentMessage(messageText, {
      userId: fromPhone,
      sessionId: undefined,
      metadata: {
        whatsapp_phone: fromPhone,
        message_id: messageId,
        timestamp: new Date().toISOString(),
      },
    })

    // Enviar respuesta por WhatsApp
    await sendWhatsAppMessage(fromPhone, response.message)

    // Si hay acciones, registrar en logs
    if (response.actions.length > 0) {
      console.log('[v0] Agent actions:', response.actions)

      // Aquí se podrían procesar acciones específicas
      for (const action of response.actions) {
        await handleAgentAction(action, fromPhone)
      }
    }

    // Marcar mensaje como leído
    await markWhatsAppMessageAsRead(messageId)
  } catch (error) {
    console.error('[v0] Error handling WhatsApp message:', error)

    // Intentar enviar mensaje de error
    try {
      await sendWhatsAppMessage(
        message.from,
        'Disculpa, ocurrió un error procesando tu mensaje. Por favor intenta de nuevo.'
      )
    } catch (sendError) {
      console.error('[v0] Error sending error message:', sendError)
    }
  }
}

/**
 * Envía un mensaje por WhatsApp Business API
 */
async function sendWhatsAppMessage(
  recipientPhone: string,
  messageText: string
) {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${WHATSAPP_CONFIG.phoneId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientPhone,
          type: 'text',
          text: {
            body: messageText,
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('[v0] WhatsApp send error:', data)
      throw new Error(`Failed to send WhatsApp message: ${data.error?.message}`)
    }

    console.log('[v0] WhatsApp message sent:', data.messages?.[0]?.id)
    return data
  } catch (error) {
    console.error('[v0] Error sending WhatsApp message:', error)
    throw error
  }
}

/**
 * Marca un mensaje como leído
 */
async function markWhatsAppMessageAsRead(messageId: string) {
  try {
    await fetch(
      `https://graph.instagram.com/v18.0/${messageId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'read',
        }),
      }
    )
  } catch (error) {
    console.error('[v0] Error marking message as read:', error)
  }
}

/**
 * Procesa acciones del agente (como confirmaciones, notificaciones, etc)
 */
async function handleAgentAction(action: any, phoneNumber: string) {
  try {
    switch (action.type) {
      case 'schedule_appointment':
        // Enviar confirmación
        if (action.result?.success) {
          await sendWhatsAppMessage(
            phoneNumber,
            `✅ ${action.result.message}\n\nTe contactaremos pronto para confirmar.`
          )
        }
        break

      case 'escalate_to_professional':
        // Notificar escalamiento
        if (action.result?.success) {
          await sendWhatsAppMessage(
            phoneNumber,
            `📞 ${action.result.message}\n\nUn profesional se contactará con usted en breve.`
          )
        }
        break

      // Otros tipos de acciones se pueden manejar aquí
    }
  } catch (error) {
    console.error('[v0] Error handling agent action:', error)
  }
}
