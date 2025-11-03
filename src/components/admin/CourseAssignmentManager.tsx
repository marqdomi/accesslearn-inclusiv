import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { UserGroup, Course, CourseAssignment, EmployeeCredentials } from '@/lib/types'
import { Target, Users, GraduationCap, CalendarBlank, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'
import { translateCourse } from '@/lib/translate-course'

export function CourseAssignmentManager() {
  const { t } = useTranslation()
  const [courses] = useKV<Course[]>('courses', [])
  const [groups] = useKV<UserGroup[]>('user-groups', [])
  const [employees] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  const [assignments, setAssignments] = useKV<CourseAssignment[]>('course-assignments', [])
  
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [assignmentType, setAssignmentType] = useState<'group' | 'individual'>('group')

  const translatedCourses = useMemo(() => {
    return (courses || []).map(course => translateCourse(course, t))
  }, [courses, t])

  const handleAssignment = () => {
    if (!selectedCourse) {
      toast.error(t('courseAssignment.selectCourse'))
      return
    }

    if (assignmentType === 'group' && !selectedGroup) {
      toast.error(t('courseAssignment.selectGroup'))
      return
    }

    if (assignmentType === 'individual' && !selectedUser) {
      toast.error(t('courseAssignment.selectEmployee'))
      return
    }

    const newAssignment: CourseAssignment = {
      id: `assign_${Date.now()}`,
      courseId: selectedCourse,
      userId: assignmentType === 'individual' ? selectedUser : undefined,
      groupId: assignmentType === 'group' ? selectedGroup : undefined,
      assignedAt: Date.now(),
      assignedBy: 'admin',
      dueDate: undefined
    }

    setAssignments((current) => [...(current || []), newAssignment])

    const courseName = getCourseTitle(selectedCourse)
    const targetName = assignmentType === 'group'
      ? getGroupName(selectedGroup)
      : getUserEmail(selectedUser)

    toast.success(t('courseAssignment.assignSuccess', { course: courseName, target: targetName }))
    
    setSelectedCourse('')
    setSelectedGroup('')
    setSelectedUser('')
  }

  const groupAssignments = (assignments || []).filter(a => a.groupId)
  const individualAssignments = (assignments || []).filter(a => a.userId)

  const getCourseTitle = (courseId: string) => {
    const course = translatedCourses?.find(c => c.id === courseId)
    return course?.title || t('courseAssignment.unknownCourse')
  }

  const getGroupName = (groupId: string) => {
    return groups?.find(g => g.id === groupId)?.name || t('courseAssignment.unknownGroup')
  }

  const getUserEmail = (userId: string) => {
    const employee = employees?.find(e => e.id === userId)
    return employee ? `${employee.firstName} ${employee.lastName} - ${employee.email}` : t('courseAssignment.unknownUser')
  }

  const getGroupMemberCount = (groupId: string) => {
    return groups?.find(g => g.id === groupId)?.userIds.length || 0
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={24} className="text-primary" aria-hidden="true" />
            {t('courseAssignment.title')}
          </CardTitle>
          <CardDescription>{t('courseAssignment.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button
              variant={assignmentType === 'group' ? 'default' : 'outline'}
              onClick={() => setAssignmentType('group')}
              className="flex-1 gap-2"
            >
              <Users size={20} aria-hidden="true" />
              {t('courseAssignment.assignToGroup')}
            </Button>
            <Button
              variant={assignmentType === 'individual' ? 'default' : 'outline'}
              onClick={() => setAssignmentType('individual')}
              className="flex-1 gap-2"
            >
              <GraduationCap size={20} aria-hidden="true" />
              {t('courseAssignment.assignToIndividual')}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-select" className="text-base font-medium">
                {t('courseAssignment.selectCourseLabel')}
              </Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger id="course-select" className="h-12">
                  <SelectValue placeholder={t('courseAssignment.selectCoursePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {translatedCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {assignmentType === 'group' ? (
              <div className="space-y-2">
                <Label htmlFor="group-select" className="text-base font-medium">
                  {t('courseAssignment.selectGroupLabel')}
                </Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger id="group-select" className="h-12">
                    <SelectValue placeholder={t('courseAssignment.selectGroupPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(groups || []).map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.userIds.length} {t('courseAssignment.members')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="user-select" className="text-base font-medium">
                  {t('courseAssignment.selectEmployeeLabel')}
                </Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user-select" className="h-12">
                    <SelectValue placeholder={t('courseAssignment.selectEmployeePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(employees || []).map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} - {employee.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={handleAssignment} className="w-full h-12 text-base font-semibold gap-2">
              <CheckCircle size={20} aria-hidden="true" />
              {t('courseAssignment.assignButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('courseAssignment.groupAssignments')}</CardTitle>
          <CardDescription>{t('courseAssignment.groupAssignmentsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {groupAssignments.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-muted-foreground mb-3" aria-hidden="true" />
              <p className="text-muted-foreground">{t('courseAssignment.noGroupAssignments')}</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('courseAssignment.course')}</TableHead>
                    <TableHead>{t('courseAssignment.group')}</TableHead>
                    <TableHead className="text-right">{t('courseAssignment.members')}</TableHead>
                    <TableHead>{t('courseAssignment.assignedDate')}</TableHead>
                    <TableHead>{t('courseAssignment.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{getCourseTitle(assignment.courseId)}</TableCell>
                      <TableCell>{getGroupName(assignment.groupId!)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{getGroupMemberCount(assignment.groupId!)} {t('courseAssignment.users')}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(assignment.assignedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{t('courseAssignment.active')}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('courseAssignment.individualAssignments')}</CardTitle>
          <CardDescription>{t('courseAssignment.individualAssignmentsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {individualAssignments.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap size={48} className="mx-auto text-muted-foreground mb-3" aria-hidden="true" />
              <p className="text-muted-foreground">{t('courseAssignment.noIndividualAssignments')}</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('courseAssignment.course')}</TableHead>
                    <TableHead>{t('courseAssignment.employee')}</TableHead>
                    <TableHead>{t('courseAssignment.assignedDate')}</TableHead>
                    <TableHead>{t('courseAssignment.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {individualAssignments.slice(0, 20).map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{getCourseTitle(assignment.courseId)}</TableCell>
                      <TableCell>{getUserEmail(assignment.userId!)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(assignment.assignedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{t('courseAssignment.active')}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {individualAssignments.length > 20 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              {t('courseAssignment.showingXofY', { showing: '20', total: individualAssignments.length.toString() })}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
