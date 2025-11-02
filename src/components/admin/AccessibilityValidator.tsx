import { ValidationError } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Warning, CheckCircle } from '@phosphor-icons/react'

interface AccessibilityValidatorProps {
  errors: ValidationError[]
}

export function AccessibilityValidator({ errors }: AccessibilityValidatorProps) {
  const accessibilityErrors = errors.filter(e => 
    e.message.includes('accessibility') || 
    e.message.includes('alt text') || 
    e.message.includes('captions') || 
    e.message.includes('transcript')
  )

  const criticalErrors = accessibilityErrors.filter(e => e.severity === 'error')
  const warnings = accessibilityErrors.filter(e => e.severity === 'warning')

  if (accessibilityErrors.length === 0) {
    return (
      <Card className="border-success">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-success" weight="fill" />
            <div>
              <h3 className="font-semibold text-success">All Accessibility Requirements Met</h3>
              <p className="text-sm text-muted-foreground">
                Your course meets WCAG 2.1 Level AA accessibility standards
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={criticalErrors.length > 0 ? 'border-destructive' : 'border-amber-500'}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Warning size={24} className={criticalErrors.length > 0 ? 'text-destructive' : 'text-amber-600'} weight="fill" />
          <div>
            <CardTitle>Accessibility Issues Detected</CardTitle>
            <CardDescription>
              {criticalErrors.length > 0 
                ? `${criticalErrors.length} critical issue${criticalErrors.length !== 1 ? 's' : ''} must be fixed before publishing`
                : `${warnings.length} warning${warnings.length !== 1 ? 's' : ''} should be addressed`
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {criticalErrors.map((error, index) => (
          <Alert key={index} variant="destructive">
            <Warning size={20} />
            <AlertDescription>
              <span className="font-medium">{error.field}:</span> {error.message}
            </AlertDescription>
          </Alert>
        ))}
        {warnings.map((warning, index) => (
          <Alert key={index} className="border-amber-500">
            <Warning size={20} className="text-amber-600" />
            <AlertDescription className="text-amber-900">
              <span className="font-medium">{warning.field}:</span> {warning.message}
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  )
}
