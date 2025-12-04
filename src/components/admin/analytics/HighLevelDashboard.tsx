import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'
import { Users, BookOpen, CheckCircle, Trophy, Clock, TrendingUp, Activity, Calendar, Award, AlertTriangle, Users2 } from 'lucide-react'
import { EngagementTrendChart } from './EngagementTrendChart'
import { ProgressDistributionChart } from './ProgressDistributionChart'
import { CourseCompletionRateChart } from './CourseCompletionRateChart'
import { MonthlyCompletionTrendChart } from './MonthlyCompletionTrendChart'
import { ScoreDistributionChart } from './ScoreDistributionChart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

export function HighLevelDashboard() {
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
      certificatesIssued: number
      certificatesRequired: number
    }
  } | null>(null)
  const [engagementTrendData, setEngagementTrendData] = useState<Array<{
    week: string
    xpGained: number
    activeUsers: number
  }>>([])
  const [progressDistributionData, setProgressDistributionData] = useState<Array<{
    range: string
    count: number
    percentage: number
  }>>([])
  const [roiMetrics, setRoiMetrics] = useState<{
    totalTrainingHours: number
    averageTimePerCourse: number
    totalCompletedCourses: number
    averageCompletionTime: number
  } | null>(null)
  const [engagementMetrics, setEngagementMetrics] = useState<{
    currentMonthActiveUsers: number
    previousMonthActiveUsers: number
    retentionRate: number
    averageActiveDaysPerUser: number
    peakActivityDay?: string
  } | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    averageCourseScore: number
    averageQuizPassRate: number
    topPerformingCourses: Array<{
      courseId: string
      courseTitle: string
      averageScore: number
      completionRate: number
    }>
    underperformingCourses: Array<{
      courseId: string
      courseTitle: string
      averageScore: number
      completionRate: number
    }>
  } | null>(null)
  const [teamComparisons, setTeamComparisons] = useState<Array<{
    teamId: string
    teamName: string
    completionRate: number
    totalXP: number
    averageScore: number
    memberCount: number
  }>>([])
  const [courseCompletionRates, setCourseCompletionRates] = useState<Array<{
    courseId: string
    courseTitle: string
    completionRate: number
    enrollments: number
    completions: number
  }>>([])
  const [monthlyCompletions, setMonthlyCompletions] = useState<Array<{
    month: string
    completions: number
    enrollments: number
    completionRate: number
  }>>([])
  const [scoreDistribution, setScoreDistribution] = useState<Array<{
    range: string
    count: number
    percentage: number
  }>>([])

  useEffect(() => {
    if (currentTenant) {
      loadStats()
    }
  }, [currentTenant?.id])

  const loadStats = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)
      
      // Load core stats first (required)
      try {
        const statsData = await ApiService.getHighLevelStats()
        setStats(statsData)
      } catch (error) {
        console.error('Error loading high-level stats:', error)
        // Continue loading other metrics even if core stats fail
      }

      // Load additional metrics in parallel with individual error handling
      // Use Promise.allSettled to ensure all promises complete even if some fail
      await Promise.allSettled([
        ApiService.getHistoricalEngagementData(8).then(setEngagementTrendData).catch(err => {
          console.warn('Error loading engagement history:', err)
          setEngagementTrendData([])
        }),
        ApiService.getRealProgressDistribution().then(setProgressDistributionData).catch(err => {
          console.warn('Error loading progress distribution:', err)
          setProgressDistributionData([])
        }),
        ApiService.getROIMetrics().then(setRoiMetrics).catch(err => {
          console.warn('Error loading ROI metrics:', err)
          setRoiMetrics(null)
        }),
        ApiService.getEngagementMetrics().then(setEngagementMetrics).catch(err => {
          console.warn('Error loading engagement metrics:', err)
          setEngagementMetrics(null)
        }),
        ApiService.getPerformanceMetrics().then(setPerformanceMetrics).catch(err => {
          console.warn('Error loading performance metrics:', err)
          setPerformanceMetrics(null)
        }),
        ApiService.getTeamComparisons().then(setTeamComparisons).catch(err => {
          console.warn('Error loading team comparisons:', err)
          setTeamComparisons([])
        }),
        ApiService.getCourseCompletionRates().then(setCourseCompletionRates).catch(err => {
          console.warn('Error loading course completion rates:', err)
          setCourseCompletionRates([])
        }),
        ApiService.getMonthlyCompletionTrends(6).then(setMonthlyCompletions).catch(err => {
          console.warn('Error loading monthly completions:', err)
          setMonthlyCompletions([])
        }),
        ApiService.getScoreDistribution().then(setScoreDistribution).catch(err => {
          console.warn('Error loading score distribution:', err)
          setScoreDistribution([])
        })
      ])
    } catch (error) {
      console.error('Error loading analytics:', error)
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
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {totalActiveUsers} <span className="text-base md:text-lg text-muted-foreground">/ {totalSeats}</span>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              {Math.round((totalActiveUsers / totalSeats) * 100)}% ocupados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Tasa Finalización</CardTitle>
            <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{platformCompletionRate}%</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Promedio</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Cursos Totales</CardTitle>
            <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{totalPublishedCourses}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Publicados</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">XP Total</CardTitle>
            <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {totalXPAwarded.toLocaleString()}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Plataforma</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="p-4 md:p-6">
          <h3 className="font-semibold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
            <Trophy size={18} className="md:w-5 md:h-5 text-primary flex-shrink-0" />
            Usuarios Más Comprometidos
          </h3>
          {topEngagedUsers.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {topEngagedUsers.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm flex-shrink-0 ${index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                          'bg-muted text-foreground'
                      }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm md:text-base truncate">{user.userName}</span>
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-primary flex-shrink-0 ml-2">
                    {user.xp.toLocaleString()} XP • Nv. {user.level}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground">No hay datos disponibles</p>
          )}
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="font-semibold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
            <BookOpen size={18} className="md:w-5 md:h-5 text-secondary flex-shrink-0" />
            Cursos Más Populares
          </h3>
          {topPopularCourses.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {topPopularCourses.map((course, index) => (
                <div key={course.courseId} className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center bg-secondary/20 text-secondary font-bold text-xs md:text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm md:text-base truncate">{course.courseTitle}</span>
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-secondary flex-shrink-0 ml-2">
                    {course.enrollments} inscritos
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground">No hay datos disponibles</p>
          )}
        </Card>
      </div>

      {/* Engagement Metrics */}
      {engagementMetrics && (
        <Card className="p-4 md:p-6">
          <h3 className="font-semibold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
            <Activity size={18} className="md:w-5 md:h-5 text-primary flex-shrink-0" />
            Métricas de Engagement
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Usuarios Activos Este Mes</p>
              <p className="text-xl font-bold">{engagementMetrics.currentMonthActiveUsers}</p>
              {engagementMetrics.previousMonthActiveUsers > 0 && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {engagementMetrics.currentMonthActiveUsers >= engagementMetrics.previousMonthActiveUsers ? '+' : ''}
                  {engagementMetrics.currentMonthActiveUsers - engagementMetrics.previousMonthActiveUsers} vs mes anterior
                </p>
              )}
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Tasa de Retención</p>
              <p className="text-xl font-bold">{engagementMetrics.retentionRate}%</p>
              <p className="text-[10px] text-muted-foreground mt-1">Usuarios que volvieron</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Días Promedio Activos</p>
              <p className="text-xl font-bold">{engagementMetrics.averageActiveDaysPerUser}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Por usuario</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Pico de Actividad</p>
              <p className="text-xl font-bold">
                {engagementMetrics.peakActivityDay 
                  ? new Date(engagementMetrics.peakActivityDay).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                  : 'N/A'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Día con más actividad</p>
            </div>
          </div>
        </Card>
      )}

      {/* ROI Metrics */}
      {roiMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Horas Totales</CardTitle>
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {roiMetrics.totalTrainingHours.toLocaleString()}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Capacitación completada</p>
            </CardContent>
          </Card>

          <Card className="bg-teal-50/50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Tiempo Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-teal-600 dark:text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {roiMetrics.averageTimePerCourse}h
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Por curso</p>
            </CardContent>
          </Card>

          <Card className="bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Cursos Completados</CardTitle>
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-rose-600 dark:text-rose-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {roiMetrics.totalCompletedCourses}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Total</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Tiempo Promedio</CardTitle>
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {roiMetrics.averageCompletionTime}d
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Para completar</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="p-4 md:p-6">
            <h3 className="font-semibold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
              <Award size={18} className="md:w-5 md:h-5 text-success flex-shrink-0" />
              Cursos con Mejor Rendimiento
            </h3>
            {performanceMetrics.topPerformingCourses.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {performanceMetrics.topPerformingCourses.map((course, index) => (
                  <div key={course.courseId} className="p-2.5 md:p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm md:text-base truncate">{course.courseTitle}</span>
                      <span className="text-xs md:text-sm font-semibold text-success flex-shrink-0 ml-2">
                        {course.averageScore}% • {course.completionRate}%
                      </span>
                    </div>
                    <div className="flex gap-2 text-[10px] md:text-xs text-muted-foreground">
                      <span>Puntuación: {course.averageScore}%</span>
                      <span>•</span>
                      <span>Finalización: {course.completionRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs md:text-sm text-muted-foreground">No hay datos disponibles</p>
            )}
          </Card>

          <Card className="p-4 md:p-6">
            <h3 className="font-semibold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
              <AlertTriangle size={18} className="md:w-5 md:h-5 text-destructive flex-shrink-0" />
              Cursos que Necesitan Atención
            </h3>
            {performanceMetrics.underperformingCourses.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {performanceMetrics.underperformingCourses.map((course, index) => (
                  <div key={course.courseId} className="p-2.5 md:p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm md:text-base truncate">{course.courseTitle}</span>
                      <span className="text-xs md:text-sm font-semibold text-destructive flex-shrink-0 ml-2">
                        {course.averageScore}% • {course.completionRate}%
                      </span>
                    </div>
                    <div className="flex gap-2 text-[10px] md:text-xs text-muted-foreground">
                      <span>Puntuación: {course.averageScore}%</span>
                      <span>•</span>
                      <span>Finalización: {course.completionRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs md:text-sm text-muted-foreground">No hay cursos con problemas</p>
            )}
          </Card>
        </div>
      )}

      {/* Performance Summary Cards */}
      {performanceMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
          <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Puntuación Promedio</CardTitle>
              <Award className="h-4 w-4 md:h-5 md:w-5 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{performanceMetrics.averageCourseScore}%</div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">En todos los cursos</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Tasa de Aprobación</CardTitle>
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{performanceMetrics.averageQuizPassRate}%</div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">En quizzes</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Team Comparisons */}
      {teamComparisons.length > 0 && (
        <Card className="p-4 md:p-6">
          <h3 className="font-semibold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
            <Users2 size={18} className="md:w-5 md:h-5 text-primary flex-shrink-0" />
            Comparativa por Equipo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamComparisons.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="teamName"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Tasa de Finalización (%)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number, name: string, props: any) => {
                  if (name === 'completionRate') {
                    return [`${value}%`, 'Tasa de Finalización']
                  }
                  return [value, name]
                }}
              />
              <Legend />
              <Bar
                dataKey="completionRate"
                name="Tasa de Finalización"
                radius={[8, 8, 0, 0]}
                fill="hsl(var(--primary))"
              >
                {teamComparisons.slice(0, 10).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(var(--primary))`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamComparisons.slice(0, 6).map((team) => (
              <div key={team.teamId} className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium text-sm mb-2 truncate">{team.teamName}</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Finalización:</span>
                    <span className="font-semibold text-foreground">{team.completionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>XP Total:</span>
                    <span className="font-semibold text-foreground">{team.totalXP.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Puntuación:</span>
                    <span className="font-semibold text-foreground">{team.averageScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Miembros:</span>
                    <span className="font-semibold text-foreground">{team.memberCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Chart Visualizations */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <EngagementTrendChart data={engagementTrendData} />
        <ProgressDistributionChart data={progressDistributionData} />
      </div>

      {/* Additional Charts */}
      {courseCompletionRates.length > 0 && (
        <CourseCompletionRateChart data={courseCompletionRates} />
      )}

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        {monthlyCompletions.length > 0 && (
          <MonthlyCompletionTrendChart data={monthlyCompletions} />
        )}
        {scoreDistribution.length > 0 && (
          <ScoreDistributionChart data={scoreDistribution} />
        )}
      </div>

      {/* Compliance Section */}
      {stats && (
        <Card className="p-4 md:p-6">
          <h3 className="font-semibold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
            <CheckCircle size={18} className="md:w-5 md:h-5 text-success flex-shrink-0" />
            Cumplimiento de un Vistazo
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Cursos Obligatorios</p>
              <p className="text-xl font-bold">{stats.complianceStatus.totalMandatory}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Total asignados</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50/50 dark:bg-green-950/20">
              <p className="text-xs text-muted-foreground mb-1">Completados</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.complianceStatus.completed}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {stats.complianceStatus.totalMandatory > 0 
                  ? Math.round((stats.complianceStatus.completed / stats.complianceStatus.totalMandatory) * 100)
                  : 0}% cumplimiento
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50/50 dark:bg-yellow-950/20">
              <p className="text-xs text-muted-foreground mb-1">En Progreso</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.complianceStatus.inProgress}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Usuarios activos</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20">
              <p className="text-xs text-muted-foreground mb-1">No Iniciados</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.complianceStatus.notStarted}</p>
              <p className="text-[10px] text-muted-foreground mt-1">En riesgo</p>
            </div>
          </div>
          {stats.complianceStatus.certificatesIssued > 0 && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-1">Certificados Emitidos</p>
              <p className="text-lg font-bold">
                {stats.complianceStatus.certificatesIssued} / {stats.complianceStatus.certificatesRequired}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {stats.complianceStatus.certificatesRequired > 0
                  ? Math.round((stats.complianceStatus.certificatesIssued / stats.complianceStatus.certificatesRequired) * 100)
                  : 0}% de cursos completados tienen certificado
              </p>
            </div>
          )}
          {complianceCourses.length > 0 && (
            <div className="mt-4 space-y-3 md:space-y-4">
              <h4 className="text-xs md:text-sm font-semibold text-muted-foreground">Por Curso:</h4>
              {complianceCourses.map(course => (
                <div key={course.courseId}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                    <span className="font-medium text-sm md:text-base truncate">{course.courseTitle}</span>
                    <span className="text-xs md:text-sm font-semibold flex-shrink-0">
                      {course.completionRate}% completado
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${course.completionRate >= 90 ? 'bg-success' :
                        course.completionRate >= 70 ? 'bg-accent' :
                          'bg-destructive'
                      }`}
                      style={{ width: `${course.completionRate}%` }}
                    />
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                    {course.totalCompleted} / {course.totalAssigned} usuarios completados
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
