import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ArrowLeft, 
  Plus, 
  MagnifyingGlass, 
  PencilSimple, 
  Trash, 
  Eye,
  Copy,
  UploadSimple,
  Archive,
  Funnel,
  GridFour,
  ListBullets,
  SortAscending,
  SortDescending,
} from '@phosphor-icons/react'
import { CourseEditor } from './CourseEditor'
import CoursePreview from './CoursePreview'
import { 
  CourseManagementService, 
  Course, 
  CourseStatus, 
  CourseDifficulty,
  CourseStats,
} from '@/services/course-management-service'
import { Checkbox } from '@/components/ui/checkbox'

interface CourseManagementProps {
  onBack: () => void
}

type ViewMode = 'grid' | 'table'
type SortField = 'title' | 'category' | 'status' | 'createdAt' | 'updatedAt'
type SortDirection = 'asc' | 'desc'

export function CourseManagement({ onBack }: CourseManagementProps) {
  // State
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<CourseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<CourseDifficulty | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set())
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [previewCourseId, setPreviewCourseId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Load courses and stats
  useEffect(() => {
    loadCourses()
    loadStats()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await CourseManagementService.getAllCourses()
      setCourses(data)
    } catch (error) {
      console.error('Failed to load courses:', error)
      alert('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await CourseManagementService.getCourseStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(courses.map(c => c.category).filter(Boolean))
    return Array.from(cats).sort()
  }, [courses])

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = [...courses]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        (course.tags && course.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter)
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(course => course.difficulty === difficultyFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [courses, searchQuery, statusFilter, categoryFilter, difficultyFilter, sortField, sortDirection])

  // Pagination
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedCourses.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedCourses, currentPage])

  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage)

  // Actions
  const handleDelete = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (course?.status === 'published') {
      alert('Cannot delete a published course. Unpublish it first.')
      return
    }

    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await CourseManagementService.deleteCourse(courseId)
        await loadCourses()
        await loadStats()
        alert('Course deleted successfully')
      } catch (error) {
        console.error('Delete failed:', error)
        alert('Failed to delete course')
      }
    }
  }

  const handleDuplicate = async (courseId: string) => {
    if (confirm('Duplicate this course?')) {
      try {
        await CourseManagementService.duplicateCourse(courseId)
        await loadCourses()
        await loadStats()
        alert('Course duplicated successfully')
      } catch (error) {
        console.error('Duplicate failed:', error)
        alert('Failed to duplicate course')
      }
    }
  }

  const handlePublish = async (courseId: string) => {
    try {
      const validation = await CourseManagementService.canPublish(courseId)
      if (!validation.valid) {
        alert(`Cannot publish: ${validation.errors.join(', ')}`)
        return
      }

      await CourseManagementService.publishCourse(courseId)
      await loadCourses()
      await loadStats()
      alert('Course published successfully')
    } catch (error) {
      console.error('Publish failed:', error)
      alert('Failed to publish course')
    }
  }

  const handleUnpublish = async (courseId: string) => {
    if (confirm('Unpublish this course?')) {
      try {
        await CourseManagementService.unpublishCourse(courseId)
        await loadCourses()
        await loadStats()
        alert('Course unpublished successfully')
      } catch (error) {
        console.error('Unpublish failed:', error)
        alert('Failed to unpublish course')
      }
    }
  }

  const handleArchive = async (courseId: string) => {
    if (confirm('Archive this course?')) {
      try {
        await CourseManagementService.archiveCourse(courseId)
        await loadCourses()
        await loadStats()
        alert('Course archived successfully')
      } catch (error) {
        console.error('Archive failed:', error)
        alert('Failed to archive course')
      }
    }
  }

  // Bulk actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCourses(new Set(paginatedCourses.map(c => c.id)))
    } else {
      setSelectedCourses(new Set())
    }
  }

  const handleSelectCourse = (courseId: string, checked: boolean) => {
    const newSelected = new Set(selectedCourses)
    if (checked) {
      newSelected.add(courseId)
    } else {
      newSelected.delete(courseId)
    }
    setSelectedCourses(newSelected)
  }

  const handleBulkPublish = async () => {
    if (selectedCourses.size === 0) return
    if (confirm(`Publish ${selectedCourses.size} selected courses?`)) {
      try {
        await Promise.all(
          Array.from(selectedCourses).map(id => CourseManagementService.publishCourse(id))
        )
        await loadCourses()
        await loadStats()
        setSelectedCourses(new Set())
        alert('Courses published successfully')
      } catch (error) {
        console.error('Bulk publish failed:', error)
        alert('Some courses failed to publish')
      }
    }
  }

  const handleBulkArchive = async () => {
    if (selectedCourses.size === 0) return
    if (confirm(`Archive ${selectedCourses.size} selected courses?`)) {
      try {
        await Promise.all(
          Array.from(selectedCourses).map(id => CourseManagementService.archiveCourse(id))
        )
        await loadCourses()
        await loadStats()
        setSelectedCourses(new Set())
        alert('Courses archived successfully')
      } catch (error) {
        console.error('Bulk archive failed:', error)
        alert('Some courses failed to archive')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCourses.size === 0) return
    const publishedCount = Array.from(selectedCourses).filter(id => 
      courses.find(c => c.id === id)?.status === 'published'
    ).length

    if (publishedCount > 0) {
      alert(`Cannot delete ${publishedCount} published courses. Unpublish them first.`)
      return
    }

    if (confirm(`Delete ${selectedCourses.size} selected courses? This cannot be undone.`)) {
      try {
        await Promise.all(
          Array.from(selectedCourses).map(id => CourseManagementService.deleteCourse(id))
        )
        await loadCourses()
        await loadStats()
        setSelectedCourses(new Set())
        alert('Courses deleted successfully')
      } catch (error) {
        console.error('Bulk delete failed:', error)
        alert('Some courses failed to delete')
      }
    }
  }

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const refreshData = async () => {
    await loadCourses()
    await loadStats()
    setIsCreating(false)
    setEditingCourseId(null)
  }

  if (isCreating || editingCourseId) {
    return (
      <CourseEditor
        courseId={editingCourseId || undefined}
        onBack={refreshData}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading courses...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Course Management</h2>
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedCourses.length} courses {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' ? `(${courses.length} total)` : ''}
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2" size={18} />
          Create New Course
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Courses</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Published</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.published}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Drafts</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.draft}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Archived</CardDescription>
              <CardTitle className="text-3xl text-gray-600">{stats.archived}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filters and View Toggle */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
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

        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as CourseStatus | 'all')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={(val) => setDifficultyFilter(val as CourseDifficulty | 'all')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <GridFour size={18} />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <ListBullets size={18} />
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCourses.size > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950">
          <CardContent className="flex items-center justify-between py-3">
            <span className="font-medium">
              {selectedCourses.size} course{selectedCourses.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleBulkPublish}>
                <UploadSimple className="mr-1" size={14} />
                Publish
              </Button>
              <Button size="sm" variant="outline" onClick={handleBulkArchive}>
                <Archive className="mr-1" size={14} />
                Archive
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                <Trash className="mr-1" size={14} />
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedCourses(new Set())}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredAndSortedCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || difficultyFilter !== 'all'
                ? 'No courses found matching your filters'
                : 'No courses created yet'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2" size={18} />
                Create Your First Course
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={selectedCourses.has(course.id)}
                      onCheckedChange={(checked) => handleSelectCourse(course.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant={course.status === 'published' ? 'default' : course.status === 'archived' ? 'secondary' : 'outline'}>
                      {course.status}
                    </Badge>
                    <Badge variant="outline">{course.category}</Badge>
                    <Badge variant="outline">{course.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex justify-between">
                      <span>Modules:</span>
                      <span className="font-medium text-foreground">{course.moduleCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lessons:</span>
                      <span className="font-medium text-foreground">{course.lessonCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total XP:</span>
                      <span className="font-medium text-foreground">{course.totalXP || 0}</span>
                    </div>
                    {course.estimatedHours > 0 && (
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium text-foreground">{course.estimatedHours}h</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewCourseId(course.id)}
                      title="Preview Course"
                    >
                      <Eye className="mr-1" size={14} />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditingCourseId(course.id)}
                    >
                      <PencilSimple className="mr-1" size={14} />
                      Edit
                    </Button>
                    {course.status === 'draft' ? (
                      <Button size="sm" variant="default" onClick={() => handlePublish(course.id)}>
                        <UploadSimple className="mr-1" size={14} />
                        Publish
                      </Button>
                    ) : course.status === 'published' ? (
                      <Button size="sm" variant="secondary" onClick={() => handleUnpublish(course.id)}>
                        Unpublish
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDuplicate(course.id)}
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(course.id)}
                      title="Delete"
                    >
                      <Trash size={14} className="text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Table View */
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={paginatedCourses.length > 0 && paginatedCourses.every(c => selectedCourses.has(c.id))}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1">
                      Title
                      {sortField === 'title' && (sortDirection === 'asc' ? <SortAscending size={14} /> : <SortDescending size={14} />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-1">
                      Category
                      {sortField === 'category' && (sortDirection === 'asc' ? <SortAscending size={14} /> : <SortDescending size={14} />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortField === 'status' && (sortDirection === 'asc' ? <SortAscending size={14} /> : <SortDescending size={14} />)}
                    </div>
                  </TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead className="text-right">Modules</TableHead>
                  <TableHead className="text-right">Lessons</TableHead>
                  <TableHead className="text-right">XP</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCourses.has(course.id)}
                        onCheckedChange={(checked) => handleSelectCourse(course.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.category}</TableCell>
                    <TableCell>
                      <Badge variant={course.status === 'published' ? 'default' : course.status === 'archived' ? 'secondary' : 'outline'}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{course.difficulty}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{course.moduleCount || 0}</TableCell>
                    <TableCell className="text-right">{course.lessonCount || 0}</TableCell>
                    <TableCell className="text-right">{course.totalXP || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPreviewCourseId(course.id)}
                          title="Preview Course"
                        >
                          <Eye size={14} className="text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCourseId(course.id)}
                          title="Edit"
                        >
                          <PencilSimple size={14} />
                        </Button>
                        {course.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePublish(course.id)}
                            title="Publish"
                          >
                            <UploadSimple size={14} className="text-green-600" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicate(course.id)}
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleArchive(course.id)}
                          title="Archive"
                        >
                          <Archive size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(course.id)}
                          title="Delete"
                        >
                          <Trash size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Course Preview Modal */}
      <CoursePreview
        courseId={previewCourseId}
        isOpen={previewCourseId !== null}
        onClose={() => setPreviewCourseId(null)}
      />
    </div>
  )
}
