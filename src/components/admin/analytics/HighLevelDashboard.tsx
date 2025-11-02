import { Card } from '@/components/ui/card'
import { useKV } from '@github/spark/hooks'
import { CourseStructure, UserProgress, UserStats, UserGroup, QuizAttempt } from '@/lib/types'
import { Users, ChartBar, Trophy, BookOpen, CheckCircle } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'
import { motion } from 'framer-motion'

export function HighLevelDashboard() {
  const { t } = useTranslation()
  const [users] = useKV<any[]>('users', [])
  const [courses] = useKV<CourseStructure[]>('courses', [])
  const [allUserProgress] = useKV<Record<string, UserProgress[]>>('user-progress-all', {})
  const [allUserStats] = useKV<Record<string, UserStats>>('user-stats-all', {})
  const [groups] = useKV<UserGroup[]>('groups', [])
  const [quizAttempts] = useKV<QuizAttempt[]>('quiz-attempts', [])

  const totalActiveUsers = (users || []).filter(u => u.role !== 'admin').length
  const totalSeats = 200

  const platformCompletionRate = (() => {
    let totalAssignedCourses = 0
    let totalCompletedCourses = 0

    Object.values(allUserProgress || {}).forEach(userProgressList => {
      userProgressList.forEach(progress => {
        totalAssignedCourses++
        if (progress.status === 'completed') {
          totalCompletedCourses++
        }
      })
    })

    return totalAssignedCourses > 0 ? Math.round((totalCompletedCourses / totalAssignedCourses) * 100) : 0
  })()

  const topEngagedUsers = Object.entries(allUserStats || {})
    .map(([userId, stats]) => {
      const user = (users || []).find(u => u.id === userId)
      return {
        userId,
        userName: user?.displayName || user?.name || 'Unknown',
        xp: stats.totalXP || 0
      }
    })
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5)

  const topPopularCourses = (courses || [])
    .filter(course => course.published)
    .map(course => {
      const enrollmentCount = Object.values(allUserProgress || {}).filter(progressList =>
        progressList.some(p => p.courseId === course.id)
      ).length
      return {
        courseId: course.id,
        courseTitle: course.title,
        enrollmentCount
      }
    })
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
    .slice(0, 5)

  const complianceCourses = (courses || [])
    .filter(course => course.published && course.category === 'Compliance')
    .map(course => {
      let totalAssigned = 0
      let totalCompleted = 0

      Object.values(allUserProgress || {}).forEach(progressList => {
        const courseProgress = progressList.find(p => p.courseId === course.id)
        if (courseProgress) {
          totalAssigned++
          if (courseProgress.status === 'completed') {
            totalCompleted++
          }
        }
      })

      return {
        courseId: course.id,
        courseTitle: course.title,
        totalAssigned,
        totalCompleted,
        completionRate: totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0
      }
    })
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
                <p className="text-3xl font-bold mt-2">{(courses || []).filter(c => c.published).length}</p>
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
                  {Object.values(allUserStats || {}).reduce((sum, stats) => sum + (stats.totalXP || 0), 0).toLocaleString()}
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
                  <span className="text-sm font-semibold text-primary">{user.xp.toLocaleString()} XP</span>
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
                    {course.enrollmentCount} {t('analytics.enrolled')}
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
