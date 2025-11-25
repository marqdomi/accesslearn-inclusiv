import { useAchievements } from '@/hooks/use-achievements'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Fire, Target, ArrowRight } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'
import { useTranslation } from 'react-i18next'

interface AchievementsWidgetProps {
  onViewAll: () => void
  userId?: string
}

export function AchievementsWidget({ onViewAll, userId }: AchievementsWidgetProps) {
  const { t } = useTranslation()
  const { userStats } = useAchievements(userId)

  const stats = userStats || {
    totalCoursesCompleted: 0,
    totalModulesCompleted: 0,
    totalAssessmentsPassed: 0,
    averageScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: 0,
    achievementsUnlocked: [],
  }

  const totalAchievements = ACHIEVEMENTS.filter((a) => !a.hidden).length
  const unlockedCount = stats.achievementsUnlocked.length
  const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100)

  const getNextAchievement = () => {
    const unlockedIds = new Set(stats.achievementsUnlocked.map((ua) => ua.achievementId))
    
    const courseAchievements = ACHIEVEMENTS.filter(
      (a) => a.category === 'course' && !unlockedIds.has(a.id) && !a.hidden
    ).sort((a, b) => a.requirement - b.requirement)

    if (courseAchievements.length > 0) {
      const next = courseAchievements[0]
      const progress = stats.totalCoursesCompleted
      return { achievement: next, progress, max: next.requirement }
    }

    const milestoneAchievements = ACHIEVEMENTS.filter(
      (a) => a.category === 'milestone' && !unlockedIds.has(a.id) && !a.hidden
    ).sort((a, b) => a.requirement - b.requirement)

    if (milestoneAchievements.length > 0) {
      const next = milestoneAchievements[0]
      const progress = stats.totalModulesCompleted
      return { achievement: next, progress, max: next.requirement }
    }

    return null
  }

  const nextAchievement = getNextAchievement()

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-accent/20 to-primary/10 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
              <Trophy size={24} weight="fill" className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t('achievementsWidget.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {unlockedCount} {t('achievementsWidget.of')} {totalAchievements} {t('achievementsWidget.unlocked')}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <Progress value={completionPercentage} className="h-3" aria-label={`Achievement progress: ${completionPercentage}%`} />
          <p className="mt-2 text-xs text-muted-foreground">{completionPercentage}% {t('achievementsWidget.complete')}</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-red-600">
              <Fire size={16} weight="fill" className="text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('achievementsWidget.streak')}</p>
              <p className="text-sm font-bold">{stats.currentStreak} {t('achievementsWidget.days')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600">
              <Target size={16} weight="fill" className="text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('achievementsWidget.courses')}</p>
              <p className="text-sm font-bold">{stats.totalCoursesCompleted}</p>
            </div>
          </div>
        </div>

        {nextAchievement && (
          <div className="mb-4 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-background/50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('achievementsWidget.nextAchievement')}
            </p>
            <p className="mb-2 font-bold">
              {nextAchievement.achievement.titleKey 
                ? t(nextAchievement.achievement.titleKey) 
                : nextAchievement.achievement.title}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t('achievementsWidget.progress')}</span>
              <span>
                {nextAchievement.progress} / {nextAchievement.max}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
                style={{
                  width: `${Math.min((nextAchievement.progress / nextAchievement.max) * 100, 100)}%`,
                }}
                role="progressbar"
                aria-valuenow={nextAchievement.progress}
                aria-valuemin={0}
                aria-valuemax={nextAchievement.max}
                aria-label="Next achievement progress"
              />
            </div>
          </div>
        )}

        <Button onClick={onViewAll} variant="outline" className="w-full gap-2" size="sm">
          {t('achievementsWidget.viewAll')}
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </Card>
  )
}
