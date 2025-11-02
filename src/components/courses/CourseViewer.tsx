import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Course, UserProgress, AuthSession, UserProfile } from '@/lib/types'
import { LessonModule } from '@/lib/lesson-types'
import { useCourseProgress } from '@/hooks/use-course-progress'
import { useXP, XP_REWARDS } from '@/hooks/use-xp'
import { useAchievements } from '@/hooks/use-achievements'
import { useMentorXP } from '@/hooks/use-mentor-xp'
import { useMentorship } from '@/hooks/use-mentorship'
import { useTranslation } from '@/lib/i18n'
import { translateLessonModule } from '@/lib/translate-course'
import { ContentViewer } from './ContentViewer'
import { AssessmentModule } from './AssessmentModule'
import { LessonViewer } from './LessonViewer'
import { QandAForum } from './QandAForum'
import { CourseReviewsSection } from './CourseReviewsSection'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Check, ListBullets, GraduationCap, ChatCircle, Star } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface CourseViewerProps {
  course: Course
  onExit: () => void
  userId?: string
}

export function CourseViewer({ course, onExit, userId }: CourseViewerProps) {
  const { t } = useTranslation()
  const { progress, markModuleComplete, setCurrentModule, completeCourse, recordAssessmentAttempt } = useCourseProgress(course.id, userId, course.title)
  const { awardXP } = useXP(userId)
  const { updateModuleCompletion, updateCourseCompletion, updateAssessmentCompletion } = useAchievements(userId)
  const { awardMentorBonus } = useMentorXP()
  const { getMenteePairing } = useMentorship()
  const [showAssessment, setShowAssessment] = useState(false)
  const [showModuleList, setShowModuleList] = useState(false)
  const [lessonModules] = useKV<Record<string, LessonModule>>('lesson-modules', {})
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'intro' | 'lessons' | 'modules'>('intro')
  const [courses] = useKV<Course[]>('courses', [])
  const [courseProgress] = useKV<Record<string, UserProgress>>(`course-progress-${userId || 'default-user'}`, {})
  const [session] = useKV<AuthSession>('auth-session', {} as AuthSession)
  const [userProfile] = useKV<UserProfile>(`user-profile-${userId || 'default-user'}`, {} as UserProfile)
  const [activeTab, setActiveTab] = useState<'modules' | 'qanda' | 'reviews'>('modules')

  const lessonModule = lessonModules?.[course.id]
  const translatedLessonModule = useMemo(() => {
    return lessonModule ? translateLessonModule(lessonModule, t) : undefined
  }, [lessonModule, t])
  const hasLessons = !!translatedLessonModule && translatedLessonModule.lessons.length > 0

  const nextUncompletedCourse = useMemo(() => {
    if (!courses || !courseProgress) return null
    
    const uncompletedCourses = courses.filter(c => {
      const prog = courseProgress[c.id]
      return !prog || prog.status !== 'completed'
    })
    
    const firstNotStarted = uncompletedCourses.find(c => {
      const prog = courseProgress[c.id]
      return !prog || prog.status === 'not-started'
    })
    
    return firstNotStarted || uncompletedCourses[0] || null
  }, [courses, courseProgress])

  const currentModuleIndex = progress?.currentModule
    ? course.modules.findIndex((m) => m.id === progress.currentModule)
    : 0

  const validIndex = currentModuleIndex >= 0 ? currentModuleIndex : 0
  const currentModule = course.modules[validIndex]

  useEffect(() => {
    if (currentModule && (!progress?.currentModule || progress.currentModule !== currentModule.id)) {
      setCurrentModule(currentModule.id)
    }
  }, [currentModule, progress?.currentModule, setCurrentModule])

  const handleModuleComplete = () => {
    markModuleComplete(currentModule.id)
    updateModuleCompletion()
    awardXP(XP_REWARDS.MODULE_COMPLETE, `Completed module: ${currentModule.title}`)
    
    toast.success(t('courseViewer.moduleComplete'), {
      description: t('courseViewer.moduleCompleteDesc', { title: currentModule.title }),
    })

    if (validIndex < course.modules.length - 1) {
      handleNext()
    } else if (course.assessment && course.assessment.length > 0) {
      setShowAssessment(true)
    } else {
      completeCourse()
      updateCourseCompletion()
      const courseXP = XP_REWARDS.COURSE_COMPLETE
      awardXP(courseXP, `Completed course: ${course.title}`)
      
      if (userId) {
        awardMentorBonus(userId, courseXP)
      }
      
      toast.success(t('courseViewer.courseComplete'), {
        description: t('courseViewer.courseCompleteDesc', { title: course.title }),
      })
    }
  }

  const handleNext = () => {
    if (validIndex < course.modules.length - 1) {
      const nextModule = course.modules[validIndex + 1]
      setCurrentModule(nextModule.id)
    }
  }

  const handlePrevious = () => {
    if (validIndex > 0) {
      const prevModule = course.modules[validIndex - 1]
      setCurrentModule(prevModule.id)
    }
  }

  const handleJumpToModule = (moduleId: string) => {
    setCurrentModule(moduleId)
    setShowModuleList(false)
  }

  const handleAssessmentComplete = (score: number) => {
    const isAlreadyCompleted = progress?.status === 'completed'
    const isFirstAttempt = !progress?.assessmentAttempts || progress.assessmentAttempts === 0
    
    recordAssessmentAttempt(score)
    completeCourse(score)
    updateAssessmentCompletion(score, isFirstAttempt)
    updateCourseCompletion()
    
    let totalXPAwarded = 0
    
    if (!isAlreadyCompleted && score >= 70) {
      const xpAmount = score === 100 
        ? XP_REWARDS.ASSESSMENT_FINAL_PERFECT 
        : XP_REWARDS.ASSESSMENT_FINAL_PASS
      
      const xpReason = score === 100 
        ? `Perfect score on ${course.title}!` 
        : `Passed assessment: ${course.title}`
      awardXP(xpAmount, xpReason)
      totalXPAwarded += xpAmount
      
      if (isFirstAttempt) {
        awardXP(XP_REWARDS.FIRST_TRY_BONUS, 'First try bonus!')
        totalXPAwarded += XP_REWARDS.FIRST_TRY_BONUS
      }
      
      const courseXP = XP_REWARDS.COURSE_COMPLETE
      awardXP(courseXP, `Completed course: ${course.title}`)
      totalXPAwarded += courseXP
      
      if (userId) {
        awardMentorBonus(userId, totalXPAwarded)
      }
    }
    
    const emoji = score === 100 ? '🌟' : score >= 90 ? '🎉' : score >= 70 ? '✅' : '💪'
    const message = score === 100 
      ? 'Perfect Score!' 
      : score >= 90 
        ? 'Excellent Work!' 
        : score >= 70 
          ? 'Assessment Passed!' 
          : 'Keep Learning!'
    
    toast.success(`${emoji} ${message}`, {
      description: isAlreadyCompleted && score >= 70
        ? `You scored ${score}% (review mode - no XP awarded)`
        : `You scored ${score}% on "${course.title}"`,
    })
  }

  const progressPercentage = progress
    ? Math.round((progress.completedModules.length / course.modules.length) * 100)
    : 0

  const handleReturnToDashboard = () => {
    onExit()
  }

  const handleNextCourse = () => {
    if (nextUncompletedCourse) {
      window.location.reload()
    } else {
      onExit()
    }
  }

  const handleLessonComplete = () => {
    if (hasLessons && translatedLessonModule && currentLessonIndex < translatedLessonModule.lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1)
    } else {
      setViewMode('intro')
      toast.success('All lessons completed!', {
        description: 'Continue with the course modules or take the assessment.',
      })
    }
  }

  const handleStartLessons = () => {
    setViewMode('lessons')
    setCurrentLessonIndex(0)
  }

  if (viewMode === 'lessons' && hasLessons && translatedLessonModule) {
    const currentLesson = translatedLessonModule.lessons[currentLessonIndex]
    return (
      <LessonViewer
        lesson={currentLesson}
        onComplete={handleLessonComplete}
        onExit={() => setViewMode('intro')}
      />
    )
  }

  if (showAssessment && course.assessment) {
    const isAlreadyCompleted = progress?.status === 'completed'
    
    return (
      <div className="mx-auto max-w-3xl">
        {isAlreadyCompleted ? (
          <div className="mb-6 p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>{t('assessment.reviewMode')}:</strong> {t('assessment.reviewModeNote')}
            </p>
          </div>
        ) : (
          <Button
            onClick={() => setShowAssessment(false)}
            variant="ghost"
            className="mb-6 gap-2"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            {t('assessment.backToCourse')}
          </Button>
        )}

        <AssessmentModule 
          assessments={course.assessment} 
          onComplete={handleAssessmentComplete}
          onReturnToDashboard={handleReturnToDashboard}
          onNextCourse={nextUncompletedCourse ? handleNextCourse : undefined}
          isAlreadyCompleted={isAlreadyCompleted}
        />
      </div>
    )
  }

  if (viewMode === 'intro' && hasLessons) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={onExit} variant="ghost" className="gap-2">
            <ArrowLeft size={20} aria-hidden="true" />
            Back to Courses
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-4xl">
                {course.coverImage}
              </div>
              <div className="flex-1">
                <h1 className="mb-2 text-4xl font-bold">{course.title}</h1>
                <p className="text-lg text-muted-foreground">
                  {course.description}
                </p>
              </div>
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Overall Progress</span>
                <span className="text-muted-foreground">{progressPercentage}%</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-3"
                aria-label={`Course progress: ${progressPercentage}%`}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-6">
                <div className="mb-3 flex items-center gap-3">
                  <GraduationCap size={32} weight="fill" className="text-primary" aria-hidden="true" />
                  <h2 className="text-xl font-bold">Interactive Lessons</h2>
                </div>
                <p className="mb-4 text-muted-foreground">
                  {translatedLessonModule?.lessons.length || 0} engaging lessons with challenges and activities
                </p>
                <Button 
                  onClick={handleStartLessons} 
                  className="w-full gap-2"
                  size="lg"
                >
                  Start Learning
                  <Check size={20} aria-hidden="true" />
                </Button>
              </Card>

              <Card className="p-6">
                <div className="mb-3 flex items-center gap-3">
                  <ListBullets size={32} weight="fill" className="text-secondary" aria-hidden="true" />
                  <h2 className="text-xl font-bold">Course Modules</h2>
                </div>
                <p className="mb-4 text-muted-foreground">
                  {course.modules.length} detailed modules covering all topics
                </p>
                <Button 
                  onClick={() => setViewMode('modules')} 
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                >
                  View Modules
                  <ArrowLeft size={20} className="rotate-180" aria-hidden="true" />
                </Button>
              </Card>
            </div>

            {course.assessment && course.assessment.length > 0 && (
              <Card className="mt-4 border-2 border-accent/30 bg-accent/5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Final Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Test your knowledge with {course.assessment.length} questions
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAssessment(true)}
                    variant="default"
                    className="gap-2"
                  >
                    Take Assessment
                  </Button>
                </div>
              </Card>
            )}
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Button onClick={onExit} variant="ghost" className="gap-2">
          <ArrowLeft size={20} aria-hidden="true" />
          {t('courseViewer.backToCourses')}
        </Button>

        <Button
          onClick={() => setShowModuleList(!showModuleList)}
          variant="outline"
          className="gap-2"
          aria-expanded={showModuleList}
        >
          <ListBullets size={20} aria-hidden="true" />
          {t('courseViewer.moduleList')}
        </Button>
      </div>

      <Card className="mb-6 p-6">
        <h1 className="mb-2 text-3xl font-bold">{course.title}</h1>
        <p className="mb-4 text-lg text-muted-foreground">{course.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{t('course.progress')}</span>
            <span className="text-muted-foreground">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} aria-label={`Course progress: ${progressPercentage}%`} />
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'modules' | 'qanda' | 'reviews')} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules" className="gap-2">
            <ListBullets size={20} />
            {t('course.modules')}
          </TabsTrigger>
          <TabsTrigger value="qanda" className="gap-2">
            <ChatCircle size={20} />
            {t('qanda.tab')}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <Star size={20} />
            {t('reviews.tab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="mt-6">
          {showModuleList && (
            <Card className="mb-6 p-6">
              <h2 className="mb-4 text-xl font-semibold">{t('courseViewer.moduleList')}</h2>
              <div className="space-y-2">
                {course.modules.map((module, index) => {
                  const isCompleted = progress?.completedModules.includes(module.id)
                  const isCurrent = module.id === currentModule.id

                  return (
                    <button
                      key={module.id}
                      onClick={() => handleJumpToModule(module.id)}
                      className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                        isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isCompleted
                            ? 'bg-success text-success-foreground'
                            : isCurrent
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? <Check size={16} weight="bold" aria-label="Completed" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{module.title}</p>
                        {module.duration && (
                          <p className="text-sm text-muted-foreground">{module.duration} min</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          )}

          <ContentViewer
            module={currentModule}
            onComplete={handleModuleComplete}
            onNext={handleNext}
            onPrevious={handlePrevious}
            hasNext={validIndex < course.modules.length - 1}
            hasPrevious={validIndex > 0}
            currentIndex={validIndex}
            totalModules={course.modules.length}
          />
        </TabsContent>

        <TabsContent value="qanda" className="mt-6">
          <QandAForum 
            course={course} 
            userId={userId || 'default-user'} 
            userRole={session?.role}
          />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <CourseReviewsSection
            courseId={course.id}
            userId={userId || 'default-user'}
            userName={userProfile?.displayName || userProfile?.firstName || 'Anonymous'}
            userAvatar={userProfile?.avatar}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
