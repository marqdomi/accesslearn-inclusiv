import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Warning, XCircle, Info, Eye } from '@phosphor-icons/react'
import { Course, CourseVisibility, CourseWithStructure } from '@/services/course-management-service'
import { validateCourse } from '@/lib/course-validation'
import CourseValidationReport from '../CourseValidationReport'
import { useState } from 'react'

interface PublishingTabProps {
  course: Partial<Course>
  onChange: (updates: Partial<Course>) => void
  validationErrors: string[]
  validationWarnings: string[]
}

export function PublishingTab({ 
  course, 
  onChange, 
  validationErrors, 
  validationWarnings 
}: PublishingTabProps) {
  const isValid = validationErrors.length === 0
  const [showAdvancedValidation, setShowAdvancedValidation] = useState(false)

  // Ejecutar validación avanzada si tenemos estructura completa
  const advancedValidation = (course as CourseWithStructure).modules 
    ? validateCourse(course as CourseWithStructure)
    : null

  return (
    <div className="space-y-6">
      {/* Validation Checklist */}
      <Card className={isValid ? 'border-green-500' : 'border-yellow-500'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle className="text-green-500" size={20} />
            ) : (
              <Warning className="text-yellow-500" size={20} />
            )}
            Publication Checklist
          </CardTitle>
          <CardDescription>
            Your course must meet all requirements before publishing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Errors */}
          {validationErrors.length > 0 && (
            <div className="space-y-2">
              {validationErrors.map((error, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <XCircle className="text-destructive shrink-0 mt-0.5" size={16} />
                  <span className="text-destructive">{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {validationWarnings.length > 0 && (
            <div className="space-y-2">
              {validationWarnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Warning className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                  <span className="text-yellow-600 dark:text-yellow-500">{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Success */}
          {isValid && validationWarnings.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle size={16} />
              <span>All requirements met! This course is ready to publish.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Visibility & Access</CardTitle>
          <CardDescription>
            Control who can see and enroll in this course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={course.visibility || 'public'}
              onValueChange={(value) => onChange({ visibility: value as CourseVisibility })}
            >
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Public</span>
                    <span className="text-xs text-muted-foreground">
                      Anyone can see and enroll
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Private</span>
                    <span className="text-xs text-muted-foreground">
                      Only visible to assigned users
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="restricted">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Restricted</span>
                    <span className="text-xs text-muted-foreground">
                      Visible but requires approval to enroll
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Settings (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Settings</CardTitle>
          <CardDescription>
            Configure course completion certificates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Certificate functionality will be available in a future update.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Completion Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Requirements</CardTitle>
          <CardDescription>
            Define what students must do to complete this course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              By default, students must complete all lessons to finish the course.
              Advanced completion criteria will be available in a future update.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Publishing Status */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Current Status</Label>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    course.status === 'published' 
                      ? 'default' 
                      : course.status === 'archived' 
                      ? 'secondary' 
                      : 'outline'
                  }
                  className="text-sm"
                >
                  {course.status || 'draft'}
                </Badge>
              </div>
            </div>
            {course.publishedAt && (
              <div className="text-sm text-muted-foreground">
                Published: {new Date(course.publishedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Validation Report */}
      {advancedValidation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Advanced Quality Analysis</CardTitle>
                <CardDescription>
                  Comprehensive course quality assessment with detailed recommendations
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedValidation(!showAdvancedValidation)}
              >
                <Eye className="mr-2" size={16} />
                {showAdvancedValidation ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CourseValidationReport 
              validation={advancedValidation} 
              showDetails={showAdvancedValidation}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
