import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAchievements } from '@/hooks/use-achievements'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { Trophy, Fire, Star, Lock } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Achievement } from '@/lib/types'
import { useTranslation } from 'react-i18next'

export function ProgressGoals({ userId }: { userId?: string }) {
  const { t } = useTranslation()
  const { userStats } = useAchievements(userId)

  const achievements = ACHIEVEMENTS
  const userAchievements = userStats?.achievementsUnlocked || []

  const recentUnlocked = achievements
    .filter(achievement => 
      userAchievements.some(ua => ua.achievementId === achievement.id)
    )
    .sort((a, b) => {
      const aUnlocked = userAchievements.find(ua => ua.achievementId === a.id)
      const bUnlocked = userAchievements.find(ua => ua.achievementId === b.id)
      return (bUnlocked?.unlockedAt || 0) - (aUnlocked?.unlockedAt || 0)
    })
    .slice(0, 3)

  const nextToUnlock = achievements
    .filter(achievement => 
      !userAchievements.some(ua => ua.achievementId === achievement.id) && !achievement.hidden
    )
    .slice(0, 2)

  const currentStreak = userStats?.currentStreak || 0

  const getTierColor = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze': return 'text-amber-700'
      case 'silver': return 'text-slate-400'
      case 'gold': return 'text-yellow-500'
      case 'platinum': return 'text-cyan-400'
    }
  }

  const getTierBg = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-100 border-amber-300'
      case 'silver': return 'bg-slate-100 border-slate-300'
      case 'gold': return 'bg-yellow-100 border-yellow-300'
      case 'platinum': return 'bg-cyan-100 border-cyan-300'
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/70">
            <Fire size={24} weight="fill" className="text-white" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t('progressGoals.learningStreak')}</h3>
            <p className="text-sm text-muted-foreground">{t('progressGoals.keepMomentum')}</p>
          </div>
        </div>

        <div className="text-center py-4">
          <motion.div
            className="text-6xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {currentStreak}
          </motion.div>
          <p className="text-lg font-semibold text-muted-foreground mt-2">
            {currentStreak === 1 ? t('progressGoals.day') : t('progressGoals.days')} {t('progressGoals.inARow')}
          </p>
          {currentStreak > 0 && (
            <p className="text-sm text-accent font-medium mt-1">
              🔥 {t('progressGoals.onFire')}
            </p>
          )}
          {currentStreak === 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {t('progressGoals.startStreak')}
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
            <Trophy size={24} weight="fill" className="text-white" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{t('progressGoals.achievements')}</h3>
            <p className="text-sm text-muted-foreground">
              {userAchievements.length} {t('progressGoals.of')} {achievements.length} {t('progressGoals.unlocked')}
            </p>
          </div>
        </div>

        {recentUnlocked.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              {t('progressGoals.recentlyUnlocked')}
            </h4>
            <div className="space-y-2">
              {recentUnlocked.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 ${getTierBg(achievement.tier)}`}
                >
                  <div className={`text-3xl ${getTierColor(achievement.tier)}`}>
                    <Trophy size={32} weight="fill" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{achievement.titleKey ? t(achievement.titleKey) : achievement.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {achievement.descriptionKey ? t(achievement.descriptionKey) : achievement.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {t(`achievements.${achievement.tier}`)}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {nextToUnlock.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              {t('progressGoals.nextToUnlock')}
            </h4>
            <div className="space-y-2">
              {nextToUnlock.map((achievement) => {
                const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id)
                const progress = userAchievement?.progress || 0
                const progressPercent = (progress / achievement.requirement) * 100

                return (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 rounded-lg border-2 border-muted bg-card"
                  >
                    <div className="text-muted-foreground opacity-50">
                      <Lock size={32} weight="fill" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-muted-foreground truncate">{achievement.titleKey ? t(achievement.titleKey) : achievement.title}</p>
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {achievement.descriptionKey ? t(achievement.descriptionKey) : achievement.description}
                      </p>
                      <Progress 
                        value={progressPercent} 
                        className="h-2 bg-muted"
                        aria-label={`${achievement.title} progress: ${Math.floor(progressPercent)}%`}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {progress} / {achievement.requirement}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {t(`achievements.${achievement.tier}`)}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {recentUnlocked.length === 0 && nextToUnlock.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Star size={48} className="mx-auto mb-3 opacity-50" aria-hidden="true" />
            <p>{t('progressGoals.completeCoursesPrompt')}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
