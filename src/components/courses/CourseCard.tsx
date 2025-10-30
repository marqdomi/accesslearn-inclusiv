import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Course, UserProgress } from '@/lib/types'
import { Check, Circle, Clock, Lightning, Target } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface CourseCardProps {
  course: Course
  progress?: UserProgress
  onSelect: () => void
}

export function CourseCard({ course, progress, onSelect }: CourseCardProps) {
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

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        className="group flex h-full flex-col overflow-hidden transition-all hover:shadow-xl hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary bg-gradient-to-br from-card to-card/50"
        tabIndex={0}
        role="article"
        aria-labelledby={`course-title-${course.id}`}
      >
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl" role="img" aria-label="Course icon">
                {course.coverImage}
              </span>
              <h3 id={`course-title-${course.id}`} className="text-xl font-bold">
                {course.title}
              </h3>
            </div>
            {getStatusBadge()}
          </div>

          <p className="flex-1 text-base text-muted-foreground line-clamp-2">{course.description}</p>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock size={16} aria-hidden="true" />
                <span>{course.estimatedTime} min</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Target size={16} weight="fill" aria-hidden="true" />
                <span>{course.modules.length} modules</span>
              </div>
              <div className="flex items-center gap-1.5 text-xp font-semibold">
                <Lightning size={16} weight="fill" aria-hidden="true" />
                <span>+{xpReward} XP</span>
              </div>
            </div>

            {progress && progress.status !== 'not-started' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="text-primary font-bold">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" aria-label={`Course progress: ${progressPercentage}%`} />
              </div>
            )}
          </div>

          <Button
            onClick={onSelect}
            className="mt-2 w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all"
            size="lg"
          >
            {!progress || progress.status === 'not-started' ? '🚀 Start Quest' : '⚡ Continue Quest'}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
