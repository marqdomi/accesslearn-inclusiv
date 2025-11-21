import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge, StatusTimeline, ApprovalActions } from '@/components/courses'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

type CourseStatus = 'draft' | 'pending-review' | 'published' | 'archived'

interface MockCourse {
  id: string
  title: string
  status: CourseStatus
  createdBy: string
  createdAt: string
  submittedForReviewAt?: string
  publishedAt?: string
  archivedAt?: string
  reviewComments?: string
  requestedChanges?: string
}

const mockCourses: Record<CourseStatus, MockCourse> = {
  draft: {
    id: 'course-1',
    title: 'Introduction to React',
    status: 'draft',
    createdBy: 'user-123',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  'pending-review': {
    id: 'course-2',
    title: 'Advanced TypeScript',
    status: 'pending-review',
    createdBy: 'user-123',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    submittedForReviewAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  published: {
    id: 'course-3',
    title: 'JavaScript Fundamentals',
    status: 'published',
    createdBy: 'user-456',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    submittedForReviewAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    reviewComments: 'Great course! Well structured and comprehensive.',
  },
  archived: {
    id: 'course-4',
    title: 'Legacy Angular.js',
    status: 'archived',
    createdBy: 'user-789',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    submittedForReviewAt: new Date(Date.now() - 363 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 362 * 24 * 60 * 60 * 1000).toISOString(),
    archivedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
}

export default function CourseApprovalDemo() {
  const [selectedStatus, setSelectedStatus] = useState<CourseStatus>('draft')
  const [actionMessage, setActionMessage] = useState<string>('')

  const course = mockCourses[selectedStatus]

  const handleAction = async (action: string) => {
    setActionMessage(`Action: ${action} - Course ID: ${course.id}`)
    setTimeout(() => setActionMessage(''), 3000)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Course Approval Workflow Demo</h1>
        <p className="text-muted-foreground">
          Interactive preview of course status components and approval actions
        </p>
      </div>

      {actionMessage && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{actionMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as CourseStatus)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="pending-review">Pending Review</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="space-y-6">
          {/* Course Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>Course ID: {course.id}</CardDescription>
                </div>
                <StatusBadge status={course.status} />
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
                <CardDescription>Track the course approval progress</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusTimeline
                  status={course.status}
                  createdAt={course.createdAt}
                  submittedForReviewAt={course.submittedForReviewAt}
                  publishedAt={course.publishedAt}
                  archivedAt={course.archivedAt}
                  reviewComments={course.reviewComments}
                  requestedChanges={course.requestedChanges}
                />
              </CardContent>
            </Card>

            {/* Approval Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Available Actions</CardTitle>
                <CardDescription>
                  Actions available based on course status and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApprovalActions
                  courseId={course.id}
                  status={course.status}
                  createdBy={course.createdBy}
                  onSubmitReview={() => handleAction('Submit for Review')}
                  onApprove={(comments) => handleAction(`Approve: ${comments || 'No comments'}`)}
                  onReject={(comments) => handleAction(`Reject: ${comments}`)}
                  onRequestChanges={(changes) => handleAction(`Request Changes: ${changes}`)}
                  onArchive={() => handleAction('Archive')}
                  onUnarchive={() => handleAction('Unarchive')}
                />
              </CardContent>
            </Card>
          </div>

          {/* All Status Badges Demo */}
          <Card>
            <CardHeader>
              <CardTitle>All Status Badges</CardTitle>
              <CardDescription>Visual representation of all course statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <StatusBadge status="draft" />
                <StatusBadge status="pending-review" />
                <StatusBadge status="published" />
                <StatusBadge status="archived" />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <StatusBadge status="draft" showIcon={false} />
                <StatusBadge status="pending-review" showIcon={false} />
                <StatusBadge status="published" showIcon={false} />
                <StatusBadge status="archived" showIcon={false} />
              </div>
            </CardContent>
          </Card>

          {/* Component Info */}
          <Card>
            <CardHeader>
              <CardTitle>Component Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">StatusBadge</h4>
                <p className="text-sm text-muted-foreground">
                  Visual indicator showing the current course status with appropriate colors and icons.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">StatusTimeline</h4>
                <p className="text-sm text-muted-foreground">
                  Timeline view showing the progression of the course through different stages with timestamps and messages.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">ApprovalActions</h4>
                <p className="text-sm text-muted-foreground">
                  Context-aware action buttons that appear based on the course status and user permissions.
                  Includes confirmation dialogs for all destructive actions.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
