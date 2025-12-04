import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { GlassCard } from '@/components/ui/glass-card'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, Star, Zap, Target, Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
}

interface AchievementsHallProps {
  userId?: string
}

const rarityConfig = {
  common: {
    color: 'text-gray-400',
    glow: 'shadow-gray-400/20',
    bg: 'bg-gray-500/10',
    border: 'border-gray-400/30',
    icon: Medal,
  },
  rare: {
    color: 'text-blue-400',
    glow: 'shadow-blue-400/30',
    bg: 'bg-blue-500/10',
    border: 'border-blue-400/40',
    icon: Award,
  },
  epic: {
    color: 'text-purple-400',
    glow: 'shadow-purple-400/40',
    bg: 'bg-purple-500/10',
    border: 'border-purple-400/50',
    icon: Star,
  },
  legendary: {
    color: 'text-yellow-400',
    glow: 'shadow-yellow-400/50',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-400/60',
    icon: Crown,
  },
}

export function AchievementsHall({ userId }: AchievementsHallProps) {
  const { user: currentUser } = useAuth()
  const { currentTenant } = useTenant()
  const { preferences } = useAccessibilityPreferences()
  const isSimplified = preferences.simplifiedMode
  const effectiveUserId = userId || currentUser?.id
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    unlocked: 0,
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  })

  useEffect(() => {
    if (effectiveUserId && currentTenant) {
      loadAchievements()
    }
  }, [effectiveUserId, currentTenant?.id])

  const loadAchievements = async () => {
    if (!effectiveUserId || !currentTenant) return

    try {
      setLoading(true)
      const gamificationStats = await ApiService.getGamificationStats(effectiveUserId)
      
      // Transform badges/achievements to our format
      const badges = gamificationStats.badges || []
      const transformedAchievements: Achievement[] = badges.map((badgeId: string) => {
        // Parse badge ID to determine rarity and name
        const levelMatch = badgeId.match(/level-(\d+)/)
        const level = levelMatch ? parseInt(levelMatch[1]) : 0
        
        let rarity: Achievement['rarity'] = 'common'
        if (level >= 200) rarity = 'legendary'
        else if (level >= 100) rarity = 'epic'
        else if (level >= 50) rarity = 'rare'
        
        return {
          id: badgeId,
          name: `Nivel ${level}`,
          description: `Alcanzaste el nivel ${level}`,
          icon: 'trophy',
          rarity,
          unlockedAt: new Date().toISOString(), // Would come from backend
        }
      })

      setAchievements(transformedAchievements)
      
      // Calculate stats
      const unlocked = transformedAchievements.length
      setStats({
        total: 50, // Total possible achievements
        unlocked,
        common: transformedAchievements.filter(a => a.rarity === 'common').length,
        rare: transformedAchievements.filter(a => a.rarity === 'rare').length,
        epic: transformedAchievements.filter(a => a.rarity === 'epic').length,
        legendary: transformedAchievements.filter(a => a.rarity === 'legendary').length,
      })
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const AchievementCard = isSimplified ? Card : GlassCard

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={cn(
      "space-y-6",
      !isSimplified && "tech-bg min-h-screen p-6"
    )}>
      {/* Header */}
      <div className="space-y-2">
        <h2 className={cn(
          "text-3xl font-bold",
          !isSimplified && "text-white"
        )}>
          Hall of Fame
        </h2>
        <p className={cn(
          !isSimplified ? "text-gray-300" : "text-muted-foreground"
        )}>
          Tus logros y reconocimientos
        </p>
      </div>

      {/* Stats Overview */}
      <AchievementCard className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className={cn(
              "text-3xl font-bold mb-1",
              !isSimplified ? "hud-counter text-white" : ""
            )}>
              {stats.unlocked}
            </div>
            <div className={cn(
              "text-sm",
              !isSimplified ? "text-gray-300" : "text-muted-foreground"
            )}>
              Desbloqueados
            </div>
          </div>
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold mb-1 text-gray-400",
              !isSimplified && "text-gray-400"
            )}>
              {stats.common}
            </div>
            <div className={cn(
              "text-xs",
              !isSimplified ? "text-gray-400" : "text-muted-foreground"
            )}>
              Comunes
            </div>
          </div>
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold mb-1 text-blue-400",
              !isSimplified && "text-blue-400"
            )}>
              {stats.rare}
            </div>
            <div className={cn(
              "text-xs",
              !isSimplified ? "text-gray-400" : "text-muted-foreground"
            )}>
              Raras
            </div>
          </div>
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold mb-1 text-purple-400",
              !isSimplified && "text-purple-400"
            )}>
              {stats.epic}
            </div>
            <div className={cn(
              "text-xs",
              !isSimplified ? "text-gray-400" : "text-muted-foreground"
            )}>
              Épicas
            </div>
          </div>
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold mb-1 text-yellow-400",
              !isSimplified && "text-yellow-400"
            )}>
              {stats.legendary}
            </div>
            <div className={cn(
              "text-xs",
              !isSimplified ? "text-gray-400" : "text-muted-foreground"
            )}>
              Legendarias
            </div>
          </div>
        </div>
      </AchievementCard>

      {/* Achievements Grid */}
      {achievements.length === 0 ? (
        <AchievementCard className="p-12 text-center">
          <Trophy className={cn(
            "h-16 w-16 mx-auto mb-4",
            !isSimplified ? "text-tech-cyan" : "text-muted-foreground"
          )} />
          <h3 className={cn(
            "text-xl font-bold mb-2",
            !isSimplified && "text-white"
          )}>
            Aún no has desbloqueado logros
          </h3>
          <p className={cn(
            !isSimplified ? "text-gray-300" : "text-muted-foreground"
          )}>
            Completa cursos y alcanza nuevos niveles para desbloquear logros
          </p>
        </AchievementCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => {
            const config = rarityConfig[achievement.rarity]
            const IconComponent = config.icon

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <AchievementCard
                  className={cn(
                    "p-6 relative overflow-hidden",
                    !isSimplified && config.bg,
                    !isSimplified && config.border,
                    !isSimplified && "border"
                  )}
                >
                  {/* Glow effect for unlocked achievements */}
                  {achievement.unlockedAt && !isSimplified && (
                    <div className={cn(
                      "absolute inset-0 rounded-lg",
                      config.glow,
                      "animate-glow-pulse"
                    )} />
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "p-3 rounded-lg",
                        !isSimplified ? config.bg : "bg-muted/50"
                      )}>
                        <IconComponent className={cn(
                          "h-8 w-8",
                          config.color
                        )} />
                      </div>
                      {achievement.unlockedAt && (
                        <Badge className={cn(
                          "hud-badge",
                          !isSimplified && "hud-badge-pulse"
                        )}>
                          Desbloqueado
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className={cn(
                      "text-lg font-bold mb-2",
                      !isSimplified ? "text-white" : ""
                    )}>
                      {achievement.name}
                    </h3>
                    
                    <p className={cn(
                      "text-sm mb-4",
                      !isSimplified ? "text-gray-300" : "text-muted-foreground"
                    )}>
                      {achievement.description}
                    </p>
                    
                    {achievement.unlockedAt && (
                      <div className={cn(
                        "text-xs",
                        !isSimplified ? "text-gray-400" : "text-muted-foreground"
                      )}>
                        Desbloqueado: {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </AchievementCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

