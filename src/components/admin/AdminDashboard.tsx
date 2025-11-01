import { useKV } from '@github/spark/hooks'
import { CourseStructure, User, UserProgress, UserStats, EmployeeCredentials } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, TrendUp, Trophy, Plus, FileText, UserPlus, Target, UsersThree, ChartBar, UsersFour } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface AdminDashboardProps {
  onNavigate: (section: 'courses' | 'users' | 'reports' | 'gamification' | 'enrollment' | 'corporate-reports' | 'assignments' | 'groups' | 'mentorship') => void
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
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
      label: 'Bulk Enrollment',
      icon: UserPlus,
      action: () => onNavigate('enrollment'),
      variant: 'default' as const,
      description: 'Upload employee CSV file'
    },
    {
      label: 'Create Groups',
      icon: UsersThree,
      action: () => onNavigate('groups'),
      variant: 'outline' as const,
      description: 'Organize employees into teams'
    },
    {
      label: 'Assign Courses',
      icon: Target,
      action: () => onNavigate('assignments'),
      variant: 'outline' as const,
      description: 'Assign training to groups/users'
    },
    {
      label: 'Mentorship Program',
      icon: UsersFour,
      action: () => onNavigate('mentorship'),
      variant: 'outline' as const,
      description: 'Pair mentors with mentees'
    },
    {
      label: 'Analytics Dashboard',
      icon: ChartBar,
      action: () => onNavigate('corporate-reports'),
      variant: 'outline' as const,
      description: 'View progress & engagement'
    },
    {
      label: 'Create Course',
      icon: Plus,
      action: () => onNavigate('courses'),
      variant: 'outline' as const,
      description: 'Build new training content'
    },
    {
      label: 'Manage Users',
      icon: Users,
      action: () => onNavigate('users'),
      variant: 'outline' as const,
      description: 'Individual user management'
    },
    {
      label: 'View Reports',
      icon: FileText,
      action: () => onNavigate('reports'),
      variant: 'outline' as const,
      description: 'Detailed analytics reports'
    },
    {
      label: 'Gamification',
      icon: Trophy,
      action: () => onNavigate('gamification'),
      variant: 'outline' as const,
      description: 'Configure XP and badges'
    }
  ]

  const stats = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      subtitle: `${pendingEmployees} pending activation`,
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Total Courses',
      value: totalCourses,
      subtitle: `${publishedCourses} published`,
      icon: BookOpen,
      color: 'text-secondary'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      subtitle: 'Overall progress',
      icon: TrendUp,
      color: 'text-success'
    },
    {
      title: 'XP Awarded',
      value: totalXPAwarded.toLocaleString(),
      subtitle: 'Total experience earned',
      icon: Trophy,
      color: 'text-accent'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Manage courses, users, and track learning progress
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
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
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
          <CardTitle>Corporate Admin Workflow</CardTitle>
          <CardDescription>
            Set up your learning platform in four simple steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-medium">Bulk Enroll Employees</p>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file to create employee accounts with secure temporary passwords
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-medium">Create Groups</p>
              <p className="text-sm text-muted-foreground">
                Organize employees by department, role, or onboarding cohort
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-medium">Assign Training Courses</p>
              <p className="text-sm text-muted-foreground">
                Assign courses (missions/quests) to entire groups or individual employees
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground text-sm font-bold">
              4
            </div>
            <div>
              <p className="font-medium">Monitor Progress & Engagement</p>
              <p className="text-sm text-muted-foreground">
                Track completion rates, engagement metrics, and export reports
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => onNavigate('enrollment')} className="flex-1" size="lg">
              <UserPlus className="mr-2" size={20} />
              Upload Employees
            </Button>
            <Button onClick={() => onNavigate('corporate-reports')} variant="outline" className="flex-1" size="lg">
              <ChartBar className="mr-2" size={20} />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
