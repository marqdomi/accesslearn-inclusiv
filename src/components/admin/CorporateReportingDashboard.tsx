import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Download, ChartBar, Table as TableIcon, Users, GraduationCap, Trophy, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { CompletionReport, EngagementMetrics, UserProgress, UserStats, Course } from '@/lib/types'

export function CorporateReportingDashboard() {
  const [courses] = useKV<Course[]>('courses', [])
  const [allProgress] = useKV<Record<string, UserProgress[]>>('all-user-progress', {})
  const [allStats] = useKV<Record<string, UserStats>>('all-user-stats', {})
  const [showTableView, setShowTableView] = useState(false)

  const completionReports = useMemo((): CompletionReport[] => {
    if (!courses || courses.length === 0) return []

    return courses.map(course => {
      let completed = 0
      let inProgress = 0
      let notStarted = 0
      let totalScores = 0
      let scoredUsers = 0

      Object.values(allProgress || {}).forEach(userProgressList => {
        const courseProgress = userProgressList.find(p => p.courseId === course.id)
        if (!courseProgress) {
          notStarted++
        } else if (courseProgress.status === 'completed') {
          completed++
          if (courseProgress.assessmentScore !== undefined) {
            totalScores += courseProgress.assessmentScore
            scoredUsers++
          }
        } else if (courseProgress.status === 'in-progress') {
          inProgress++
        } else {
          notStarted++
        }
      })

      const totalAssigned = Object.keys(allProgress || {}).length

      return {
        courseId: course.id,
        courseName: course.title,
        totalAssigned,
        completed,
        inProgress,
        notStarted,
        completionRate: totalAssigned > 0 ? (completed / totalAssigned) * 100 : 0,
        averageScore: scoredUsers > 0 ? totalScores / scoredUsers : undefined
      }
    })
  }, [courses, allProgress])

  const engagementMetrics = useMemo((): EngagementMetrics[] => {
    return Object.entries(allStats || {}).map(([userId, stats]) => {
      const userProgress = allProgress?.[userId] || []
      const coursesInProgress = userProgress.filter(p => p.status === 'in-progress').length
      const coursesCompleted = stats.totalCoursesCompleted || 0

      const totalDays = Math.max(1, Math.floor((Date.now() - (stats.lastActivityDate || Date.now())) / (1000 * 60 * 60 * 24)))
      const averageDailyXP = (stats.totalXP || 0) / totalDays

      return {
        userId,
        userName: `User ${userId.slice(0, 8)}`,
        averageDailyXP: Math.round(averageDailyXP),
        totalTimeSpent: 0,
        lastActiveDate: stats.lastActivityDate || 0,
        coursesInProgress,
        coursesCompleted,
        currentStreak: stats.currentStreak || 0
      }
    })
  }, [allStats, allProgress])

  const overallMetrics = useMemo(() => {
    const totalUsers = Object.keys(allStats || {}).length
    const totalCourses = courses?.length || 0
    const totalCompletions = completionReports.reduce((sum, r) => sum + r.completed, 0)
    const overallCompletionRate = completionReports.length > 0
      ? completionReports.reduce((sum, r) => sum + r.completionRate, 0) / completionReports.length
      : 0

    const totalXP = Object.values(allStats || {}).reduce((sum, stats) => sum + (stats.totalXP || 0), 0)
    const averageXP = totalUsers > 0 ? totalXP / totalUsers : 0

    return {
      totalUsers,
      totalCourses,
      totalCompletions,
      overallCompletionRate,
      averageXP: Math.round(averageXP)
    }
  }, [allStats, courses, completionReports])

  const handleExportCSV = (type: 'completion' | 'engagement') => {
    let csvContent = ''
    let filename = ''

    if (type === 'completion') {
      csvContent = 'Course Name,Total Assigned,Completed,In Progress,Not Started,Completion Rate (%),Average Score\n'
      completionReports.forEach(report => {
        csvContent += `"${report.courseName}",${report.totalAssigned},${report.completed},${report.inProgress},${report.notStarted},${report.completionRate.toFixed(1)},${report.averageScore?.toFixed(1) || 'N/A'}\n`
      })
      filename = 'course-completion-report.csv'
    } else {
      csvContent = 'User ID,User Name,Avg Daily XP,Courses In Progress,Courses Completed,Current Streak,Last Active\n'
      engagementMetrics.forEach(metric => {
        csvContent += `${metric.userId},"${metric.userName}",${metric.averageDailyXP},${metric.coursesInProgress},${metric.coursesCompleted},${metric.currentStreak},"${new Date(metric.lastActiveDate).toLocaleDateString()}"\n`
      })
      filename = 'engagement-metrics-report.csv'
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Report exported successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Reporting</h2>
          <p className="text-muted-foreground">Track progress, engagement, and course completion metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="table-toggle" className="text-sm font-medium cursor-pointer">
            {showTableView ? <TableIcon size={20} className="inline mr-2" aria-hidden="true" /> : <ChartBar size={20} className="inline mr-2" aria-hidden="true" />}
            {showTableView ? 'Table View' : 'Visual View'}
          </Label>
          <Switch
            id="table-toggle"
            checked={showTableView}
            onCheckedChange={setShowTableView}
            aria-label="Toggle between visual and table view"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-primary">{overallMetrics.totalUsers}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users size={24} className="text-primary" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-3xl font-bold text-secondary">{overallMetrics.totalCourses}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                <GraduationCap size={24} className="text-secondary" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold text-success">{overallMetrics.overallCompletionRate.toFixed(0)}%</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-success/20 flex items-center justify-center">
                <Trophy size={24} className="text-success" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg XP per User</p>
                <p className="text-3xl font-bold text-accent">{overallMetrics.averageXP}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Lightning size={24} className="text-accent" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="completion" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="completion">Course Completion</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="completion" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle>Course Completion Rates</CardTitle>
                  <CardDescription>Track how employees are progressing through assigned courses</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExportCSV('completion')} className="gap-2">
                  <Download size={16} aria-hidden="true" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showTableView ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead className="text-right">Assigned</TableHead>
                        <TableHead className="text-right">Completed</TableHead>
                        <TableHead className="text-right">In Progress</TableHead>
                        <TableHead className="text-right">Not Started</TableHead>
                        <TableHead className="text-right">Completion %</TableHead>
                        <TableHead className="text-right">Avg Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completionReports.map((report) => (
                        <TableRow key={report.courseId}>
                          <TableCell className="font-medium">{report.courseName}</TableCell>
                          <TableCell className="text-right">{report.totalAssigned}</TableCell>
                          <TableCell className="text-right text-success font-semibold">{report.completed}</TableCell>
                          <TableCell className="text-right text-secondary">{report.inProgress}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{report.notStarted}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={report.completionRate >= 75 ? 'default' : report.completionRate >= 50 ? 'secondary' : 'outline'}>
                              {report.completionRate.toFixed(0)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {report.averageScore !== undefined ? `${report.averageScore.toFixed(0)}%` : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="space-y-4">
                  {completionReports.map((report) => (
                    <div key={report.courseId} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{report.courseName}</h4>
                        <Badge variant={report.completionRate >= 75 ? 'default' : report.completionRate >= 50 ? 'secondary' : 'outline'}>
                          {report.completionRate.toFixed(0)}% Complete
                        </Badge>
                      </div>
                      <Progress value={report.completionRate} className="h-3" />
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-success">{report.completed}</p>
                          <p className="text-muted-foreground text-xs">Completed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-secondary">{report.inProgress}</p>
                          <p className="text-muted-foreground text-xs">In Progress</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-muted-foreground">{report.notStarted}</p>
                          <p className="text-muted-foreground text-xs">Not Started</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{report.averageScore?.toFixed(0) || 'N/A'}</p>
                          <p className="text-muted-foreground text-xs">Avg Score</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Monitor daily activity, XP earnings, and learning streaks</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExportCSV('engagement')} className="gap-2">
                  <Download size={16} aria-hidden="true" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Avg Daily XP</TableHead>
                      <TableHead className="text-right">Courses In Progress</TableHead>
                      <TableHead className="text-right">Courses Completed</TableHead>
                      <TableHead className="text-right">Current Streak</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {engagementMetrics.slice(0, 20).map((metric) => (
                      <TableRow key={metric.userId}>
                        <TableCell className="font-medium">{metric.userName}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{metric.averageDailyXP} XP</Badge>
                        </TableCell>
                        <TableCell className="text-right text-secondary font-semibold">{metric.coursesInProgress}</TableCell>
                        <TableCell className="text-right text-success font-semibold">{metric.coursesCompleted}</TableCell>
                        <TableCell className="text-right">
                          {metric.currentStreak > 0 ? (
                            <Badge variant="default">{metric.currentStreak} days</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {metric.lastActiveDate ? new Date(metric.lastActiveDate).toLocaleDateString() : 'Never'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {engagementMetrics.length > 20 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Showing 20 of {engagementMetrics.length} users
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
