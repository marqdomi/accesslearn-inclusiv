import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useKV } from '@github/spark/hooks'
import { UserProgress, UserStats, UserGroup } from '@/lib/types'
import { DownloadSimple, ChartBar, Table as TableIcon } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

export function TeamReport() {
  const { t } = useTranslation()
  const [users] = useKV<any[]>('users', [])
  const [allUserProgress] = useKV<Record<string, UserProgress[]>>('user-progress-all', {})
  const [allUserStats] = useKV<Record<string, UserStats>>('user-stats-all', {})
  const [groups] = useKV<UserGroup[]>('groups', [])

  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual')

  const teams = Array.from(new Set((users || []).filter(u => u.department).map(u => u.department)))

  const exportToCSV = () => {
    if (!selectedTeam) return

    const teamMembers = (users || []).filter(u => u.department === selectedTeam)

    const rows = [
      [
        t('csvExport.userName'),
        t('csvExport.email'),
        t('csvExport.completionRate'),
        t('csvExport.totalXP'),
        t('csvExport.coursesCompleted')
      ],
      ...teamMembers.map(user => {
        const userProgress = (allUserProgress || {})[user.id] || []
        const userStats = (allUserStats || {})[user.id]
        const completedCourses = userProgress.filter(p => p.status === 'completed').length
        const completionRate = userProgress.length > 0 ? Math.round((completedCourses / userProgress.length) * 100) : 0

        return [
          user?.displayName || user?.name || '',
          user?.email || '',
          `${completionRate}%`,
          (userStats?.totalXP || 0).toString(),
          completedCourses.toString()
        ]
      })
    ]

    const csvContent = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `team-report-${selectedTeam}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const teamMembers = selectedTeam ? (users || []).filter(u => u.department === selectedTeam) : []
  
  const teamStats = teamMembers.length > 0 ? (() => {
    let totalCompletionRate = 0
    let totalXP = 0

    teamMembers.forEach(user => {
      const userProgress = (allUserProgress || {})[user.id] || []
      const userStats = (allUserStats || {})[user.id]
      const completedCourses = userProgress.filter(p => p.status === 'completed').length
      const completionRate = userProgress.length > 0 ? (completedCourses / userProgress.length) * 100 : 0
      totalCompletionRate += completionRate
      totalXP += userStats?.totalXP || 0
    })

    return {
      averageCompletionRate: teamMembers.length > 0 ? Math.round(totalCompletionRate / teamMembers.length) : 0,
      totalXP,
      memberCount: teamMembers.length
    }
  })() : null

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t('analytics.reports.team.title')}</h2>
          <p className="text-muted-foreground">{t('analytics.reports.team.description')}</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder={t('analytics.filters.selectTeam')} />
            </SelectTrigger>
            <SelectContent>
              {teams.map(team => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTeam && (
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

        {selectedTeam && teamStats && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.averageCompletionRate')}</p>
                <p className="text-2xl font-bold mt-1">{teamStats.averageCompletionRate}%</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.totalXP')}</p>
                <p className="text-2xl font-bold mt-1">{teamStats.totalXP.toLocaleString()}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">{t('analytics.teamMembers')}</p>
                <p className="text-2xl font-bold mt-1">{teamStats.memberCount}</p>
              </Card>
            </div>

            {viewMode === 'table' ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('analytics.table.userName')}</TableHead>
                      <TableHead>{t('analytics.table.completionRate')}</TableHead>
                      <TableHead>{t('analytics.table.totalXP')}</TableHead>
                      <TableHead>{t('analytics.table.coursesCompleted')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map(user => {
                      const userProgress = (allUserProgress || {})[user.id] || []
                      const userStats = (allUserStats || {})[user.id]
                      const completedCourses = userProgress.filter(p => p.status === 'completed').length
                      const completionRate = userProgress.length > 0 ? Math.round((completedCourses / userProgress.length) * 100) : 0

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.displayName || user.name}</TableCell>
                          <TableCell>{completionRate}%</TableCell>
                          <TableCell>{(userStats?.totalXP || 0).toLocaleString()}</TableCell>
                          <TableCell>{completedCourses}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="space-y-2">
                {teamMembers.map(user => {
                  const userProgress = (allUserProgress || {})[user.id] || []
                  const userStats = (allUserStats || {})[user.id]
                  const completedCourses = userProgress.filter(p => p.status === 'completed').length
                  const completionRate = userProgress.length > 0 ? Math.round((completedCourses / userProgress.length) * 100) : 0

                  return (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{user.displayName || user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{(userStats?.totalXP || 0).toLocaleString()} XP</p>
                          <p className="text-xs text-muted-foreground">{t('analytics.level')} {userStats?.level || 1}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{t('analytics.completionRate')}</span>
                          <span className="font-medium">{completionRate}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {completedCourses} {t('analytics.coursesCompleted')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {!selectedTeam && (
          <p className="text-center text-muted-foreground py-8">{t('analytics.selectTeamPrompt')}</p>
        )}
      </div>
    </Card>
  )
}
