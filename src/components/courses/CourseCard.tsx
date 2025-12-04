import { Card } from '@/components/ui/card'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Course, UserProgress } from '@/lib/types'
import { Check, Circle, Clock, Lightning, Target } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'
import { cn } from '@/lib/utils'

interface CourseCardProps {
  course: Course
  progress?: UserProgress
  onSelect: () => void
}

export function CourseCard({ course, progress, onSelect }: CourseCardProps) {
  const { preferences } = useAccessibilityPreferences()
  const isSimplified = preferences.simplifiedMode

  const getStatusBadge = () => {
    if (!progress || progress.status === 'not-started') {
      return (
        <Badge variant="secondary" className="gap-1.5">
          <Circle size={12} weight="fill" aria-hidden="true" />
          Not Started
        </Badge>
      )
    }
    if (progress.status === 'completed') {
      return (
        <Badge className="gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <Check size={12} weight="bold" aria-hidden="true" />
          Completed
        </Badge>
      )
    }
    return (
      <Badge className="gap-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">
        <Clock size={12} weight="fill" aria-hidden="true" />
        In Progress
      </Badge>
    )
  }

  const progressPercentage = progress
    ? Math.round((progress.completedModules.length / course.modules.length) * 100)
    : 0

  const xpReward = course.modules.length * 50 + 200

  const CardComponent = isSimplified ? Card : GlassCard

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <CardComponent
        textOverlay={!isSimplified}
        className={cn(
          "group flex h-full flex-col overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary",
          isSimplified ? "bg-gradient-to-br from-card to-card/50 hover:shadow-xl hover:border-primary/50" : ""
        )}
        tabIndex={0}
        role="article"
        aria-labelledby={`course-title-${course.id}`}
      >
        <div className={cn(
          "flex flex-1 flex-col gap-4 p-6 relative z-10",
          !isSimplified && "text-white"
        )}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl" role="img" aria-label="Course icon">
                {course.coverImage}
              </span>
              <h3 
                id={`course-title-${course.id}`} 
                className={cn(
                  "text-xl font-bold",
                  !isSimplified && "text-white drop-shadow-lg"
                )}
              >
                {course.title}
              </h3>
            </div>
            {getStatusBadge()}
          </div>

          <p className={cn(
            "flex-1 text-base line-clamp-2",
            isSimplified ? "text-muted-foreground" : "text-gray-200 drop-shadow"
          )}>
            {course.description}
          </p>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className={cn(
                "flex items-center gap-1.5",
                isSimplified ? "text-muted-foreground" : "text-gray-300"
              )}>
                <Clock size={16} aria-hidden="true" />
                <span>{course.estimatedTime} min</span>
              </div>
              <div className={cn(
                "flex items-center gap-1.5",
                isSimplified ? "text-muted-foreground" : "text-gray-300"
              )}>
                <Target size={16} weight="fill" aria-hidden="true" />
                <span>{course.modules.length} modules</span>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 font-semibold",
                isSimplified ? "text-xp" : "text-tech-cyan"
              )}>
                <Lightning size={16} weight="fill" aria-hidden="true" />
                <span>+{xpReward} XP</span>
              </div>
            </div>

            {progress && progress.status !== 'not-started' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className={cn(
                    "font-medium",
                    isSimplified ? "" : "text-gray-300"
                  )}>
                    Progress
                  </span>
                  <span className={cn(
                    "font-bold",
                    isSimplified ? "text-primary" : "hud-counter text-white"
                  )}>
                    {progressPercentage}%
                  </span>
                </div>
                {isSimplified ? (
                  <Progress value={progressPercentage} className="h-2" aria-label={`Course progress: ${progressPercentage}%`} />
                ) : (
                  <div className="hud-progress-bar">
                    <div 
                      className="hud-progress-bar-fill" 
                      style={{ width: `${progressPercentage}%` }}
                      aria-label={`Course progress: ${progressPercentage}%`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={onSelect}
            className={cn(
              "mt-2 w-full transition-all",
              isSimplified 
                ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                : "bg-gradient-to-r from-tech-cyan to-tech-cyan-dark hover:from-tech-cyan-dark hover:to-tech-cyan text-white border-0 shadow-lg shadow-tech-cyan/50"
            )}
            size="lg"
          >
            {!progress || progress.status === 'not-started' ? '🚀 Start Quest' : '⚡ Continue Quest'}
          </Button>
        </div>
      </CardComponent>
    </motion.div>
  )
}
