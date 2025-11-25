import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Target, Users, GraduationCap, CalendarBlank, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { translateCourse } from '@/lib/translate-course'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'
import { adaptBackendCourseToFrontend } from '@/lib/course-adapter'

interface BackendAssignment {
  id: string
  tenantId: string
  courseId: string
  assignedToType: 'user' | 'group'
  assignedToId: string
  assignedBy: string
  dueDate?: string
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  updatedAt: string
}

export function CourseAssignmentManager() {
  const { t } = useTranslation()
  const { currentTenant } = useTenant()
  const [courses, setCourses] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [assignments, setAssignments] = useState<BackendAssignment[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [assignmentType, setAssignmentType] = useState<'group' | 'individual'>('group')

  // Load data from Cosmos DB
  useEffect(() => {
    if (currentTenant) {
      loadData()
    }
  }, [currentTenant])

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesData, groupsData, usersData, assignmentsData] = await Promise.all([
        ApiService.getCourses(),
        ApiService.getGroups(),
        currentTenant ? ApiService.getUsersByTenant(currentTenant.id) : Promise.resolve([]),
        ApiService.getCourseAssignments()
      ])
      
      // Convert backend courses to frontend format
      const frontendCourses = coursesData.map(adaptBackendCourseToFrontend)
      setCourses(frontendCourses)
      setGroups(groupsData)
      setUsers(usersData)
      setAssignments(assignmentsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const translatedCourses = useMemo(() => {
    return courses.map(course => translateCourse(course, t))
  }, [courses, t])

  const handleAssignment = async () => {
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

    try {
      const newAssignment = await ApiService.createCourseAssignment({
        courseId: selectedCourse,
        assignedToType: assignmentType === 'group' ? 'group' : 'user',
        assignedToId: assignmentType === 'group' ? selectedGroup : selectedUser
      })

      setAssignments([...assignments, newAssignment])

      const courseName = getCourseTitle(selectedCourse)
      const targetName = assignmentType === 'group'
        ? getGroupName(selectedGroup)
        : getUserEmail(selectedUser)

      toast.success(t('courseAssignment.assignSuccess', { course: courseName, target: targetName }))
      
      setSelectedCourse('')
      setSelectedGroup('')
      setSelectedUser('')
    } catch (error: any) {
      console.error('Error creating assignment:', error)
      toast.error(error.message || 'Error al crear asignación')
    }
  }

  const groupAssignments = assignments.filter(a => a.assignedToType === 'group')
  const individualAssignments = assignments.filter(a => a.assignedToType === 'user')

  const getCourseTitle = (courseId: string) => {
    const course = translatedCourses?.find(c => c.id === courseId)
    return course?.title || t('courseAssignment.unknownCourse')
  }

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || t('courseAssignment.unknownGroup')
  }

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user ? `${user.firstName} ${user.lastName} - ${user.email}` : t('courseAssignment.unknownUser')
  }

  const getGroupMemberCount = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.memberIds?.length || 0
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
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.memberIds?.length || 0} {t('courseAssignment.members')})
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
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} - {user.email}
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
                      <TableCell>{getGroupName(assignment.assignedToId)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{getGroupMemberCount(assignment.assignedToId)} {t('courseAssignment.users')}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={assignment.status === 'completed' ? 'default' : assignment.status === 'in-progress' ? 'secondary' : 'outline'}>
                          {assignment.status === 'completed' ? t('courseAssignment.completed') : 
                           assignment.status === 'in-progress' ? t('courseAssignment.inProgress') : 
                           t('courseAssignment.pending')}
                        </Badge>
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
                      <TableCell>{getUserEmail(assignment.assignedToId)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={assignment.status === 'completed' ? 'default' : assignment.status === 'in-progress' ? 'secondary' : 'outline'}>
                          {assignment.status === 'completed' ? t('courseAssignment.completed') : 
                           assignment.status === 'in-progress' ? t('courseAssignment.inProgress') : 
                           t('courseAssignment.pending')}
                        </Badge>
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
