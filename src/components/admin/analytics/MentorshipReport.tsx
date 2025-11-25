import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'
import { DownloadSimple, ChartBar, Table as TableIcon } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

export function MentorshipReport() {
  const { t } = useTranslation()
  const { currentTenant } = useTenant()
  const [loading, setLoading] = useState(true)
  const [mentorData, setMentorData] = useState<Array<{
    mentorId: string
    mentorName: string
    mentorEmail: string
    menteeCount: number
    averageMenteeCompletionRate: number
    totalMenteeXP: number
    mentees: Array<{
      menteeId: string
      menteeName: string
      menteeEmail: string
      completionRate: number
      coursesCompleted: number
      totalXP: number
    }>
  }>>([])

  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual')

  useEffect(() => {
    if (currentTenant) {
      loadMentorshipReport()
    }
  }, [currentTenant?.id])

  const loadMentorshipReport = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getMentorshipReport()
      setMentorData(data)
    } catch (error) {
      console.error('Error loading mentorship report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const rows = [
      ['Mentor Name', 'Mentor Email', 'Mentee Count', 'Avg Mentee Completion Rate', 'Total Mentee XP'],
      ...mentorData.map(mentor => [
        mentor.mentorName,
        mentor.mentorEmail,
        mentor.menteeCount.toString(),
        `${mentor.averageMenteeCompletionRate}%`,
        mentor.totalMenteeXP.toString()
      ])
    ]

    const csvContent = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mentorship-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('analytics.reports.mentorship.title')}</h2>
            <p className="text-muted-foreground">{t('analytics.reports.mentorship.description')}</p>
          </div>

          {mentorData.length > 0 && (
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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : mentorData.length > 0 ? (
          viewMode === 'table' ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('analytics.table.mentorName')}</TableHead>
                    <TableHead>{t('analytics.table.menteeCount')}</TableHead>
                    <TableHead>{t('analytics.table.avgCompletionRate')}</TableHead>
                    <TableHead>{t('analytics.table.coursesCompleted')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentorData.map(mentor => (
                    <TableRow key={mentor.mentorId}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{mentor.mentorName}</p>
                          <p className="text-xs text-muted-foreground">{mentor.mentorEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{mentor.menteeCount}</TableCell>
                      <TableCell>{mentor.averageMenteeCompletionRate}%</TableCell>
                      <TableCell>
                        {mentor.mentees.reduce((sum, m) => sum + m.coursesCompleted, 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-4">
              {mentorData.map(mentor => (
                <div key={mentor.mentorId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{mentor.mentorName}</h3>
                      <p className="text-sm text-muted-foreground">{mentor.mentorEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{mentor.menteeCount}</p>
                      <p className="text-xs text-muted-foreground">{t('analytics.mentees')}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t('analytics.avgMenteeCompletion')}</p>
                      <p className="text-xl font-bold">{mentor.averageMenteeCompletionRate}%</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t('analytics.totalCoursesCompleted')}</p>
                      <p className="text-xl font-bold">
                        {mentor.mentees.reduce((sum, m) => sum + m.coursesCompleted, 0)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">{t('analytics.mentees')}</h4>
                    <div className="space-y-2">
                      {mentor.mentees.map(mentee => (
                        <div key={mentee.menteeId} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">{mentee.menteeName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {mentee.coursesCompleted} {t('analytics.completed')}
                            </span>
                            <span className="text-xs font-medium">{mentee.completionRate}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <p className="text-center text-muted-foreground py-8">{t('analytics.noMentorships')}</p>
        )}
      </div>
    </Card>
  )
}
