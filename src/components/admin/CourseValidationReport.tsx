/**
 * CourseValidationReport Component
 * Muestra reporte visual detallado de validación del curso
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  Award,
} from 'lucide-react'
import { ValidationResult, ValidationIssue } from '@/lib/course-validation'

interface CourseValidationReportProps {
  validation: ValidationResult
  showDetails?: boolean
}

const CATEGORY_LABELS = {
  basic_info: 'Basic Information',
  structure: 'Course Structure',
  content: 'Content Quality',
  metadata: 'Metadata & SEO',
  accessibility: 'Accessibility',
  quality: 'Teaching Quality',
  engagement: 'Student Engagement',
}

const CATEGORY_ICONS = {
  basic_info: AlertCircle,
  structure: TrendingUp,
  content: CheckCircle2,
  metadata: Award,
  accessibility: CheckCircle2,
  quality: Award,
  engagement: Award,
}

export default function CourseValidationReport({
  validation,
  showDetails = true,
}: CourseValidationReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Needs Work'
  }

  const groupIssuesByCategory = (issues: ValidationIssue[]) => {
    return issues.reduce((acc, issue) => {
      if (!acc[issue.category]) {
        acc[issue.category] = []
      }
      acc[issue.category].push(issue)
      return acc
    }, {} as Record<string, ValidationIssue[]>)
  }

  const errorsByCategory = groupIssuesByCategory(validation.errors)
  const warningsByCategory = groupIssuesByCategory(validation.warnings)
  const suggestionsByCategory = groupIssuesByCategory(validation.suggestions)

  return (
    <div className="space-y-4">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Validation Score</CardTitle>
              <CardDescription>Overall course quality assessment</CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(validation.score)}`}>
                {validation.score}
              </div>
              <div className="text-sm text-muted-foreground">{getScoreLabel(validation.score)}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={validation.score} className="h-2" />
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>{validation.errors.length} errors</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span>{validation.warnings.length} warnings</span>
              </div>
              <div className="flex items-center gap-1">
                <Lightbulb className="w-4 h-4 text-blue-500" />
                <span>{validation.suggestions.length} suggestions</span>
              </div>
            </div>
            <Badge variant={validation.valid ? 'default' : 'destructive'}>
              {validation.valid ? 'Ready to Publish' : 'Cannot Publish'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {showDetails && (
        <>
          {/* Errors */}
          {validation.errors.length > 0 && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Errors ({validation.errors.length})
                </CardTitle>
                <CardDescription>
                  These issues must be fixed before publishing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(errorsByCategory).map(([category, issues]) => {
                    const CategoryIcon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-2">
                          <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                          <h4 className="font-medium text-sm">
                            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                          </h4>
                          <Badge variant="destructive" className="ml-auto">
                            {issues.length}
                          </Badge>
                        </div>
                        <ul className="space-y-2 ml-6">
                          {issues.map((issue, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span className="text-muted-foreground">{issue.message}</span>
                            </li>
                          ))}
                        </ul>
                        {Object.keys(errorsByCategory).indexOf(category) <
                          Object.keys(errorsByCategory).length - 1 && (
                          <Separator className="mt-3" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <Card className="border-yellow-200 dark:border-yellow-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="w-5 h-5" />
                  Warnings ({validation.warnings.length})
                </CardTitle>
                <CardDescription>
                  Recommended improvements for better course quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(warningsByCategory).map(([category, issues]) => {
                    const CategoryIcon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-2">
                          <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                          <h4 className="font-medium text-sm">
                            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                          </h4>
                          <Badge variant="outline" className="ml-auto border-yellow-500 text-yellow-600">
                            {issues.length}
                          </Badge>
                        </div>
                        <ul className="space-y-2 ml-6">
                          {issues.map((issue, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-yellow-500 mt-0.5">⚠</span>
                              <span className="text-muted-foreground">{issue.message}</span>
                            </li>
                          ))}
                        </ul>
                        {Object.keys(warningsByCategory).indexOf(category) <
                          Object.keys(warningsByCategory).length - 1 && (
                          <Separator className="mt-3" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {validation.suggestions.length > 0 && (
            <Card className="border-blue-200 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Lightbulb className="w-5 h-5" />
                  Suggestions ({validation.suggestions.length})
                </CardTitle>
                <CardDescription>
                  Optional enhancements to make your course even better
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(suggestionsByCategory).map(([category, issues]) => {
                    const CategoryIcon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-2">
                          <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                          <h4 className="font-medium text-sm">
                            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                          </h4>
                          <Badge variant="outline" className="ml-auto border-blue-500 text-blue-600">
                            {issues.length}
                          </Badge>
                        </div>
                        <ul className="space-y-2 ml-6">
                          {issues.map((issue, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-blue-500 mt-0.5">💡</span>
                              <span className="text-muted-foreground">{issue.message}</span>
                            </li>
                          ))}
                        </ul>
                        {Object.keys(suggestionsByCategory).indexOf(category) <
                          Object.keys(suggestionsByCategory).length - 1 && (
                          <Separator className="mt-3" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Clear */}
          {validation.errors.length === 0 &&
            validation.warnings.length === 0 &&
            validation.suggestions.length === 0 && (
              <Card className="border-green-200 dark:border-green-900">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
                    <h3 className="text-lg font-semibold mb-1">Perfect Course!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your course meets all quality standards and is ready to publish.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
        </>
      )}
    </div>
  )
}
