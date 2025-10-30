import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { CourseStructure } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, MagnifyingGlass, PencilSimple, Trash, Eye } from '@phosphor-icons/react'
import { CourseBuilder } from './CourseBuilder'

interface CourseManagementProps {
  onBack: () => void
}

export function CourseManagement({ onBack }: CourseManagementProps) {
  const [courses, setCourses] = useKV<CourseStructure[]>('admin-courses', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const filteredCourses = (courses || []).filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const deleteCourse = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses((current) => (current || []).filter(c => c.id !== courseId))
    }
  }

  if (isCreating || editingCourseId) {
    return (
      <CourseBuilder
        courseId={editingCourseId || undefined}
        onBack={() => {
          setIsCreating(false)
          setEditingCourseId(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Course Management</h2>
            <p className="text-sm text-muted-foreground">
              {courses?.length || 0} total courses
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2" size={18} />
          Create New Course
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No courses found matching your search' : 'No courses created yet'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2" size={18} />
                Create Your First Course
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant={course.published ? 'default' : 'secondary'}>
                    {course.published ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge variant="outline">{course.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Modules:</span>
                    <span className="font-medium text-foreground">{course.modules.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total XP:</span>
                    <span className="font-medium text-foreground">{course.totalXP}</span>
                  </div>
                  {course.estimatedHours > 0 && (
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium text-foreground">{course.estimatedHours}h</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditingCourseId(course.id)}
                  >
                    <PencilSimple className="mr-1" size={14} />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteCourse(course.id)}
                  >
                    <Trash size={14} className="text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
