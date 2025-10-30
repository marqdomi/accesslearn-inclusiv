import { useKV } from '@github/spark/hooks'
import { User, UserProgress, CourseStructure } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, DownloadSimple } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'

interface ReportsViewProps {
  onBack: () => void
}

export function ReportsView({ onBack }: ReportsViewProps) {
  const [users] = useKV<User[]>('users', [])
  const [courses] = useKV<CourseStructure[]>('admin-courses', [])
  const [allProgress] = useKV<Record<string, UserProgress[]>>('all-user-progress', {})

  const exportToCSV = () => {
    const rows = [
      ['User Name', 'Email', 'Course', 'Status', 'Progress', 'Assessment Score']
    ]

    Object.entries(allProgress || {}).forEach(([userId, progressList]) => {
      const user = users?.find(u => u.id === userId)
      if (!user) return

      progressList.forEach(progress => {
        const course = courses?.find(c => c.id === progress.courseId)
        if (!course) return

        const progressPercent = progress.completedModules.length / (course.modules.length || 1) * 100

        rows.push([
          user.name,
          user.email,
          course.title,
          progress.status,
          `${Math.round(progressPercent)}%`,
          progress.assessmentScore?.toString() || 'N/A'
        ])
      })
    })

    const csvContent = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `learning-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getUserProgress = (userId: string) => {
    const userProgress = allProgress?.[userId] || []
    const completed = userProgress.filter(p => p.status === 'completed').length
    const inProgress = userProgress.filter(p => p.status === 'in-progress').length
    const notStarted = userProgress.filter(p => p.status === 'not-started').length
    
    return { completed, inProgress, notStarted, total: userProgress.length }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Track learning progress and engagement
            </p>
          </div>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <DownloadSimple className="mr-2" size={18} />
          Export to CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses?.filter(c => c.published).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(allProgress || {}).reduce((sum, progress) => sum + progress.length, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(allProgress || {}).reduce(
                (sum, progress) => sum + progress.filter(p => p.status === 'completed').length,
                0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Progress Overview</CardTitle>
          <CardDescription>
            Track individual learner progress across all courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(users || []).length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No user data available yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(users || []).map((user) => {
                const progress = getUserProgress(user.id)
                const completionRate = progress.total > 0
                  ? Math.round((progress.completed / progress.total) * 100)
                  : 0

                return (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{completionRate}% Complete</p>
                        <p className="text-xs text-muted-foreground">
                          {progress.completed}/{progress.total} courses
                        </p>
                      </div>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                    <div className="flex gap-2 mt-3">
                      <Badge variant="default" className="text-xs">
                        {progress.completed} Completed
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {progress.inProgress} In Progress
                      </Badge>
                      {progress.notStarted > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {progress.notStarted} Not Started
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
