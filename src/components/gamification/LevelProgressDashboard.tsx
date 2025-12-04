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
import { useTranslation } from 'react-i18next'

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
  }>({
    totalBadges: 0,
    recentBadges: []
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
        recentBadges: gamificationStats.badges?.slice(-3) || []
      })
    } catch (error) {
      console.error('Error loading gamification stats:', error)
    } finally {
      setLoadingStats(false)
    }
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
    <div className="space-y-4 md:space-y-6">
      {/* Main Level Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <Trophy className="h-5 w-5 md:h-6 md:w-6 text-yellow-500 flex-shrink-0" />
                <span className="truncate">Nivel {currentLevel}</span>
              </CardTitle>
              <CardDescription className="text-sm md:text-base mt-1 md:mt-2">
                <span className="truncate">{getRankName()}</span> • {totalXP.toLocaleString()} XP total
              </CardDescription>
            </div>
            {getRankName() && (
              <Badge variant="secondary" className="text-xs md:text-sm px-2 md:px-3 py-1 flex-shrink-0">
                <Medal className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                {getRankName()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="space-y-3 md:space-y-4">
            {/* Progress Bar */}
            <div className="space-y-1.5 md:space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground truncate">
                  {xpInCurrentLevel.toLocaleString()} / {xpNeededForNext.toLocaleString()} XP
                </span>
                <span className="font-medium flex-shrink-0 ml-2">{Math.round(progress.percentage)}%</span>
              </div>
              <Progress value={progress.percentage} className="h-2.5 md:h-3" />
            </div>

            {/* XP Breakdown */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 pt-3 md:pt-4 border-t">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">{currentLevel}</div>
                <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Nivel Actual</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-green-600">{xpInCurrentLevel.toLocaleString()}</div>
                <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">XP en Nivel</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-blue-600">{nextLevelXP.toLocaleString()}</div>
                <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">XP para Siguiente</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* Badges Card */}
        <Card>
          <CardHeader className="pb-2 p-3 md:p-4">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5">
              <Award className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
              Insignias
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats.totalBadges}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
              Insignias obtenidas
            </div>
            {stats.recentBadges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {stats.recentBadges.map((badgeId, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px] md:text-xs">
                    {badgeId.replace('level-', 'Nv. ')}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievement Card */}
        <Card>
          <CardHeader className="pb-2 p-3 md:p-4">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5">
              <Star className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
              Logro Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-lg md:text-xl font-bold">
              {getRankName()}
            </div>
            <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
              Rango de nivel
            </div>
          </CardContent>
        </Card>

        {/* Next Milestone Card */}
        <Card>
          <CardHeader className="pb-2 p-3 md:p-4">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5">
              <Target className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
              Próximo Hito
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-lg md:text-xl font-bold">
              {getNextMilestone(currentLevel)}
            </div>
            <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
              Siguiente nivel importante
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level History Chart (Simple) */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
            Progreso de Nivel
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="space-y-1.5 md:space-y-2">
            {[5, 10, 25, 50, 75, 100, 150, 200, 250, 500].map(milestone => (
              <div key={milestone} className="flex items-center gap-2 md:gap-3">
                <div className="w-12 md:w-16 text-[10px] md:text-xs text-muted-foreground flex-shrink-0">
                  Nv. {milestone}
                </div>
                <div className="flex-1 min-w-0">
                  <Progress 
                    value={currentLevel >= milestone ? 100 : 0} 
                    className="h-1.5 md:h-2"
                  />
                </div>
                <div className="w-6 md:w-8 text-right flex-shrink-0">
                  {currentLevel >= milestone ? (
                    <Trophy className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 inline" />
                  ) : (
                    <span className="text-[10px] md:text-xs text-muted-foreground">-</span>
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

