import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'
import { CourseStatus } from '@/lib/types'
import { MagnifyingGlass, DownloadSimple, ChartBar, Table as TableIcon } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

export function UserProgressReport() {
  const { t } = useTranslation()
  const { currentTenant } = useTenant()
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<Array<{
    userId: string
    userName: string
    userEmail: string
    teamName?: string
    mentorName?: string
    courses: Array<{
      courseId: string
      courseTitle: string
      status: 'not-started' | 'in-progress' | 'completed'
      progress: number
      quizScore?: number
      completionDate?: string
      enrollmentDate?: string
    }>
  }>>([])
  const [groups, setGroups] = useState<any[]>([])
  const [mentors, setMentors] = useState<any[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [teamFilter, setTeamFilter] = useState('all')
  const [mentorFilter, setMentorFilter] = useState('all')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual')

  useEffect(() => {
    if (currentTenant) {
      loadData()
    }
  }, [currentTenant?.id, searchTerm, teamFilter, mentorFilter])

  const loadData = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const filters: any = {}
      if (searchTerm) filters.searchQuery = searchTerm
      if (teamFilter !== 'all') filters.teamId = teamFilter
      if (mentorFilter !== 'all') filters.mentorId = mentorFilter

      const data = await ApiService.getUserProgressReport(filters)
      setReportData(data)

      // Load groups for filter
      const groupsData = await ApiService.getGroups(currentTenant.id)
      setGroups(groupsData)

      // TODO: Load mentors when endpoint is ready
    } catch (error) {
      console.error('Error loading user progress report:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = reportData

  const getStatusBadgeVariant = (status: CourseStatus) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'in-progress':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const exportToCSV = () => {
    if (!selectedUserId) return

    const userData = reportData.find(u => u.userId === selectedUserId)
    if (!userData) return

    const rows = [
      [
        t('csvExport.userName'),
        t('csvExport.email'),
        t('csvExport.courseTitle'),
        t('csvExport.status'),
        t('csvExport.score'),
        t('csvExport.completionDate'),
        t('csvExport.enrolledDate')
      ],
      ...userData.courses.map(course => [
        userData.userName,
        userData.userEmail,
        course.courseTitle,
        course.status,
        course.quizScore?.toString() || 'N/A',
        course.completionDate ? new Date(course.completionDate).toLocaleDateString() : 'N/A',
        course.enrollmentDate ? new Date(course.enrollmentDate).toLocaleDateString() : 'N/A'
      ])
    ]

    const csvContent = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `user-progress-${userData.userName}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const teams = Array.from(new Set(groups.map(g => g.name)))
  // TODO: Load mentors when endpoint is ready

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t('analytics.reports.userProgress.title')}</h2>
          <p className="text-muted-foreground">{t('analytics.reports.userProgress.description')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder={t('analytics.filters.searchUser')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('analytics.filters.filterByTeam')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('analytics.filters.allTeams')}</SelectItem>
              {teams.map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={mentorFilter} onValueChange={setMentorFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('analytics.filters.filterByMentor')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('analytics.filters.allMentors')}</SelectItem>
              {mentors.map(mentor => (
                <SelectItem key={mentor.id} value={mentor.id}>{mentor.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUserId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setSelectedUserId(null)}>
                {t('analytics.backToUserList')}
              </Button>
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
            </div>

            <UserProgressDetail userId={selectedUserId} viewMode={viewMode} />
          </div>
        ) : (
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {filteredUsers.map(userData => {
                  const completedCourses = userData.courses.filter(c => c.status === 'completed').length
                  const inProgressCourses = userData.courses.filter(c => c.status === 'in-progress').length

                  return (
                    <div
                      key={userData.userId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedUserId(userData.userId)}
                    >
                      <div>
                        <h3 className="font-semibold">{userData.userName}</h3>
                        <p className="text-sm text-muted-foreground">{userData.userEmail}</p>
                        {userData.teamName && (
                          <Badge variant="outline" className="mt-1">{userData.teamName}</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {completedCourses} {t('analytics.completed')} • {inProgressCourses} {t('analytics.inProgress')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {userData.courses.length} {t('analytics.totalAssigned')}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {filteredUsers.length === 0 && !loading && (
                  <p className="text-center text-muted-foreground py-8">{t('analytics.noUsersFound')}</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

function UserProgressDetail({ userId, viewMode }: { userId: string; viewMode: 'visual' | 'table' }) {
  const { t } = useTranslation()
  const { currentTenant } = useTenant()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<{
    userId: string
    userName: string
    userEmail: string
    courses: Array<{
      courseId: string
      courseTitle: string
      status: 'not-started' | 'in-progress' | 'completed'
      progress: number
      quizScore?: number
      completionDate?: string
      enrollmentDate?: string
    }>
  } | null>(null)

  useEffect(() => {
    if (currentTenant) {
      loadUserData()
    }
  }, [userId, currentTenant?.id])

  const loadUserData = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getUserProgressReport({})
      const user = data.find(u => u.userId === userId)
      setUserData(user || null)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !userData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const userProgress = userData.courses

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

  if (viewMode === 'table') {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('analytics.table.courseTitle')}</TableHead>
              <TableHead>{t('analytics.table.status')}</TableHead>
              <TableHead>{t('analytics.table.score')}</TableHead>
              <TableHead>{t('analytics.table.completionDate')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userProgress.map(course => (
              <TableRow key={course.courseId}>
                <TableCell className="font-medium">{course.courseTitle}</TableCell>
                <TableCell>{getStatusBadge(course.status)}</TableCell>
                <TableCell>
                  {course.quizScore !== undefined ? `${course.quizScore}%` : 'N/A'}
                </TableCell>
                <TableCell>
                  {course.completionDate
                    ? new Date(course.completionDate).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {userProgress.map(course => (
        <div key={course.courseId} className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold">{course.courseTitle}</h4>
            </div>
            {getStatusBadge(course.status)}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{t('analytics.progress')}</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">{t('analytics.score')}</p>
                <p className="font-semibold">
                  {course.quizScore !== undefined ? `${course.quizScore}%` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('analytics.completionDate')}</p>
                <p className="font-semibold">
                  {course.completionDate
                    ? new Date(course.completionDate).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
