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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, MessageSquare, Send, Sparkles } from 'lucide-react'
import { MentorProfile } from '@/lib/types'
import { ApiService } from '@/services/api.service'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

interface RequestMentorshipModalProps {
  isOpen: boolean
  onClose: () => void
  mentor: MentorProfile
  menteeId: string
  menteeName: string
  menteeEmail: string
  tenantId: string
}

const TOPICS = [
  { value: 'react', label: 'React & Frontend' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'devops', label: 'DevOps & Cloud' },
  { value: 'mobile', label: 'Desarrollo Móvil' },
  { value: 'backend', label: 'Backend & APIs' },
  { value: 'database', label: 'Bases de Datos' },
  { value: 'ml', label: 'Machine Learning' },
  { value: 'career', label: 'Desarrollo Profesional' },
  { value: 'other', label: 'Otro' },
]

export function RequestMentorshipModal({
  isOpen,
  onClose,
  mentor,
  menteeId,
  menteeName,
  menteeEmail,
  tenantId,
}: RequestMentorshipModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [message, setMessage] = useState('')
  const [preferredDate, setPreferredDate] = useState<Date>()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [errors, setErrors] = useState<{
    topic?: string
    customTopic?: string
    message?: string
  }>({})

  const handleClose = () => {
    if (!submitting) {
      // Reset form
      setSelectedTopic('')
      setCustomTopic('')
      setMessage('')
      setPreferredDate(undefined)
      setCalendarOpen(false)
      setErrors({})
      onClose()
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setPreferredDate(date)
    setCalendarOpen(false)
  }

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!selectedTopic) {
      newErrors.topic = 'Selecciona un tema'
    }

    if (selectedTopic === 'other' && !customTopic.trim()) {
      newErrors.customTopic = 'Especifica el tema personalizado'
    }

    if (!message.trim()) {
      newErrors.message = 'El mensaje es obligatorio'
    } else if (message.trim().length < 20) {
      newErrors.message = 'El mensaje debe tener al menos 20 caracteres'
    } else if (message.trim().length > 500) {
      newErrors.message = 'El mensaje no puede superar los 500 caracteres'
    }

    if (preferredDate && preferredDate < new Date()) {
      toast.error('La fecha preferida debe ser futura')
      return false
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setSubmitting(true)

      const topic =
        selectedTopic === 'other'
          ? customTopic.trim()
          : TOPICS.find(t => t.value === selectedTopic)?.label || selectedTopic

      await ApiService.createMentorshipRequest(
        tenantId,
        menteeId,
        menteeName,
        menteeEmail,
        mentor.userId,
        topic,
        message.trim(),
        preferredDate ? preferredDate.getTime() : undefined
      )

      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      toast.success('¡Solicitud enviada!', {
        description: `${mentor.name} revisará tu solicitud pronto`,
      })

      handleClose()
    } catch (error: any) {
      console.error('Error creating request:', error)
      toast.error('Error al enviar solicitud', {
        description: error.message || 'Intenta de nuevo',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Solicitar Mentoría
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para solicitar una mentoría con{' '}
            <span className="font-semibold text-foreground">{mentor.name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Mentor Info */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-3">
              {mentor.avatar && (
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{mentor.name}</div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {mentor.specialties.slice(0, 3).join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* Topic Selection */}
          <div className="space-y-2">
            <Label htmlFor="topic">
              Tema de la mentoría <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger id="topic" className={errors.topic ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona un tema..." />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map(topic => (
                  <SelectItem key={topic.value} value={topic.value}>
                    {topic.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.topic && (
              <p className="text-sm text-destructive">{errors.topic}</p>
            )}
          </div>

          {/* Custom Topic (if "other" selected) */}
          <AnimatePresence>
            {selectedTopic === 'other' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="customTopic">
                  Especifica el tema <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customTopic"
                  placeholder="Ej: Testing con Jest, GraphQL, etc."
                  value={customTopic}
                  onChange={e => setCustomTopic(e.target.value)}
                  className={errors.customTopic ? 'border-destructive' : ''}
                />
                {errors.customTopic && (
                  <p className="text-sm text-destructive">{errors.customTopic}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              ¿Qué necesitas aprender? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Describe tu situación actual, qué necesitas aprender y qué esperas lograr con esta mentoría..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              className={errors.message ? 'border-destructive' : ''}
            />
            <div className="flex items-center justify-between text-xs">
              {errors.message ? (
                <p className="text-destructive">{errors.message}</p>
              ) : (
                <p className="text-muted-foreground">
                  Mínimo 20 caracteres, máximo 500
                </p>
              )}
              <p
                className={
                  message.length > 500
                    ? 'text-destructive'
                    : message.length < 20
                    ? 'text-muted-foreground'
                    : 'text-green-600'
                }
              >
                {message.length}/500
              </p>
            </div>
          </div>

          {/* Preferred Date (Optional) */}
          <div className="space-y-2">
            <Label>Fecha preferida (opcional)</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {preferredDate ? (
                    format(preferredDate, 'PPP', { locale: es })
                  ) : (
                    <span className="text-muted-foreground">Selecciona una fecha...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={preferredDate}
                  onSelect={handleDateSelect}
                  disabled={date => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return date < today
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Si tienes preferencia de fecha, el mentor lo tomará en cuenta al programar
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-2">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">¿Qué sigue?</p>
                <ol className="space-y-1 text-muted-foreground text-xs">
                  <li>1. {mentor.name} recibirá tu solicitud</li>
                  <li>2. Revisará tu mensaje y disponibilidad</li>
                  <li>3. Te confirmará la fecha de la sesión</li>
                  <li>4. Recibirás una notificación cuando acepte</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1 gap-2">
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Solicitud
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
