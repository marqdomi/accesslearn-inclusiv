import { useState } from 'react'
import { useAchievements } from '@/hooks/use-achievements'
import { useXP } from '@/hooks/use-xp'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { AchievementCard } from './AchievementCard'
import { XPWidget } from '@/components/gamification/XPWidget'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Trophy, Fire, Target, ShareNetwork } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'

export function AchievementsDashboard({ userId }: { userId?: string }) {
  const { t } = useTranslation()
  const { userStats } = useAchievements(userId)
  const { totalXP, currentLevel, getRankName } = useXP(userId)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')

  const stats = userStats || {
    totalCoursesCompleted: 0,
    totalModulesCompleted: 0,
    totalAssessmentsPassed: 0,
    averageScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: 0,
    achievementsUnlocked: [],
    totalXP: 0,
    level: 1,
  }

  const unlockedIds = new Set(stats.achievementsUnlocked.map((ua) => ua.achievementId))
  const totalAchievements = ACHIEVEMENTS.filter((a) => !a.hidden).length
  const unlockedCount = stats.achievementsUnlocked.length
  const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100)

  const getProgress = (achievementId: string): number => {
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId)
    if (!achievement) return 0

    switch (achievement.category) {
      case 'course':
        return stats.totalCoursesCompleted
      case 'milestone':
        return stats.totalModulesCompleted
      case 'assessment':
        return stats.totalAssessmentsPassed
      case 'streak':
        return stats.currentStreak
      default:
        return 0
    }
  }

  const filteredAchievements = ACHIEVEMENTS.filter((achievement) => {
    if (achievement.hidden && !unlockedIds.has(achievement.id)) return false
    if (filter === 'unlocked') return unlockedIds.has(achievement.id)
    if (filter === 'locked') return !unlockedIds.has(achievement.id)
    return true
  })

  const handleShare = async () => {
    const shareText = t('achievementsDashboard.shareText', {
      count: unlockedCount.toString(),
      level: currentLevel.toString(),
      rank: getRankName(),
      xp: totalXP.toLocaleString(),
      courses: stats.totalCoursesCompleted.toString(),
      modules: stats.totalModulesCompleted.toString(),
      streak: stats.currentStreak.toString(),
      score: stats.averageScore.toFixed(0)
    })

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('achievementsDashboard.shareTitle'),
          text: shareText,
        })
        toast.success(t('achievementsDashboard.shareSuccess'))
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          await navigator.clipboard.writeText(shareText)
          toast.success(t('achievementsDashboard.copiedToClipboard'))
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      toast.success(t('achievementsDashboard.copiedToClipboard'))
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('achievementsDashboard.title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('achievementsDashboard.subtitle')}
            </p>
          </div>
          <Button onClick={handleShare} className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
            <ShareNetwork size={20} aria-hidden="true" />
            {t('achievementsDashboard.shareProgress')}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <XPWidget />
      </motion.div>

      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/30">
          <div className="flex items-center gap-4">
            <motion.div 
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Trophy size={24} weight="fill" className="text-white" aria-hidden="true" />
            </motion.div>
            <div>
              <p className="text-sm text-muted-foreground">{t('achievementsDashboard.unlocked')}</p>
              <p className="text-2xl font-bold">
                {unlockedCount} / {totalAchievements}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={completionPercentage} className="h-2" aria-label={`Achievement progress: ${completionPercentage}%`} />
            <p className="mt-2 text-xs text-muted-foreground">{completionPercentage}% {t('achievementsDashboard.complete')}</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/30">
          <div className="flex items-center gap-4">
            <motion.div 
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-red-600 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Fire size={24} weight="fill" className="text-white" aria-hidden="true" />
            </motion.div>
            <div>
              <p className="text-sm text-muted-foreground">{t('achievementsDashboard.currentStreak')}</p>
              <p className="text-2xl font-bold">{stats.currentStreak} {t('achievementsDashboard.days')}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t('achievementsDashboard.longest')}: {stats.longestStreak} {t('achievementsDashboard.days')}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30">
          <div className="flex items-center gap-4">
            <motion.div 
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Target size={24} weight="fill" className="text-white" aria-hidden="true" />
            </motion.div>
            <div>
              <p className="text-sm text-muted-foreground">{t('achievementsDashboard.coursesCompleted')}</p>
              <p className="text-2xl font-bold">{stats.totalCoursesCompleted}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {stats.totalModulesCompleted} {t('achievementsDashboard.modulesTotal')}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30">
          <div className="flex items-center gap-4">
            <motion.div 
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Trophy size={24} weight="fill" className="text-white" aria-hidden="true" />
            </motion.div>
            <div>
              <p className="text-sm text-muted-foreground">{t('achievementsDashboard.averageScore')}</p>
              <p className="text-2xl font-bold">{stats.averageScore.toFixed(0)}%</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {stats.totalAssessmentsPassed} {t('achievementsDashboard.assessmentsPassed')}
          </p>
        </Card>
      </motion.div>

      <div>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all" className="flex-1 md:flex-none">
              {t('achievementsDashboard.all')} ({ACHIEVEMENTS.length})
            </TabsTrigger>
            <TabsTrigger value="unlocked" className="flex-1 md:flex-none">
              {t('achievements.unlocked')} ({unlockedCount})
            </TabsTrigger>
            <TabsTrigger value="locked" className="flex-1 md:flex-none">
              {t('achievementsDashboard.locked')} ({totalAchievements - unlockedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {filteredAchievements.map((achievement, index) => {
          const userAchievement = stats.achievementsUnlocked.find(
            (ua) => ua.achievementId === achievement.id
          )
          const isUnlocked = !!userAchievement
          const progress = getProgress(achievement.id)

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <AchievementCard
                achievement={achievement}
                isUnlocked={isUnlocked}
                unlockedAt={userAchievement?.unlockedAt}
                progress={progress}
              />
            </motion.div>
          )
        })}
      </motion.div>

      {filteredAchievements.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            {t('achievementsDashboard.noAchievements')}
          </p>
        </div>
      )}
    </div>
  )
}
