/**
 * Example: Backend Courses Page
 * 
 * This is an example component showing how to use the backend API
 * to fetch and display courses. You can use this as a reference
 * to migrate other components.
 */

import { useBackendCourses } from '@/hooks/use-backend-courses'
import { useTenant } from '@/contexts/TenantContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function BackendCoursesExample() {
  const { currentTenant } = useTenant()
  const { courses, loading, error, refresh } = useBackendCourses()

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <h2 className="text-2xl font-bold">Loading Courses...</h2>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive p-6">
          <h2 className="text-lg font-bold text-destructive">Error Loading Courses</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={refresh} variant="outline" className="mt-4">
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Courses from Backend API
          </h2>
          <p className="text-sm text-muted-foreground">
            Tenant: {currentTenant?.name} ({currentTenant?.id})
          </p>
        </div>
        <Button onClick={refresh} variant="outline">
          Refresh
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No courses found for this tenant.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add courses via backend CLI: npm run create-course
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <Card key={course.id} className="p-6 space-y-3">
              <h3 className="text-lg font-semibold">{course.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  ⏱️ {course.estimatedHours}h
                </span>
                <span>
                  🎯 {course.difficulty}
                </span>
                <span>
                  {course.published ? '✅ Published' : '📝 Draft'}
                </span>
              </div>

              <div className="pt-2">
                <p className="text-sm">
                  <strong>Creator:</strong> {course.createdBy}
                </p>
                <p className="text-sm text-muted-foreground">
                  XP: {course.totalXP} | Category: {course.category}
                </p>
              </div>

              <Button className="w-full" variant="outline">
                View Course
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-muted/50 p-6">
        <h3 className="text-lg font-semibold mb-3">🧪 API Test Info</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ Backend URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api'}</li>
          <li>✅ Tenant ID: {currentTenant?.id}</li>
          <li>✅ Courses loaded: {courses.length}</li>
          <li>✅ Using: BackendCourseService + ApiService</li>
        </ul>
      </Card>
    </div>
  )
}
