/**
 * Workflow Notification Service
 * 
 * Handles notifications for course approval workflow events:
 * - Course submitted for review
 * - Course approved
 * - Course rejected  
 * - Changes requested
 * - Course published
 */

interface NotificationPayload {
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  actionUrl?: string
  metadata?: Record<string, any>
}

class WorkflowNotificationService {
  private static instance: WorkflowNotificationService
  private notificationHandlers: ((payload: NotificationPayload) => void)[] = []

  private constructor() {}

  public static getInstance(): WorkflowNotificationService {
    if (!WorkflowNotificationService.instance) {
      WorkflowNotificationService.instance = new WorkflowNotificationService()
    }
    return WorkflowNotificationService.instance
  }

  /**
   * Register a notification handler
   */
  public registerHandler(handler: (payload: NotificationPayload) => void) {
    this.notificationHandlers.push(handler)
  }

  /**
   * Unregister a notification handler
   */
  public unregisterHandler(handler: (payload: NotificationPayload) => void) {
    this.notificationHandlers = this.notificationHandlers.filter(h => h !== handler)
  }

  /**
   * Send a notification
   */
  private sendNotification(payload: NotificationPayload) {
    this.notificationHandlers.forEach(handler => {
      try {
        handler(payload)
      } catch (error) {
        console.error('Error in notification handler:', error)
      }
    })
  }

  /**
   * Course submitted for review - notify content managers
   */
  public notifyCourseSubmitted(params: {
    courseId: string
    courseTitle: string
    instructorName: string
    contentManagerIds: string[]
  }) {
    const { courseId, courseTitle, instructorName, contentManagerIds } = params

    contentManagerIds.forEach(managerId => {
      this.sendNotification({
        userId: managerId,
        title: 'Nuevo curso para revisar',
        message: `${instructorName} ha enviado "${courseTitle}" para aprobación`,
        type: 'info',
        actionUrl: `/content-manager`,
        metadata: {
          courseId,
          courseTitle,
          event: 'course_submitted'
        }
      })
    })
  }

  /**
   * Course approved - notify instructor
   */
  public notifyCourseApproved(params: {
    courseId: string
    courseTitle: string
    instructorId: string
    reviewerName: string
    comments?: string
  }) {
    const { courseId, courseTitle, instructorId, reviewerName, comments } = params

    this.sendNotification({
      userId: instructorId,
      title: '¡Curso aprobado!',
      message: `Tu curso "${courseTitle}" ha sido aprobado por ${reviewerName}${comments ? '. ' + comments : ''}`,
      type: 'success',
      actionUrl: `/courses/${courseId}`,
      metadata: {
        courseId,
        courseTitle,
        event: 'course_approved'
      }
    })
  }

  /**
   * Course rejected - notify instructor
   */
  public notifyCourseRejected(params: {
    courseId: string
    courseTitle: string
    instructorId: string
    reviewerName: string
    reason: string
  }) {
    const { courseId, courseTitle, instructorId, reviewerName, reason } = params

    this.sendNotification({
      userId: instructorId,
      title: 'Curso rechazado',
      message: `Tu curso "${courseTitle}" ha sido rechazado por ${reviewerName}. Motivo: ${reason}`,
      type: 'error',
      actionUrl: `/courses/${courseId}/edit`,
      metadata: {
        courseId,
        courseTitle,
        event: 'course_rejected'
      }
    })
  }

  /**
   * Changes requested - notify instructor
   */
  public notifyChangesRequested(params: {
    courseId: string
    courseTitle: string
    instructorId: string
    reviewerName: string
    changes: string
  }) {
    const { courseId, courseTitle, instructorId, reviewerName, changes } = params

    this.sendNotification({
      userId: instructorId,
      title: 'Cambios solicitados en tu curso',
      message: `${reviewerName} ha solicitado cambios en "${courseTitle}": ${changes}`,
      type: 'warning',
      actionUrl: `/courses/${courseId}/edit`,
      metadata: {
        courseId,
        courseTitle,
        event: 'changes_requested'
      }
    })
  }

  /**
   * Course published - notify instructor and content managers
   */
  public notifyCoursePublished(params: {
    courseId: string
    courseTitle: string
    instructorId: string
    publisherName: string
    notifyAdmins?: string[]
  }) {
    const { courseId, courseTitle, instructorId, publisherName, notifyAdmins = [] } = params

    // Notify instructor
    this.sendNotification({
      userId: instructorId,
      title: '¡Curso publicado!',
      message: `Tu curso "${courseTitle}" ha sido publicado por ${publisherName} y ya está disponible para los estudiantes`,
      type: 'success',
      actionUrl: `/courses/${courseId}`,
      metadata: {
        courseId,
        courseTitle,
        event: 'course_published'
      }
    })

    // Notify admins if needed
    notifyAdmins.forEach(adminId => {
      this.sendNotification({
        userId: adminId,
        title: 'Curso publicado',
        message: `El curso "${courseTitle}" ha sido publicado`,
        type: 'info',
        actionUrl: `/courses/${courseId}`,
        metadata: {
          courseId,
          courseTitle,
          event: 'course_published'
        }
      })
    })
  }

  /**
   * Course archived - notify instructor
   */
  public notifyCourseArchived(params: {
    courseId: string
    courseTitle: string
    instructorId: string
    archiverName: string
    reason?: string
  }) {
    const { courseId, courseTitle, instructorId, archiverName, reason } = params

    this.sendNotification({
      userId: instructorId,
      title: 'Curso archivado',
      message: `Tu curso "${courseTitle}" ha sido archivado por ${archiverName}${reason ? '. Motivo: ' + reason : ''}`,
      type: 'warning',
      actionUrl: `/courses/${courseId}`,
      metadata: {
        courseId,
        courseTitle,
        event: 'course_archived'
      }
    })
  }
}

export const workflowNotifications = WorkflowNotificationService.getInstance()
