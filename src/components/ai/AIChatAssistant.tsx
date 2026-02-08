/**
 * AI Chat Assistant Component
 * Floating chat widget for asking questions about course content
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { ApiService } from '@/services/api.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sparkles, Send, Loader2, Bot, User, X, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatAssistantProps {
  courseId: string
  courseTitle: string
}

export function AIChatAssistant({ courseId, courseTitle }: AIChatAssistantProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await ApiService.chatWithAI(courseId, trimmed, messages)
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Intenta de nuevo.',
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        >
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg bg-purple-600 hover:bg-purple-700 text-white p-0"
          >
            <div className="relative">
              <MessageCircle className="h-6 w-6" />
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300" />
            </div>
          </Button>
        </motion.div>
      </SheetTrigger>

      <SheetContent side="right" className="w-[400px] sm:w-[440px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <SheetTitle className="text-white flex items-center gap-2 text-base">
            <Bot className="h-5 w-5" />
            Asistente de Aprendizaje
          </SheetTitle>
          <p className="text-xs text-purple-100 truncate">{courseTitle}</p>
        </SheetHeader>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <Bot className="h-12 w-12 text-purple-300 mb-3" />
              <h3 className="font-medium text-sm mb-1">¡Hola! Soy tu asistente de aprendizaje</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Pregúntame cualquier cosa sobre el contenido del curso. Estoy aquí para ayudarte a
                aprender.
              </p>
              <div className="space-y-2 w-full">
                {[
                  '¿Cuáles son los puntos clave de este curso?',
                  '¿Puedes explicarme el tema principal?',
                  '¿Qué debería estudiar primero?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion)
                      inputRef.current?.focus()
                    }}
                    className="w-full text-left text-xs p-2.5 rounded-lg border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    💬 {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                      <Bot className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-muted',
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                      <User className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2.5"
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                  <Bot className="h-3.5 w-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-purple-600 hover:bg-purple-700 shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Powered by Google Gemini AI
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
