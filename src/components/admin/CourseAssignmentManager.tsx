import { useState } from 'react'
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

export function CourseAssignmentManager() {
  const [courses] = useKV<Course[]>('courses', [])
  const [groups] = useKV<UserGroup[]>('user-groups', [])
  const [employees] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  const [assignments, setAssignments] = useKV<CourseAssignment[]>('course-assignments', [])
  
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [assignmentType, setAssignmentType] = useState<'group' | 'individual'>('group')

  const handleAssignment = () => {
    if (!selectedCourse) {
      toast.error('Please select a course')
      return
    }

    if (assignmentType === 'group' && !selectedGroup) {
      toast.error('Please select a group')
      return
    }

    if (assignmentType === 'individual' && !selectedUser) {
      toast.error('Please select a user')
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

    const courseName = courses?.find(c => c.id === selectedCourse)?.title || 'Course'
    const targetName = assignmentType === 'group'
      ? groups?.find(g => g.id === selectedGroup)?.name || 'Group'
      : employees?.find(e => e.id === selectedUser)?.email || 'User'

    toast.success(`${courseName} assigned to ${targetName}`)
    
    setSelectedCourse('')
    setSelectedGroup('')
    setSelectedUser('')
  }

  const groupAssignments = (assignments || []).filter(a => a.groupId)
  const individualAssignments = (assignments || []).filter(a => a.userId)

  const getCourseTitle = (courseId: string) => {
    return courses?.find(c => c.id === courseId)?.title || 'Unknown Course'
  }

  const getGroupName = (groupId: string) => {
    return groups?.find(g => g.id === groupId)?.name || 'Unknown Group'
  }

  const getUserEmail = (userId: string) => {
    return employees?.find(e => e.id === userId)?.email || 'Unknown User'
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
            Assign Courses
          </CardTitle>
          <CardDescription>Assign training courses to groups or individual employees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button
              variant={assignmentType === 'group' ? 'default' : 'outline'}
              onClick={() => setAssignmentType('group')}
              className="flex-1 gap-2"
            >
              <Users size={20} aria-hidden="true" />
              Assign to Group
            </Button>
            <Button
              variant={assignmentType === 'individual' ? 'default' : 'outline'}
              onClick={() => setAssignmentType('individual')}
              className="flex-1 gap-2"
            >
              <GraduationCap size={20} aria-hidden="true" />
              Assign to Individual
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-select" className="text-base font-medium">
                Select Course
              </Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger id="course-select" className="h-12">
                  <SelectValue placeholder="Choose a course to assign" />
                </SelectTrigger>
                <SelectContent>
                  {(courses || []).map((course) => (
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
                  Select Group
                </Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger id="group-select" className="h-12">
                    <SelectValue placeholder="Choose a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {(groups || []).map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.userIds.length} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="user-select" className="text-base font-medium">
                  Select Employee
                </Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user-select" className="h-12">
                    <SelectValue placeholder="Choose an employee" />
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
              Assign Course
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Group Assignments</CardTitle>
          <CardDescription>Courses assigned to employee groups</CardDescription>
        </CardHeader>
        <CardContent>
          {groupAssignments.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-muted-foreground mb-3" aria-hidden="true" />
              <p className="text-muted-foreground">No group assignments yet</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead className="text-right">Members</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{getCourseTitle(assignment.courseId)}</TableCell>
                      <TableCell>{getGroupName(assignment.groupId!)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{getGroupMemberCount(assignment.groupId!)} users</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(assignment.assignedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
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
          <CardTitle>Individual Assignments</CardTitle>
          <CardDescription>Courses assigned to specific employees</CardDescription>
        </CardHeader>
        <CardContent>
          {individualAssignments.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap size={48} className="mx-auto text-muted-foreground mb-3" aria-hidden="true" />
              <p className="text-muted-foreground">No individual assignments yet</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Status</TableHead>
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
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {individualAssignments.length > 20 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing 20 of {individualAssignments.length} assignments
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
