import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, Clock, FileEdit, XCircle, Archive, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

type CourseStatus = 'draft' | 'pending-review' | 'published' | 'archived'

interface StatusTimelineProps {
  status?: CourseStatus
  createdAt?: string
  submittedForReviewAt?: string
  publishedAt?: string
  archivedAt?: string
  reviewComments?: string
  requestedChanges?: string
  className?: string
}

interface TimelineEvent {
  label: string
  date?: string
  icon: React.ComponentType<{ className?: string }>
  status: 'completed' | 'current' | 'pending'
  message?: string
}

export function StatusTimeline({
  status = 'draft',
  createdAt,
  submittedForReviewAt,
  publishedAt,
  archivedAt,
  reviewComments,
  requestedChanges,
  className
}: StatusTimelineProps) {
  const events: TimelineEvent[] = [
    {
      label: 'Created as Draft',
      date: createdAt,
      icon: FileEdit,
      status: 'completed'
    },
    {
      label: 'Submitted for Review',
      date: submittedForReviewAt,
      icon: Send,
      status: submittedForReviewAt 
        ? 'completed' 
        : status === 'pending-review' 
        ? 'current' 
        : 'pending',
      message: requestedChanges ? `Changes requested: ${requestedChanges}` : undefined
    },
    {
      label: 'Published',
      date: publishedAt,
      icon: CheckCircle2,
      status: publishedAt 
        ? 'completed' 
        : status === 'published' 
        ? 'current' 
        : 'pending',
      message: reviewComments
    },
    {
      label: 'Archived',
      date: archivedAt,
      icon: Archive,
      status: archivedAt ? 'completed' : 'pending'
    }
  ]

  // Filter out archived if not archived
  const visibleEvents = status === 'archived' 
    ? events 
    : events.filter(e => e.label !== 'Archived')

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold text-muted-foreground mb-4">Course Status Timeline</h3>
      <div className="space-y-6">
        {visibleEvents.map((event, index) => {
          const Icon = event.icon
          const isLast = index === visibleEvents.length - 1

          return (
            <div key={event.label} className="relative">
              {/* Connecting line */}
              {!isLast && (
                <div 
                  className={cn(
                    'absolute left-3 top-8 bottom-0 w-0.5 -mb-6',
                    event.status === 'completed' 
                      ? 'bg-emerald-500 dark:bg-emerald-600' 
                      : 'bg-slate-200 dark:bg-slate-700'
                  )}
                />
              )}

              {/* Event content */}
              <div className="flex gap-3">
                {/* Icon */}
                <div 
                  className={cn(
                    'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                    event.status === 'completed' && 'bg-emerald-500 text-white dark:bg-emerald-600',
                    event.status === 'current' && 'bg-amber-500 text-white dark:bg-amber-600 ring-4 ring-amber-100 dark:ring-amber-950',
                    event.status === 'pending' && 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p 
                      className={cn(
                        'text-sm font-medium',
                        event.status === 'completed' && 'text-foreground',
                        event.status === 'current' && 'text-foreground font-semibold',
                        event.status === 'pending' && 'text-muted-foreground'
                      )}
                    >
                      {event.label}
                    </p>
                    {event.date && (
                      <time className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                      </time>
                    )}
                  </div>
                  {event.message && (
                    <p className="text-sm text-muted-foreground">
                      {event.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
