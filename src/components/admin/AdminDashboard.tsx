import { useState, useEffect } from 'react'
import { EmployeeCredentials } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, TrendUp, Trophy, Plus, FileText, UserPlus, Target, UsersThree, ChartBar, UsersFour, Certificate, Palette } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'
import { AdminStatsService, AdminStats } from '@/services/admin-stats-service'
import { EmployeeService } from '@/services/employee-service'

interface AdminDashboardProps {
  onNavigate: (section: 'courses' | 'users' | 'reports' | 'gamification' | 'enrollment' | 'manual-enrollment' | 'corporate-reports' | 'assignments' | 'groups' | 'mentorship' | 'teams' | 'analytics' | 'company-settings' | 'branding' | 'employees') => void
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { t } = useTranslation()
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalEmployees: 0,
    pendingActivation: 0,
    totalCourses: 0,
    publishedCourses: 0,
    completionRate: 0,
    totalXP: 0,
    totalUsers: 0,
    activeUsers: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const data = await AdminStatsService.getStats()
      setAdminStats(data)
    } catch (error) {
      console.error('Failed to load admin stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalCourses = adminStats.totalCourses
  const totalUsers = adminStats.totalUsers
  const totalEmployees = adminStats.totalEmployees
  const pendingEmployees = adminStats.pendingActivation
  const publishedCourses = adminStats.publishedCourses
  const completionRate = adminStats.completionRate
  const totalXPAwarded = adminStats.totalXP

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
        {stats.map((stat, index) => {
          // Hacer la tarjeta de empleados clickeable
          const isEmployeesCard = stat.title === t('adminDashboard.stats.totalEmployees')
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={isEmployeesCard ? "hover:shadow-lg transition-all cursor-pointer hover:border-primary" : ""}
                onClick={isEmployeesCard ? () => onNavigate('employees') : undefined}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} weight="duotone" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  {isEmployeesCard && (
                    <p className="text-xs text-primary mt-2 font-medium">
                      Click para gestionar →
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
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
