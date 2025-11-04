import { useState, useEffect } from 'react'
import { Course, UserProgress } from '@/lib/types'
import { CourseCard } from './CourseCard'
import { GameStatsWidget } from '@/components/gamification/GameStatsWidget'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MagnifyingGlass, SquaresFour, ListBullets } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { UserProgressService } from '@/services'

interface CourseDashboardProps {
  courses: Course[]
  onSelectCourse: (course: Course) => void
  onViewAchievements?: () => void
}

export function CourseDashboard({ courses, onSelectCourse, onViewAchievements }: CourseDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'not-started' | 'in-progress' | 'completed'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [allProgress, setAllProgress] = useState<Record<string, UserProgress>>({})
  const [loading, setLoading] = useState(true)

  // Load all progress for current user
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual user ID from auth context
        // For now using placeholder - should be replaced with useAuth() or similar
        const userId = 'current-user'
        const progressList = await UserProgressService.getByUserId(userId)
        
        // Convert array to map for easier lookup
        const progressMap: Record<string, UserProgress> = {}
        progressList.forEach(progress => {
          progressMap[progress.courseId] = progress
        })
        setAllProgress(progressMap)
      } catch (error) {
        console.error('Failed to load progress:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProgress()
  }, [])

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter === 'all') return true

    const progress = allProgress?.[course.id]
    if (!progress) return statusFilter === 'not-started'

    return progress.status === statusFilter
  })

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          My Learning Quest
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete courses, earn XP, and unlock achievements! 🚀
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GameStatsWidget />
      </motion.div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-md">
          <MagnifyingGlass
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search courses"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <SquaresFour size={20} aria-hidden="true" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <ListBullets size={20} aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="all" className="flex-1 md:flex-none">
            All Courses
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex-1 md:flex-none">
            In Progress
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 md:flex-none">
            Completed
          </TabsTrigger>
          <TabsTrigger value="not-started" className="flex-1 md:flex-none">
            Not Started
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredCourses.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">No courses found matching your criteria.</p>
        </div>
      ) : (
        <motion.div
          className={
            viewMode === 'grid'
              ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-4'
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredCourses.map((course, index) => {
            const progress = allProgress?.[`course-progress-${course.id}`]
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <CourseCard
                  course={course}
                  progress={progress}
                  onSelect={() => onSelectCourse(course)}
                />
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
