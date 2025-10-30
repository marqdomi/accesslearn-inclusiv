import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Course, UserProgress } from '@/lib/types'
import { CourseCard } from './CourseCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MagnifyingGlass, SquaresFour, ListBullets } from '@phosphor-icons/react'

interface CourseDashboardProps {
  courses: Course[]
  onSelectCourse: (course: Course) => void
}

export function CourseDashboard({ courses, onSelectCourse }: CourseDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'not-started' | 'in-progress' | 'completed'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [allProgress] = useKV<Record<string, UserProgress>>('all-course-progress', {})

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter === 'all') return true

    const progress = allProgress?.[`course-progress-${course.id}`]
    if (!progress) return statusFilter === 'not-started'

    return progress.status === statusFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-4xl font-bold">My Learning</h1>
        <p className="text-lg text-muted-foreground">
          Continue your learning journey
        </p>
      </div>

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
        <div
          className={
            viewMode === 'grid'
              ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-4'
          }
        >
          {filteredCourses.map((course) => {
            const progress = allProgress?.[`course-progress-${course.id}`]
            return (
              <CourseCard
                key={course.id}
                course={course}
                progress={progress}
                onSelect={() => onSelectCourse(course)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
