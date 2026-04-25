'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { MessageCircle, X, Send } from 'lucide-react'
import { ChatMessage as ChatMessageType } from '@/lib/types'
import useSWR, { mutate } from 'swr'

interface ChatWidgetProps {
  autoOpen?: boolean
  position?: 'bottom-right' | 'bottom-left'
}

export function ChatWidget({ autoOpen = false, position = 'bottom-right' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(autoOpen)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Cargar sesión desde localStorage
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chat-session-id')
    if (savedSessionId) {
      setSessionId(savedSessionId)
    }
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Agregar mensaje del usuario visualmente
    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      session_id: sessionId,
      sender_type: 'user',
      content: userMessage,
      message_type: 'text',
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])

    try {
      // Enviar al backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      // Actualizar sesión ID si es nueva
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId)
        localStorage.setItem('chat-session-id', data.sessionId)
      }

      // Agregar respuesta del agente
      const agentMsg: ChatMessageType = {
        id: Date.now().toString(),
        session_id: data.sessionId || sessionId,
        sender_type: 'agent',
        content: data.message,
        message_type: 'text',
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, agentMsg])
    } catch (error) {
      console.error('[v0] Error sending message:', error)

      // Mostrar mensaje de error
      const errorMsg: ChatMessageType = {
        id: Date.now().toString(),
        session_id: sessionId,
        sender_type: 'agent',
        content:
          'Disculpa, ocurrió un error. Por favor intenta de nuevo.',
        message_type: 'text',
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const positionClasses =
    position === 'bottom-right'
      ? 'bottom-6 right-6'
      : 'bottom-6 left-6'

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses} z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg transition-all hover:scale-110`}
        aria-label="Abrir chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className={`fixed ${positionClasses} z-50 w-96 max-w-[calc(100vw-2rem)]`}>
      <Card className="flex flex-col h-96 md:h-[500px] border-primary/20 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-primary text-primary-foreground px-4 py-3 rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">RinoEstoma Agent</h3>
              <p className="text-xs opacity-90">Asistente IA</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-primary/80 rounded transition-colors"
            aria-label="Cerrar chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 space-y-3 border-b border-border">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Hola, soy el asistente de RinoEstoma. ¿Cómo puedo ayudarte?
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.sender_type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className="flex-1 text-sm"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
