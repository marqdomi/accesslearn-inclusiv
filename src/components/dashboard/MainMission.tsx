import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  
  if (!course) {
    return (
      <Card className="p-8 border-2 border-dashed border-muted text-center">
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Target size={32} className="text-muted-foreground" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">{t('dashboard.noActiveMission')}</h2>
            <p className="text-muted-foreground">
              {t('dashboard.noActiveMissionDescription')}
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
      <Card className="overflow-hidden border-2 border-primary bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="gap-1.5 px-3 py-1">
                  <Target size={16} weight="fill" aria-hidden="true" />
                  <span className="font-bold">
                    {isCompleted ? t('dashboard.missionComplete') : t('dashboard.currentMissionLabel')}
                  </span>
                </Badge>
              </div>
              <h2 className="text-3xl font-bold mb-2 leading-tight">
                {t('dashboard.mission')} {course.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {course.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">
                <span className="font-bold text-foreground">{course.estimatedTime} {t('time.min')}</span>
                <span className="text-muted-foreground"> {t('dashboard.estimated')}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lightning size={20} weight="fill" className="text-xp" aria-hidden="true" />
              <span className="text-sm font-medium">
                <span className="font-bold text-xp">+50 {t('gamification.xp')}</span>
                <span className="text-muted-foreground"> {t('dashboard.perModule')}</span>
              </span>
            </div>
          </div>

          {!isCompleted && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Mission Progress</span>
                <span className="text-sm font-bold text-primary">{Math.floor(completionPercent)}%</span>
              </div>
              <Progress 
                value={completionPercent} 
                className="h-3 bg-muted"
                aria-label={`Mission progress: ${Math.floor(completionPercent)}% complete`}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {progress?.completedModules.length || 0} of {course.modules.length} {t('dashboard.modules').toLowerCase()} {t('dashboard.completed').toLowerCase()}
              </p>
            </div>
          )}

          <Button 
            size="lg" 
            onClick={onContinue}
            className="w-full sm:w-auto gap-2 text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <PlayCircle size={24} weight="fill" aria-hidden="true" />
            {isCompleted ? t('dashboard.replayMission') : progress?.status === 'in-progress' ? t('dashboard.continue') : t('dashboard.startMission')}
          </Button>
        </div>

        {isCompleted && (
          <div className="bg-gradient-to-r from-success/20 via-accent/20 to-primary/20 px-8 py-4 border-t-2 border-success/30">
            <p className="text-center font-bold text-success-foreground">
              🎉 Mission accomplished! You've mastered this course. Ready for the next challenge?
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
