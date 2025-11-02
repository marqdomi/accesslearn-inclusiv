import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useKV } from '@github/spark/hooks'
import { CourseStructure, UserProgress, CourseStatus } from '@/lib/types'
import { DownloadSimple, ChartBar, Table as TableIcon } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

export function CourseReport() {
  const { t } = useTranslation()
  const [users] = useKV<any[]>('users', [])
  const [courses] = useKV<CourseStructure[]>('courses', [])
  const [allUserProgress] = useKV<Record<string, UserProgress[]>>('user-progress-all', {})

  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual')

  const publishedCourses = (courses || []).filter(c => c.published)

  const exportToCSV = () => {
    if (!selectedCourseId) return

    const course = publishedCourses.find(c => c.id === selectedCourseId)
    const enrolledUsers = (users || []).filter(u => {
      const userProgress = (allUserProgress || {})[u.id] || []
      return userProgress.some(p => p.courseId === selectedCourseId)
    })

    const rows = [
      ['User Name', 'Email', 'Status', 'Progress %', 'Score', 'Completion Date'],
      ...enrolledUsers.map(user => {
        const userProgress = (allUserProgress || {})[user.id] || []
        const courseProgress = userProgress.find(p => p.courseId === selectedCourseId)
        const completedModules = courseProgress?.completedModules?.length || 0
        const totalModules = course?.modules?.length || 1
        const progressPercent = Math.round((completedModules / totalModules) * 100)

        return [
          user?.displayName || user?.name || '',
          user?.email || '',
          courseProgress?.status || 'not-started',
          progressPercent.toString(),
          courseProgress?.assessmentScore?.toString() || 'N/A',
          courseProgress?.status === 'completed' && courseProgress?.lastAccessed
            ? new Date(courseProgress.lastAccessed).toLocaleDateString()
            : 'N/A'
        ]
      })
    ]

    const csvContent = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `course-report-${course?.title || 'report'}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const selectedCourse = publishedCourses.find(c => c.id === selectedCourseId)
  const enrolledUsers = selectedCourse ? (users || []).filter(u => {
    const userProgress = (allUserProgress || {})[u.id] || []
    return userProgress.some(p => p.courseId === selectedCourseId)
  }) : []

  const completedCount = enrolledUsers.filter(u => {
    const userProgress = (allUserProgress || {})[u.id] || []
    const courseProgress = userProgress.find(p => p.courseId === selectedCourseId)
    return courseProgress?.status === 'completed'
  }).length

  const inProgressCount = enrolledUsers.filter(u => {
    const userProgress = (allUserProgress || {})[u.id] || []
    const courseProgress = userProgress.find(p => p.courseId === selectedCourseId)
    return courseProgress?.status === 'in-progress'
  }).length

  const notStartedCount = enrolledUsers.filter(u => {
    const userProgress = (allUserProgress || {})[u.id] || []
    const courseProgress = userProgress.find(p => p.courseId === selectedCourseId)
    return !courseProgress || courseProgress?.status === 'not-started'
  }).length

  const averageScore = (() => {
    const scores = enrolledUsers
      .map(u => {
        const userProgress = (allUserProgress || {})[u.id] || []
        const courseProgress = userProgress.find(p => p.courseId === selectedCourseId)
        return courseProgress?.assessmentScore
      })
      .filter(s => s !== undefined) as number[]

    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  })()

  const getStatusBadge = (status: CourseStatus) => {
    const variants: Record<CourseStatus, 'default' | 'secondary' | 'outline'> = {
      'completed': 'default',
      'in-progress': 'secondary',
      'not-started': 'outline'
    }
    return (
      <Badge variant={variants[status]}>
        {t(`courseStatus.${status}`)}
      </Badge>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t('analytics.reports.course.title')}</h2>
          <p className="text-muted-foreground">{t('analytics.reports.course.description')}</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder={t('analytics.filters.selectCourse')} />
            </SelectTrigger>
            <SelectContent>
              {publishedCourses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCourseId && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'visual' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('visual')}
                  className="gap-2"
                >
                  <ChartBar size={16} />
                  {t('analytics.viewMode.visual')}
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="gap-2"
                >
                  <TableIcon size={16} />
                  {t('analytics.viewMode.table')}
                </Button>
              </div>
              <Button onClick={exportToCSV} className="gap-2">
                <DownloadSimple size={20} />
                {t('analytics.exportCSV')}
              </Button>
            </div>
          )}
        </div>

        {selectedCourse && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.enrolled')}</p>
                <p className="text-2xl font-bold mt-1">{enrolledUsers.length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.completed')}</p>
                <p className="text-2xl font-bold mt-1 text-success">{completedCount}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.inProgress')}</p>
                <p className="text-2xl font-bold mt-1 text-secondary">{inProgressCount}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.averageScore')}</p>
                <p className="text-2xl font-bold mt-1">{averageScore}%</p>
              </Card>
            </div>

            {viewMode === 'table' ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('analytics.table.userName')}</TableHead>
                      <TableHead>{t('analytics.table.email')}</TableHead>
                      <TableHead>{t('analytics.table.status')}</TableHead>
                      <TableHead>{t('analytics.table.progress')}</TableHead>
                      <TableHead>{t('analytics.table.score')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledUsers.map(user => {
                      const userProgress = (allUserProgress || {})[user.id] || []
                      const courseProgress = userProgress.find(p => p.courseId === selectedCourseId)
                      const completedModules = courseProgress?.completedModules?.length || 0
                      const totalModules = selectedCourse?.modules?.length || 1
                      const progressPercent = Math.round((completedModules / totalModules) * 100)

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.displayName || user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getStatusBadge(courseProgress?.status || 'not-started')}</TableCell>
                          <TableCell>{progressPercent}%</TableCell>
                          <TableCell>
                            {courseProgress?.assessmentScore !== undefined ? `${courseProgress.assessmentScore}%` : 'N/A'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="space-y-2">
                {enrolledUsers.map(user => {
                  const userProgress = (allUserProgress || {})[user.id] || []
                  const courseProgress = userProgress.find(p => p.courseId === selectedCourseId)
                  const completedModules = courseProgress?.completedModules?.length || 0
                  const totalModules = selectedCourse?.modules?.length || 1
                  const progressPercent = Math.round((completedModules / totalModules) * 100)

                  return (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{user.displayName || user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        {getStatusBadge(courseProgress?.status || 'not-started')}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{t('analytics.progress')}</span>
                          <span className="font-medium">{progressPercent}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {!selectedCourseId && (
          <p className="text-center text-muted-foreground py-8">{t('analytics.selectCoursePrompt')}</p>
        )}
      </div>
    </Card>
  )
}
