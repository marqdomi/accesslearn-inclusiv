import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Course, UserProgress } from '@/lib/types'
import { PlayerIdentity } from './PlayerIdentity'
import { MainMission } from './MainMission'
import { ProgressGoals } from './ProgressGoals'
import { SideMissions } from './SideMissions'
import { QuickAccessibilitySettings } from './QuickAccessibilitySettings'
import { motion } from 'framer-motion'

interface UserDashboardProps {
  courses: Course[]
  onSelectCourse: (course: Course) => void
  userId?: string
}

export function UserDashboard({ courses, onSelectCourse, userId }: UserDashboardProps) {
  const userKey = userId || 'default-user'
  const [courseProgress] = useKV<Record<string, UserProgress>>(`course-progress-${userKey}`, {})

  const mainMissionCourse = useMemo(() => {
    if (!courseProgress) return null

    const inProgressCourses = courses.filter(course => {
      const progress = courseProgress[course.id]
      return progress?.status === 'in-progress'
    })

    if (inProgressCourses.length > 0) {
      return inProgressCourses.sort((a, b) => {
        const aProgress = courseProgress[a.id]
        const bProgress = courseProgress[b.id]
        return (bProgress?.lastAccessed || 0) - (aProgress?.lastAccessed || 0)
      })[0]
    }

    const notStartedCourses = courses.filter(course => {
      const progress = courseProgress[course.id]
      return !progress || progress.status === 'not-started'
    })

    return notStartedCourses[0] || null
  }, [courses, courseProgress])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PlayerIdentity userId={userId} />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <section aria-labelledby="main-mission-heading">
            <h2 id="main-mission-heading" className="sr-only">Current Mission</h2>
            <MainMission
              course={mainMissionCourse}
              progress={mainMissionCourse && courseProgress ? courseProgress[mainMissionCourse.id] : null}
              onContinue={() => mainMissionCourse && onSelectCourse(mainMissionCourse)}
            />
          </section>

          <section aria-labelledby="side-missions-heading">
            <h2 id="side-missions-heading" className="sr-only">Available Courses</h2>
            <SideMissions
              courses={courses}
              progress={courseProgress || {}}
              onSelectCourse={onSelectCourse}
              excludeCourseId={mainMissionCourse?.id}
            />
          </section>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <section aria-labelledby="progress-goals-heading">
            <h2 id="progress-goals-heading" className="sr-only">Progress and Achievements</h2>
            <ProgressGoals userId={userId} />
          </section>

          <section aria-labelledby="accessibility-settings-heading">
            <h2 id="accessibility-settings-heading" className="sr-only">Accessibility Settings</h2>
            <QuickAccessibilitySettings />
          </section>
        </motion.div>
      </div>
    </div>
  )
}
