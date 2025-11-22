import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'
import { DownloadSimple, ChartBar, Table as TableIcon } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

export function TeamReport() {
  const { t } = useTranslation()
  const { currentTenant } = useTenant()
  const [loading, setLoading] = useState(true)
  const [teamReports, setTeamReports] = useState<Array<{
    teamId: string
    teamName: string
    memberCount: number
    averageCompletionRate: number
    totalXP: number
    members: Array<{
      userId: string
      userName: string
      userEmail: string
      completionRate: number
      totalXP: number
      coursesCompleted: number
    }>
  }>>([])
  const [groups, setGroups] = useState<any[]>([])

  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual')

  useEffect(() => {
    if (currentTenant) {
      loadData()
    }
  }, [currentTenant?.id, selectedTeam])

  const loadData = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const reports = await ApiService.getTeamReport(selectedTeam || undefined)
      setTeamReports(reports)

      const groupsData = await ApiService.getGroups(currentTenant.id)
      setGroups(groupsData)
    } catch (error) {
      console.error('Error loading team report:', error)
    } finally {
      setLoading(false)
    }
  }

  const teams = groups.map(g => ({ id: g.id, name: g.name }))

  const exportToCSV = () => {
    const teamReport = teamReports.find(t => t.teamId === selectedTeam || (!selectedTeam && t.teamId))
    if (!teamReport) return

    const rows = [
      [
        t('csvExport.userName'),
        t('csvExport.email'),
        t('csvExport.completionRate'),
        t('csvExport.totalXP'),
        t('csvExport.coursesCompleted')
      ],
      ...teamReport.members.map(member => [
        member.userName,
        member.userEmail,
        `${member.completionRate}%`,
        member.totalXP.toString(),
        member.coursesCompleted.toString()
      ])
    ]

    const csvContent = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `team-report-${teamReport.teamName}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const currentTeamReport = teamReports.find(t => t.teamId === selectedTeam) || (teamReports.length > 0 ? teamReports[0] : null)

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
              <SelectItem value="">{t('analytics.filters.allTeams')}</SelectItem>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {currentTeamReport && (
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

        {currentTeamReport ? (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">{t('analytics.averageCompletionRate')}</p>
                    <p className="text-2xl font-bold mt-1">{currentTeamReport.averageCompletionRate}%</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">{t('analytics.totalXP')}</p>
                    <p className="text-2xl font-bold mt-1">{currentTeamReport.totalXP.toLocaleString()}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">{t('analytics.teamMembers')}</p>
                    <p className="text-2xl font-bold mt-1">{currentTeamReport.memberCount}</p>
                  </Card>
                </div>

                <TeamReportDetail 
                  teamReport={currentTeamReport}
                  viewMode={viewMode}
                />
              </>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">{t('analytics.selectTeamPrompt')}</p>
        )}
      </div>
    </Card>
  )
}
