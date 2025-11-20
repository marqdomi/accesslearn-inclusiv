import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'
import { MentorshipSession } from '@/lib/types'
import { ApiService } from '@/services/api.service'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

interface RateMentorshipModalProps {
  session: MentorshipSession | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  tenantId: string
}

export function RateMentorshipModal({
  session,
  open,
  onOpenChange,
  onSuccess,
  tenantId
}: RateMentorshipModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!session || rating === 0) {
      toast.error('Por favor selecciona una calificación')
      return
    }

    try {
      setSubmitting(true)

      await ApiService.rateMentorshipSession(
        session.id,
        tenantId,
        rating,
        feedback.trim() || undefined
      )

      // Celebración con confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
      })

      toast.success('¡Gracias por tu calificación!', {
        description: `Has calificado a ${session.mentorName} con ${rating} estrellas`
      })

      // Reset form
      setRating(0)
      setFeedback('')
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error rating session:', error)
      toast.error('Error al enviar la calificación')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setHoveredRating(0)
    setFeedback('')
    onOpenChange(false)
  }

  if (!session) return null

  const displayRating = hoveredRating || rating

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Calificar Sesión de Mentoría</DialogTitle>
          <DialogDescription>
            Comparte tu experiencia con <strong>{session.mentorName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Session Info */}
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-1">{session.topic}</p>
            <p className="text-muted-foreground text-xs">
              Duración: {session.duration} minutos
            </p>
          </div>

          {/* Star Rating */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              ¿Cómo calificarías esta sesión?
            </label>
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= displayRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              {displayRating > 0 && (
                <motion.p
                  key={displayRating}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-center text-sm font-medium"
                >
                  {displayRating === 1 && '😞 Necesita mejorar'}
                  {displayRating === 2 && '😐 Regular'}
                  {displayRating === 3 && '🙂 Bueno'}
                  {displayRating === 4 && '😊 Muy bueno'}
                  {displayRating === 5 && '🤩 Excelente'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Feedback (optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Comentarios adicionales (opcional)
            </label>
            <Textarea
              placeholder="¿Qué te pareció la sesión? ¿Qué aprendiste?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {feedback.length}/500
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={rating === 0 || submitting}
          >
            {submitting ? 'Enviando...' : 'Enviar Calificación'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
