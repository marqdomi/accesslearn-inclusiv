import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'
import { CourseStatus } from '@/lib/types'
import { DownloadSimple, ChartBar, Table as TableIcon } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

export function CourseReport() {
  const { t } = useTranslation()
  const { currentTenant } = useTenant()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [courseReport, setCourseReport] = useState<{
    courseId: string
    courseTitle: string
    totalEnrolled: number
    totalCompleted: number
    totalInProgress: number
    notStarted: number
    averageScore: number
    users: Array<{
      userId: string
      userName: string
      userEmail: string
      status: 'not-started' | 'in-progress' | 'completed'
      progress: number
      quizScore?: number
      completionDate?: string
      enrollmentDate?: string
    }>
  } | null>(null)

  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual')

  useEffect(() => {
    if (currentTenant) {
      loadCourses()
    }
  }, [currentTenant?.id])

  useEffect(() => {
    if (selectedCourseId && currentTenant) {
      loadCourseReport()
    }
  }, [selectedCourseId, currentTenant?.id])

  const loadCourses = async () => {
    if (!currentTenant) return

    try {
      const data = await ApiService.getCourses(currentTenant.id)
      const published = data.filter((c: any) => c.status === 'active')
      setCourses(published)
    } catch (error) {
      console.error('Error loading courses:', error)
    }
  }

  const loadCourseReport = async () => {
    if (!currentTenant || !selectedCourseId) return

    try {
      setLoading(true)
      const report = await ApiService.getCourseReport(selectedCourseId)
      setCourseReport(report)
    } catch (error) {
      console.error('Error loading course report:', error)
    } finally {
      setLoading(false)
    }
  }

  const publishedCourses = courses

  const exportToCSV = () => {
    if (!courseReport) return

    const rows = [
      [
        t('csvExport.userName'),
        t('csvExport.email'),
        t('csvExport.status'),
        t('csvExport.progress'),
        t('csvExport.score'),
        t('csvExport.completionDate')
      ],
      ...courseReport.users.map(user => [
        user.userName,
        user.userEmail,
        user.status,
        user.progress.toString(),
        user.quizScore?.toString() || 'N/A',
        user.completionDate ? new Date(user.completionDate).toLocaleDateString() : 'N/A'
      ])
    ]

    const csvContent = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `course-report-${courseReport.courseTitle}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

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

        {courseReport && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.enrolled')}</p>
                <p className="text-2xl font-bold mt-1">{courseReport.totalEnrolled}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.completed')}</p>
                <p className="text-2xl font-bold mt-1 text-success">{courseReport.totalCompleted}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.inProgress')}</p>
                <p className="text-2xl font-bold mt-1 text-secondary">{courseReport.totalInProgress}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.averageScore')}</p>
                <p className="text-2xl font-bold mt-1">{courseReport.averageScore}%</p>
              </Card>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <CourseReportDetail 
                courseReport={courseReport}
                viewMode={viewMode}
              />
            )}
          </div>
        )}

        {!selectedCourseId && !loading && (
          <p className="text-center text-muted-foreground py-8">{t('analytics.selectCoursePrompt')}</p>
        )}
      </div>
    </Card>
  )
}
