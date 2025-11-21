import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Send, CheckCircle2, XCircle, MessageSquare, Archive, ArchiveRestore, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/use-permissions'
import { cn } from '@/lib/utils'

type CourseStatus = 'draft' | 'pending-review' | 'published' | 'archived'

interface ApprovalActionsProps {
  courseId: string
  status?: CourseStatus
  createdBy?: string
  onSubmitReview?: () => Promise<void>
  onApprove?: (comments?: string) => Promise<void>
  onReject?: (comments: string) => Promise<void>
  onRequestChanges?: (changes: string) => Promise<void>
  onArchive?: () => Promise<void>
  onUnarchive?: () => Promise<void>
  className?: string
}

export function ApprovalActions({
  courseId,
  status = 'draft',
  createdBy,
  onSubmitReview,
  onApprove,
  onReject,
  onRequestChanges,
  onArchive,
  onUnarchive,
  className
}: ApprovalActionsProps) {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState('')
  const [requestedChanges, setRequestedChanges] = useState('')

  const isCreator = user?.id === createdBy
  const canSubmit = hasPermission('content:review') && isCreator
  const canApprove = hasPermission('content:approve')
  const canReject = hasPermission('content:reject')
  const canRequestChanges = hasPermission('content:request-changes')
  const canArchive = hasPermission('courses:archive')

  const handleAction = async (action: () => Promise<void>) => {
    setLoading(true)
    try {
      await action()
      setComments('')
      setRequestedChanges('')
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Draft status - instructor can submit for review
  if (status === 'draft' && canSubmit && onSubmitReview) {
    return (
      <div className={cn('space-y-4', className)}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit for Review
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Course for Review?</AlertDialogTitle>
              <AlertDialogDescription>
                This will send the course to content managers for approval. You won't be able to edit it while it's under review.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleAction(onSubmitReview)}>
                Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // Pending review status - content managers can approve/reject/request changes
  if (status === 'pending-review' && (canApprove || canReject || canRequestChanges)) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="text-sm font-medium mb-2">Review Actions</div>

        {/* Approve */}
        {canApprove && onApprove && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default" className="w-full" disabled={loading}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve & Publish
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Approve & Publish Course?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will publish the course and make it available to all students.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="approve-comments">Optional Comments</Label>
                <Textarea
                  id="approve-comments"
                  placeholder="Add any feedback or notes..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="mt-2"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleAction(() => onApprove(comments))}>
                  Approve & Publish
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Request Changes */}
        {canRequestChanges && onRequestChanges && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full" disabled={loading}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Request Changes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Request Changes</AlertDialogTitle>
                <AlertDialogDescription>
                  The course will be sent back to draft with your requested changes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="requested-changes">Required Changes *</Label>
                <Textarea
                  id="requested-changes"
                  placeholder="Describe what needs to be changed..."
                  value={requestedChanges}
                  onChange={(e) => setRequestedChanges(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleAction(() => onRequestChanges(requestedChanges))}
                  disabled={!requestedChanges.trim()}
                >
                  Request Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Reject */}
        {canReject && onReject && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={loading}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject Course
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Course?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reject the course and send it back to draft status.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="reject-comments">Reason for Rejection *</Label>
                <Textarea
                  id="reject-comments"
                  placeholder="Explain why this course is being rejected..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleAction(() => onReject(comments))}
                  disabled={!comments.trim()}
                >
                  Reject Course
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    )
  }

  // Published status - can archive
  if (status === 'published' && canArchive && onArchive) {
    return (
      <div className={cn('space-y-4', className)}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={loading}>
              <Archive className="mr-2 h-4 w-4" />
              Archive Course
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Course?</AlertDialogTitle>
              <AlertDialogDescription>
                This will hide the course from students but preserve all data. You can unarchive it later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleAction(onArchive)}>
                Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // Archived status - can unarchive
  if (status === 'archived' && canArchive && onUnarchive) {
    return (
      <div className={cn('space-y-4', className)}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={loading}>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Unarchive Course
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unarchive Course?</AlertDialogTitle>
              <AlertDialogDescription>
                This will restore the course to published status and make it available to students again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleAction(onUnarchive)}>
                Unarchive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return null
}
