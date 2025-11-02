import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useKV } from '@github/spark/hooks'
import { CourseStructure, UserProgress, CourseStatus } from '@/lib/types'
import { MagnifyingGlass, DownloadSimple, ChartBar, Table as TableIcon } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

export function UserProgressReport() {
  const { t } = useTranslation()
  const [users] = useKV<any[]>('users', [])
  const [courses] = useKV<CourseStructure[]>('courses', [])
  const [allUserProgress] = useKV<Record<string, UserProgress[]>>('user-progress-all', {})
  const [groups] = useKV<any[]>('groups', [])
  const [mentorshipPairings] = useKV<any[]>('mentorship-pairings', [])

  const [searchTerm, setSearchTerm] = useState('')
  const [teamFilter, setTeamFilter] = useState('all')
  const [mentorFilter, setMentorFilter] = useState('all')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual')

  const filteredUsers = (users || [])
    .filter(u => u.role !== 'admin')
    .filter(u => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        return (
          (u.displayName || u.name || '').toLowerCase().includes(search) ||
          (u.email || '').toLowerCase().includes(search)
        )
      }
      return true
    })
    .filter(u => {
      if (teamFilter !== 'all') {
        return u.department === teamFilter
      }
      return true
    })
    .filter(u => {
      if (mentorFilter !== 'all') {
        const pairing = (mentorshipPairings || []).find(p => p.menteeId === u.id)
        return pairing?.mentorId === mentorFilter
      }
      return true
    })

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

    const user = (users || []).find(u => u.id === selectedUserId)
    const userProgress = (allUserProgress || {})[selectedUserId] || []

    const rows = [
      ['User Name', 'Email', 'Course Title', 'Status', 'Score', 'Completion Date', 'Enrolled Date'],
      ...userProgress.map(progress => {
        const course = (courses || []).find(c => c.id === progress.courseId)
        return [
          user?.displayName || user?.name || '',
          user?.email || '',
          course?.title || 'Unknown Course',
          progress.status,
          progress.assessmentScore?.toString() || 'N/A',
          progress.status === 'completed' && progress.lastAccessed
            ? new Date(progress.lastAccessed).toLocaleDateString()
            : 'N/A',
          new Date(progress.lastAccessed || Date.now()).toLocaleDateString()
        ]
      })
    ]

    const csvContent = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `user-progress-${user?.displayName || 'report'}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const teams = Array.from(new Set((users || []).filter(u => u.department).map(u => u.department)))
  const mentors = (mentorshipPairings || []).map(p => {
    const mentor = (users || []).find(u => u.id === p.mentorId)
    return {
      id: p.mentorId,
      name: mentor?.displayName || mentor?.name || 'Unknown'
    }
  }).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)

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
            {filteredUsers.map(user => {
              const userProgress = (allUserProgress || {})[user.id] || []
              const completedCourses = userProgress.filter(p => p.status === 'completed').length
              const inProgressCourses = userProgress.filter(p => p.status === 'in-progress').length

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div>
                    <h3 className="font-semibold">{user.displayName || user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.department && (
                      <Badge variant="outline" className="mt-1">{user.department}</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {completedCourses} {t('analytics.completed')} • {inProgressCourses} {t('analytics.inProgress')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userProgress.length} {t('analytics.totalAssigned')}
                    </p>
                  </div>
                </div>
              )
            })}
            {filteredUsers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">{t('analytics.noUsersFound')}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

function UserProgressDetail({ userId, viewMode }: { userId: string; viewMode: 'visual' | 'table' }) {
  const { t } = useTranslation()
  const [users] = useKV<any[]>('users', [])
  const [courses] = useKV<CourseStructure[]>('courses', [])
  const [allUserProgress] = useKV<Record<string, UserProgress[]>>('user-progress-all', {})

  const user = (users || []).find(u => u.id === userId)
  const userProgress = (allUserProgress || {})[userId] || []

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
            {userProgress.map(progress => {
              const course = (courses || []).find(c => c.id === progress.courseId)
              return (
                <TableRow key={progress.courseId}>
                  <TableCell className="font-medium">{course?.title || 'Unknown Course'}</TableCell>
                  <TableCell>{getStatusBadge(progress.status)}</TableCell>
                  <TableCell>
                    {progress.assessmentScore !== undefined ? `${progress.assessmentScore}%` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {progress.status === 'completed' && progress.lastAccessed
                      ? new Date(progress.lastAccessed).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {userProgress.map(progress => {
        const course = (courses || []).find(c => c.id === progress.courseId)
        const completedModules = progress.completedModules?.length || 0
        const totalModules = course?.modules?.length || 1
        const progressPercent = Math.round((completedModules / totalModules) * 100)

        return (
          <div key={progress.courseId} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold">{course?.title || 'Unknown Course'}</h4>
                <p className="text-sm text-muted-foreground">{course?.category}</p>
              </div>
              {getStatusBadge(progress.status)}
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

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">{t('analytics.score')}</p>
                  <p className="font-semibold">
                    {progress.assessmentScore !== undefined ? `${progress.assessmentScore}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('analytics.completionDate')}</p>
                  <p className="font-semibold">
                    {progress.status === 'completed' && progress.lastAccessed
                      ? new Date(progress.lastAccessed).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
