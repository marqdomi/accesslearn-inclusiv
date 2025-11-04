import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Course, UserProgress } from '@/lib/types'
import { PlayCircle, Clock, Lightning, Target } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface MainMissionProps {
  course: Course | null
  progress: UserProgress | null
  onContinue: () => void
}

export function MainMission({ course, progress, onContinue }: MainMissionProps) {
  if (!course) {
    return (
      <Card className="learner-card p-10 border-2 border-dashed border-primary/30 text-center bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          <motion.div 
            className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Target size={40} className="text-primary" aria-hidden="true" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold mb-2 learner-heading">No Active Mission 🎯</h2>
            <p className="text-muted-foreground text-lg">
              Choose your next adventure from the missions below!
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const completionPercent = progress 
    ? (progress.completedModules.length / course.modules.length) * 100 
    : 0

  const isCompleted = progress?.status === 'completed'

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <Card className="learner-card overflow-hidden border-3 border-primary/50 bg-gradient-to-br from-primary/10 via-secondary/8 to-accent/10 relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" aria-hidden="true" />
        
        <div className="p-8 relative z-10">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default" className="learner-badge gap-2 px-4 py-1.5 text-base bg-gradient-to-r from-primary to-secondary">
                  <Target size={18} weight="fill" aria-hidden="true" />
                  <span className="font-bold">
                    {isCompleted ? '✨ MISSION COMPLETE' : '🎮 CURRENT MISSION'}
                  </span>
                </Badge>
              </div>
              <h2 className="text-4xl font-bold mb-3 leading-tight learner-heading">
                {course.title}
              </h2>
              <p className="text-foreground/80 text-lg font-medium">
                {course.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full border border-primary/20">
              <Clock size={22} className="text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">
                <span className="font-bold text-foreground text-base">{course.estimatedTime} min</span>
                <span className="text-muted-foreground"> estimated</span>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-4 py-2 rounded-full border border-green-500/30">
              <Lightning size={22} weight="fill" className="text-green-600" aria-hidden="true" />
              <span className="text-sm font-medium">
                <span className="font-bold text-green-700 text-base">+50 XP</span>
                <span className="text-muted-foreground"> per module</span>
              </span>
            </div>
          </div>

          {!isCompleted && (
            <div className="mb-6 bg-card/30 p-4 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="text-xl">🚀</span> Mission Progress
                </span>
                <span className="text-lg font-bold text-primary">{Math.floor(completionPercent)}%</span>
              </div>
              <div className="h-4 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="learner-progress-bar h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  aria-label={`Mission progress: ${Math.floor(completionPercent)}% complete`}
                  role="progressbar"
                  aria-valuenow={Math.floor(completionPercent)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">
                {progress?.completedModules.length || 0} of {course.modules.length} modules completed 🎯
              </p>
            </div>
          )}

          <Button 
            size="lg" 
            onClick={onContinue}
            className="learner-button learner-focus w-full sm:w-auto gap-3 text-lg h-16 px-10 font-bold shadow-xl hover:shadow-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            <PlayCircle size={28} weight="fill" aria-hidden="true" />
            {isCompleted ? '🔄 Review Mission' : progress?.status === 'in-progress' ? '⚡ Continue Adventure!' : '🚀 Start Mission!'}
          </Button>
        </div>

        {isCompleted && (
          <div className="bg-gradient-to-r from-green-500/30 via-emerald-500/30 to-teal-500/30 px-8 py-6 border-t-4 border-green-500/50">
            <p className="text-center text-lg font-bold text-foreground flex items-center justify-center gap-2">
              <span className="text-2xl">🎉</span>
              Mission accomplished! You've mastered this course. Ready for the next challenge?
              <span className="text-2xl">🏆</span>
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
