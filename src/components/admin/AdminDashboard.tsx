import { useKV } from '@github/spark/hooks'
import { CourseStructure, User, UserProgress, UserStats, EmployeeCredentials } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, TrendUp, Trophy, Plus, FileText, UserPlus, Target, UsersThree, ChartBar, UsersFour, Certificate, Palette } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'

interface AdminDashboardProps {
  onNavigate: (section: 'courses' | 'users' | 'reports' | 'gamification' | 'enrollment' | 'manual-enrollment' | 'corporate-reports' | 'assignments' | 'groups' | 'mentorship' | 'teams' | 'analytics' | 'company-settings' | 'branding') => void
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { t } = useTranslation()
  const [courses] = useKV<CourseStructure[]>('admin-courses', [])
  const [users] = useKV<User[]>('users', [])
  const [employees] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  const [allProgress] = useKV<Record<string, UserProgress[]>>('all-user-progress', {})
  const [allStats] = useKV<Record<string, UserStats>>('all-user-stats', {})

  const totalCourses = courses?.length || 0
  const totalUsers = users?.length || 0
  const totalEmployees = employees?.length || 0
  const pendingEmployees = employees?.filter(e => e.status === 'pending').length || 0
  const publishedCourses = courses?.filter(c => c.published).length || 0

  const completionRate = (() => {
    if (!allProgress || Object.keys(allProgress).length === 0) return 0
    
    let totalCompleted = 0
    let totalAssignments = 0
    
    Object.values(allProgress).forEach(userProgressList => {
      userProgressList.forEach(progress => {
        totalAssignments++
        if (progress.status === 'completed') totalCompleted++
      })
    })
    
    return totalAssignments > 0 ? Math.round((totalCompleted / totalAssignments) * 100) : 0
  })()

  const totalXPAwarded = (() => {
    if (!allStats) return 0
    return Object.values(allStats).reduce((sum, stats) => sum + (stats?.totalXP || 0), 0)
  })()

  const quickActions = [
    {
      label: t('adminDashboard.actions.bulkEnrollment'),
      icon: UserPlus,
      action: () => onNavigate('enrollment'),
      variant: 'default' as const,
      description: t('adminDashboard.actions.bulkEnrollmentDesc')
    },
    {
      label: t('adminDashboard.actions.addEmployeeManually'),
      icon: UserPlus,
      action: () => onNavigate('manual-enrollment'),
      variant: 'outline' as const,
      description: t('adminDashboard.actions.addEmployeeManuallyDesc')
    },
    {
      label: t('adminDashboard.actions.createGroups'),
      icon: UsersThree,
      action: () => onNavigate('groups'),
      variant: 'outline' as const,
      description: t('adminDashboard.actions.createGroupsDesc')
    },
    {
      label: t('adminDashboard.actions.assignCourses'),
      icon: Target,
      action: () => onNavigate('assignments'),
      variant: 'outline' as const,
      description: t('adminDashboard.actions.assignCoursesDesc')
    },
    {
      label: t('adminDashboard.actions.teamManagement'),
      icon: Users,
      action: () => onNavigate('teams'),
      variant: 'outline' as const,
      description: t('adminDashboard.actions.teamManagementDesc')
    },
    {
      label: t('adminDashboard.actions.mentorshipProgram'),
      icon: UsersFour,
      action: () => onNavigate('mentorship'),
      variant: 'outline' as const,
      description: t('adminDashboard.actions.mentorshipProgramDesc')
    },
    {
      label: t('adminDashboard.actions.analyticsDashboard'),
      icon: ChartBar,
      action: () => onNavigate('analytics'),
      variant: 'default' as const,
      description: t('adminDashboard.actions.analyticsDashboardDesc')
    },
    {
      label: t('adminDashboard.actions.legacyReports'),
      icon: FileText,
      action: () => onNavigate('corporate-reports'),
      variant: 'outline' as const,
      description: t('adminDashboard.actions.legacyReportsDesc')
    },
    {
      label: t('adminDashboard.actions.createCourse'),
      icon: Plus,
      action: () => onNavigate('courses'),
      variant: 'outline' as const,
      description: t('adminDashboard.actions.createCourseDesc')
    },
    {
      label: t('adminDashboard.actions.viewReports'),
      icon: FileText,
      action: () => onNavigate('reports'),
      variant: 'outline' as const,
      description: t('adminDashboard.actions.viewReportsDesc')
    },
    {
      label: t('adminDashboard.actions.gamification'),
      icon: Trophy,
      action: () => onNavigate('gamification'),
      variant: 'outline' as const,
      description: t('adminDashboard.actions.gamificationDesc')
    },
    {
      label: t('adminDashboard.actions.companySettings'),
      icon: Certificate,
      action: () => onNavigate('company-settings'),
      variant: 'outline' as const,
      description: t('adminDashboard.actions.companySettingsDesc')
    },
    {
      label: t('adminDashboard.actions.brandingAppearance'),
      icon: Palette,
      action: () => onNavigate('branding'),
      variant: 'default' as const,
      description: t('adminDashboard.actions.brandingAppearanceDesc')
    }
  ]

  const stats = [
    {
      title: t('adminDashboard.stats.totalEmployees'),
      value: totalEmployees,
      subtitle: t('adminDashboard.stats.pendingActivation', { count: String(pendingEmployees) }),
      icon: Users,
      color: 'text-primary'
    },
    {
      title: t('adminDashboard.stats.totalCourses'),
      value: totalCourses,
      subtitle: t('adminDashboard.stats.published', { count: String(publishedCourses) }),
      icon: BookOpen,
      color: 'text-secondary'
    },
    {
      title: t('adminDashboard.stats.completionRate'),
      value: `${completionRate}%`,
      subtitle: t('adminDashboard.stats.overallProgress'),
      icon: TrendUp,
      color: 'text-success'
    },
    {
      title: t('adminDashboard.stats.xpAwarded'),
      value: totalXPAwarded.toLocaleString(),
      subtitle: t('adminDashboard.stats.totalExperienceEarned'),
      icon: Trophy,
      color: 'text-accent'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('adminDashboard.title')}</h2>
        <p className="text-muted-foreground mt-1">
          {t('adminDashboard.subtitle')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} weight="duotone" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">{t('adminDashboard.quickActions')}</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full" onClick={action.action}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <action.icon className="h-5 w-5 text-primary" weight="duotone" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm leading-tight">{action.label}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminDashboard.workflow.title')}</CardTitle>
          <CardDescription>
            {t('adminDashboard.workflow.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-medium">{t('adminDashboard.workflow.step1.title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('adminDashboard.workflow.step1.description')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-medium">{t('adminDashboard.workflow.step2.title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('adminDashboard.workflow.step2.description')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-medium">{t('adminDashboard.workflow.step3.title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('adminDashboard.workflow.step3.description')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground text-sm font-bold">
              4
            </div>
            <div>
              <p className="font-medium">{t('adminDashboard.workflow.step4.title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('adminDashboard.workflow.step4.description')}
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => onNavigate('enrollment')} className="flex-1" size="lg">
              <UserPlus className="mr-2" size={20} />
              {t('adminDashboard.workflow.uploadEmployees')}
            </Button>
            <Button onClick={() => onNavigate('corporate-reports')} variant="outline" className="flex-1" size="lg">
              <ChartBar className="mr-2" size={20} />
              {t('adminDashboard.workflow.viewAnalytics')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
