import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'
import { Users, ChartBar, Trophy, BookOpen, CheckCircle } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'
import { motion } from 'framer-motion'

export function HighLevelDashboard() {
  const { t } = useTranslation()
  const { currentTenant } = useTenant()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{
    totalActiveUsers: number
    totalSeats: number
    platformCompletionRate: number
    totalPublishedCourses: number
    totalXPAwarded: number
    topEngagedUsers: Array<{
      userId: string
      userName: string
      xp: number
      level: number
    }>
    topPopularCourses: Array<{
      courseId: string
      courseTitle: string
      enrollments: number
      completions: number
    }>
    complianceStatus: {
      totalMandatory: number
      completed: number
      inProgress: number
      notStarted: number
    }
  } | null>(null)

  useEffect(() => {
    if (currentTenant) {
      loadStats()
    }
  }, [currentTenant?.id])

  const loadStats = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getHighLevelStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading high-level stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const { 
    totalActiveUsers, 
    totalSeats, 
    platformCompletionRate, 
    totalPublishedCourses,
    totalXPAwarded,
    topEngagedUsers,
    topPopularCourses,
    complianceStatus
  } = stats

  const complianceCourses = topPopularCourses
    .filter(course => course.enrollments > 0)
    .map(course => ({
      courseId: course.courseId,
      courseTitle: course.courseTitle,
      totalAssigned: course.enrollments,
      totalCompleted: course.completions,
      completionRate: course.enrollments > 0 
        ? Math.round((course.completions / course.enrollments) * 100) 
        : 0
    }))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('analytics.metrics.activeUsers')}</p>
                <p className="text-3xl font-bold mt-2">
                  {totalActiveUsers} <span className="text-xl text-muted-foreground">/ {totalSeats}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((totalActiveUsers / totalSeats) * 100)}% {t('analytics.metrics.seatsOccupied')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Users size={24} className="text-primary" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('analytics.metrics.completionRate')}</p>
                <p className="text-3xl font-bold mt-2">{platformCompletionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">{t('analytics.metrics.averageCompletion')}</p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle size={24} className="text-success" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('analytics.metrics.totalCourses')}</p>
                <p className="text-3xl font-bold mt-2">{totalPublishedCourses}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('analytics.metrics.published')}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/10">
                <BookOpen size={24} className="text-secondary" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('analytics.metrics.totalXP')}</p>
                <p className="text-3xl font-bold mt-2">
                  {totalXPAwarded.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('analytics.metrics.platformWide')}</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/10">
                <Trophy size={24} className="text-accent" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-primary" />
            {t('analytics.widgets.topEngagedUsers')}
          </h3>
          {topEngagedUsers.length > 0 ? (
            <div className="space-y-3">
              {topEngagedUsers.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-muted text-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{user.userName}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{user.xp.toLocaleString()} XP • Nv. {user.level}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('analytics.noData')}</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-secondary" />
            {t('analytics.widgets.topPopularCourses')}
          </h3>
          {topPopularCourses.length > 0 ? (
            <div className="space-y-3">
              {topPopularCourses.map((course, index) => (
                <div key={course.courseId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary/20 text-secondary font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{course.courseTitle}</span>
                  </div>
                  <span className="text-sm font-semibold text-secondary">
                    {course.enrollments} {t('analytics.enrolled')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('analytics.noData')}</p>
          )}
        </Card>
      </div>

      {complianceCourses.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-success" />
            {t('analytics.widgets.complianceAtGlance')}
          </h3>
          <div className="space-y-4">
            {complianceCourses.map(course => (
              <div key={course.courseId}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{course.courseTitle}</span>
                  <span className="text-sm font-semibold">
                    {course.completionRate}% {t('analytics.complete')}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      course.completionRate >= 90 ? 'bg-success' :
                      course.completionRate >= 70 ? 'bg-accent' :
                      'bg-destructive'
                    }`}
                    style={{ width: `${course.completionRate}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {course.totalCompleted} / {course.totalAssigned} {t('analytics.usersCompleted')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
