import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { useXP, getXPForNextLevel, getXPForCurrentLevel, getRankKey } from '@/hooks/use-xp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  TrendingUp, 
  Star, 
  Award, 
  Target,
  Zap,
  BarChart3,
  Medal
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'

interface LevelProgressDashboardProps {
  userId?: string
}

export function LevelProgressDashboard({ userId }: LevelProgressDashboardProps) {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const { currentTenant } = useTenant()
  const effectiveUserId = userId || currentUser?.id
  const { totalXP, currentLevel, getProgressToNextLevel, getRankName, loading, refresh } = useXP(effectiveUserId)
  const [stats, setStats] = useState<{
    totalBadges: number
    recentBadges: string[]
    achievement: string | null
  }>({
    totalBadges: 0,
    recentBadges: [],
    achievement: null
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (effectiveUserId && currentTenant) {
      loadStats()
    }
  }, [effectiveUserId, currentTenant?.id, currentLevel])

  const loadStats = async () => {
    if (!effectiveUserId || !currentTenant) return

    try {
      setLoadingStats(true)
      const gamificationStats = await ApiService.getGamificationStats(effectiveUserId)
      
      setStats({
        totalBadges: gamificationStats.badges?.length || 0,
        recentBadges: gamificationStats.badges?.slice(-3) || [],
        achievement: getAchievementForLevel(currentLevel)
      })
    } catch (error) {
      console.error('Error loading gamification stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const getAchievementForLevel = (level: number): string | null => {
    if (level >= 501) return 'Leyenda'
    if (level >= 201) return 'Gran Maestro'
    if (level >= 101) return 'Maestro'
    if (level >= 51) return 'Experto'
    if (level >= 26) return 'Erudito'
    if (level >= 11) return 'Aprendiz'
    if (level >= 1) return 'Novato'
    return null
  }

  const progress = getProgressToNextLevel()
  const currentLevelXP = getXPForCurrentLevel(currentLevel)
  const nextLevelXP = getXPForNextLevel(currentLevel)
  const xpInCurrentLevel = totalXP - currentLevelXP
  const xpNeededForNext = nextLevelXP - currentLevelXP

  if (loading || loadingStats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Level Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Nivel {currentLevel}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {getRankName()} • {totalXP.toLocaleString()} XP total
              </CardDescription>
            </div>
            {stats.achievement && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Medal className="h-4 w-4 mr-1" />
                {stats.achievement}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {xpInCurrentLevel.toLocaleString()} / {xpNeededForNext.toLocaleString()} XP
                </span>
                <span className="font-medium">{Math.round(progress.percentage)}%</span>
              </div>
              <Progress value={progress.percentage} className="h-3" />
            </div>

            {/* XP Breakdown */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{currentLevel}</div>
                <div className="text-xs text-muted-foreground">Nivel Actual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{xpInCurrentLevel.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">XP en Nivel</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{nextLevelXP.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">XP para Siguiente</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Badges Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Insignias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBadges}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Insignias obtenidas
            </div>
            {stats.recentBadges.length > 0 && (
              <div className="mt-3 flex gap-1">
                {stats.recentBadges.map((badgeId, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {badgeId.replace('level-', 'Nv. ')}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievement Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Logro Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.achievement || 'Novato'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Rango de nivel
            </div>
          </CardContent>
        </Card>

        {/* Next Milestone Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Próximo Hito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getNextMilestone(currentLevel)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Siguiente nivel importante
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level History Chart (Simple) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Progreso de Nivel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[5, 10, 25, 50, 75, 100, 150, 200, 250, 500].map(milestone => (
              <div key={milestone} className="flex items-center gap-3">
                <div className="w-16 text-xs text-muted-foreground">
                  Nv. {milestone}
                </div>
                <div className="flex-1">
                  <Progress 
                    value={currentLevel >= milestone ? 100 : 0} 
                    className="h-2"
                  />
                </div>
                <div className="w-8 text-right">
                  {currentLevel >= milestone ? (
                    <Trophy className="h-4 w-4 text-yellow-500 inline" />
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getNextMilestone(currentLevel: number): string {
  const milestones = [5, 10, 25, 50, 75, 100, 150, 200, 250, 500]
  const next = milestones.find(m => m > currentLevel)
  return next ? `Nivel ${next}` : '¡Máximo alcanzado!'
}

