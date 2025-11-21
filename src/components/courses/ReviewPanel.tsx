import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, XCircle, MessageSquare, Clock, AlertCircle } from 'lucide-react'
import { StatusBadge, StatusTimeline } from '@/components/courses'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { workflowNotifications } from '@/services/workflow-notifications.service'

interface Course {
  id: string
  title: string
  description: string
  status: 'draft' | 'pending-review' | 'published' | 'archived'
  instructor: string
  createdAt: string
  submittedForReviewAt?: string
  publishedAt?: string
  archivedAt?: string
  reviewComments?: string
  requestedChanges?: string
  modules?: Array<{
    id: string
    title: string
    lessons: Array<{ id: string; title: string }>
  }>
}

interface ReviewPanelProps {
  course: Course
  onApprove: (comments: string) => Promise<void>
  onReject: (reason: string) => Promise<void>
  onRequestChanges: (changes: string) => Promise<void>
  onClose?: () => void
}

export function ReviewPanel({ course, onApprove, onReject, onRequestChanges, onClose }: ReviewPanelProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState('')
  const [requestedChanges, setRequestedChanges] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showChangesDialog, setShowChangesDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if user has permission to review
  const canReview = user?.role === 'super-admin' || 
                    user?.role === 'tenant-admin' || 
                    user?.role === 'content-manager'

  const handleApprove = async () => {
    if (!comments.trim()) {
      toast.error('Por favor agrega comentarios de aprobación')
      return
    }

    setIsSubmitting(true)
    try {
      await onApprove(comments)
      
      // Send notification to instructor
      workflowNotifications.notifyCourseApproved({
        courseId: course.id,
        courseTitle: course.title,
        instructorId: course.instructor,
        reviewerName: `${user?.firstName} ${user?.lastName}`,
        comments
      })
      
      toast.success('Curso aprobado exitosamente')
      setShowApproveDialog(false)
      setComments('')
    } catch (error: any) {
      toast.error(error.message || 'Error al aprobar el curso')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Por favor especifica el motivo del rechazo')
      return
    }

    setIsSubmitting(true)
    try {
      await onReject(rejectReason)
      
      // Send notification to instructor
      workflowNotifications.notifyCourseRejected({
        courseId: course.id,
        courseTitle: course.title,
        instructorId: course.instructor,
        reviewerName: `${user?.firstName} ${user?.lastName}`,
        reason: rejectReason
      })
      
      toast.success('Curso rechazado')
      setShowRejectDialog(false)
      setRejectReason('')
    } catch (error: any) {
      toast.error(error.message || 'Error al rechazar el curso')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestChanges = async () => {
    if (!requestedChanges.trim()) {
      toast.error('Por favor especifica los cambios requeridos')
      return
    }

    setIsSubmitting(true)
    try {
      await onRequestChanges(requestedChanges)
      
      // Send notification to instructor
      workflowNotifications.notifyChangesRequested({
        courseId: course.id,
        courseTitle: course.title,
        instructorId: course.instructor,
        reviewerName: `${user?.firstName} ${user?.lastName}`,
        changes: requestedChanges
      })
      
      toast.success('Cambios solicitados al instructor')
      setShowChangesDialog(false)
      setRequestedChanges('')
    } catch (error: any) {
      toast.error(error.message || 'Error al solicitar cambios')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canReview) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No tienes permisos para revisar cursos. Solo content managers y administradores pueden aprobar contenido.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Course Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>Instructor: {course.instructor}</CardDescription>
            </div>
            <StatusBadge status={course.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Descripción</h3>
            <p className="text-sm text-muted-foreground">{course.description}</p>
          </div>

          {/* Course Content Preview */}
          {course.modules && course.modules.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Contenido del Curso</h3>
              <div className="space-y-2">
                {course.modules.map((module, idx) => (
                  <div key={module.id} className="border rounded-lg p-3">
                    <div className="font-medium text-sm">
                      Módulo {idx + 1}: {module.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {module.lessons.length} lecciones
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="font-semibold mb-2">Historial</h3>
            <StatusTimeline
              createdAt={course.createdAt}
              submittedForReviewAt={course.submittedForReviewAt}
              publishedAt={course.publishedAt}
              archivedAt={course.archivedAt}
            />
          </div>

          {/* Previous Comments */}
          {course.reviewComments && (
            <div>
              <h3 className="font-semibold mb-2">Comentarios Previos</h3>
              <div className="bg-muted p-3 rounded-lg text-sm">
                {course.reviewComments}
              </div>
            </div>
          )}

          {/* Requested Changes */}
          {course.requestedChanges && (
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                <strong>Cambios Solicitados:</strong>
                <p className="mt-1">{course.requestedChanges}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {course.status === 'pending-review' && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones de Revisión</CardTitle>
            <CardDescription>
              Revisa el contenido y decide si aprobar, rechazar o solicitar cambios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => setShowApproveDialog(true)}
                className="w-full"
                variant="default"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprobar y Publicar
              </Button>

              <Button
                onClick={() => setShowChangesDialog(true)}
                className="w-full"
                variant="outline"
              >
                <Clock className="mr-2 h-4 w-4" />
                Solicitar Cambios
              </Button>

              <Button
                onClick={() => setShowRejectDialog(true)}
                className="w-full"
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rechazar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar y Publicar Curso</DialogTitle>
            <DialogDescription>
              Este curso será publicado y estará disponible para todos los estudiantes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approve-comments">
                Comentarios de Aprobación <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="approve-comments"
                placeholder="Ejemplo: Excelente contenido, bien estructurado y completo..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? 'Aprobando...' : 'Aprobar y Publicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Cambios</DialogTitle>
            <DialogDescription>
              Especifica qué cambios debe realizar el instructor antes de aprobar el curso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="requested-changes">
                Cambios Requeridos <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="requested-changes"
                placeholder="Ejemplo: - Agregar más ejemplos prácticos en el módulo 2&#10;- Revisar ortografía en la lección 3..."
                value={requestedChanges}
                onChange={(e) => setRequestedChanges(e.target.value)}
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangesDialog(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleRequestChanges} disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Solicitar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Curso</DialogTitle>
            <DialogDescription>
              Este curso será rechazado y el instructor será notificado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta acción rechazará permanentemente el curso. El instructor deberá crear uno nuevo.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="reject-reason">
                Motivo del Rechazo <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="Ejemplo: El contenido no cumple con los estándares de calidad..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
              {isSubmitting ? 'Rechazando...' : 'Rechazar Curso'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Button */}
      {onClose && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      )}
    </div>
  )
}
