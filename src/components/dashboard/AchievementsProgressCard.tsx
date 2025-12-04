import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAchievements } from '@/hooks/use-achievements'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { Trophy, Flame, Target, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

export function AchievementsProgressCard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { userStats, loading } = useAchievements(user?.id)

  if (loading) {
    return (
      <Card className="overflow-hidden border-2">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="h-20 bg-muted rounded animate-pulse"></div>
            <div className="h-20 bg-muted rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stats = userStats || {
    totalCoursesCompleted: 0,
    totalModulesCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievementsUnlocked: [],
    totalXP: 0,
    level: 1,
  }

  const achievements = ACHIEVEMENTS
  const userAchievements = stats.achievementsUnlocked || []
  
  // Get recent achievements (last 3 unlocked)
  const recentAchievements = achievements
    .filter(achievement => 
      userAchievements.some(ua => ua.achievementId === achievement.id)
    )
    .sort((a, b) => {
      const aUnlocked = userAchievements.find(ua => ua.achievementId === a.id)
      const bUnlocked = userAchievements.find(ua => ua.achievementId === b.id)
      return (bUnlocked?.unlockedAt || 0) - (aUnlocked?.unlockedAt || 0)
    })
    .slice(0, 3)

  // Get next achievement to unlock
  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId))
  const nextAchievement = achievements
    .filter(a => !unlockedIds.has(a.id) && !a.hidden)
    .sort((a, b) => a.requirement - b.requirement)[0]

  const getAchievementProgress = () => {
    if (!nextAchievement) return null
    
    let current = 0
    if (nextAchievement.category === 'course') {
      current = stats.totalCoursesCompleted
    } else if (nextAchievement.category === 'milestone') {
      current = stats.totalModulesCompleted
    } else if (nextAchievement.category === 'streak') {
      current = stats.currentStreak
    }
    
    const progress = Math.min(100, Math.round((current / nextAchievement.requirement) * 100))
    return { current, max: nextAchievement.requirement, progress }
  }

  const achievementProgress = getAchievementProgress()

  return (
    <Card className="overflow-hidden border-2">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-3 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <CardTitle className="text-sm sm:text-base truncate">Logros y Progreso</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile?tab=achievements')}
            className="gap-1 flex-shrink-0 text-xs sm:text-sm touch-target"
          >
            <span className="hidden sm:inline">Ver todos</span>
            <span className="sm:hidden">Todos</span>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-6 p-3 sm:p-6">
        <div className="space-y-3 sm:space-y-6">
          {/* Streak Section */}
          <div className="flex items-center justify-between p-2 sm:p-4 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border border-orange-200/50 dark:border-orange-800/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-full bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Racha Actual</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.currentStreak} días
                </p>
              </div>
            </div>
            {stats.longestStreak > stats.currentStreak && (
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-xs text-muted-foreground">Mejor racha</p>
                <p className="text-sm font-semibold">{stats.longestStreak} días</p>
              </div>
            )}
          </div>

          {/* Recent Achievements */}
          {recentAchievements.length > 0 ? (
            <div>
              <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                Logros Recientes
              </h4>
              <div className="space-y-1.5 sm:space-y-2">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                      <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium line-clamp-1">{achievement.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                        {achievement.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0 hidden sm:inline-flex">
                      {achievement.tier}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Aún no has desbloqueado logros
              </p>
              <p className="text-xs text-muted-foreground">
                Completa cursos para ganar tus primeros logros
              </p>
            </div>
          )}

          {/* Next Achievement */}
          {nextAchievement && achievementProgress && (
            <div className="pt-3 sm:pt-4 border-t">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <h4 className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  Próximo Logro
                </h4>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {achievementProgress.current} / {achievementProgress.max}
                </span>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium line-clamp-1">{nextAchievement.name}</p>
                <Progress value={achievementProgress.progress} className="h-1.5 sm:h-2" />
                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                  {nextAchievement.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

