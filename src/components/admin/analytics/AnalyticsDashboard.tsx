import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HighLevelDashboard } from './HighLevelDashboard'
import { UserProgressReport } from './UserProgressReport'
import { CourseReport } from './CourseReport'
import { TeamReport } from './TeamReport'
import { AssessmentReport } from './AssessmentReport'
import { MentorshipReport } from './MentorshipReport'
import { ChartBar, Users, BookOpen, Trophy, Exam, UsersThree, ArrowLeft } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

interface AnalyticsDashboardProps {
  onBack: () => void
}

type ReportView = 'overview' | 'user-progress' | 'course' | 'team' | 'assessment' | 'mentorship'

export function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const { t } = useTranslation()
  const [currentView, setCurrentView] = useState<ReportView>('overview')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft size={20} />
            {t('analytics.backToDashboard')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>
            <p className="text-muted-foreground">{t('analytics.subtitle')}</p>
          </div>
        </div>
      </div>

      {currentView === 'overview' ? (
        <div className="space-y-6">
          <HighLevelDashboard />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => setCurrentView('user-progress')}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{t('analytics.reports.userProgress.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('analytics.reports.userProgress.description')}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => setCurrentView('course')}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <BookOpen size={24} className="text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{t('analytics.reports.course.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('analytics.reports.course.description')}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => setCurrentView('team')}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <UsersThree size={24} className="text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{t('analytics.reports.team.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('analytics.reports.team.description')}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => setCurrentView('assessment')}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-success/10">
                  <Exam size={24} className="text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{t('analytics.reports.assessment.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('analytics.reports.assessment.description')}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => setCurrentView('mentorship')}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Trophy size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{t('analytics.reports.mentorship.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('analytics.reports.mentorship.description')}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setCurrentView('overview')} className="gap-2">
            <ArrowLeft size={20} />
            {t('analytics.backToOverview')}
          </Button>

          {currentView === 'user-progress' && <UserProgressReport />}
          {currentView === 'course' && <CourseReport />}
          {currentView === 'team' && <TeamReport />}
          {currentView === 'assessment' && <AssessmentReport />}
          {currentView === 'mentorship' && <MentorshipReport />}
        </div>
      )}
    </div>
  )
}
