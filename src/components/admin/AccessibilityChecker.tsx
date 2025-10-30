import { Card } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  XCircle,
  Warning,
  Subtitles,
  TextAa,
  SpeakerHigh,
  Image as ImageIcon,
} from '@phosphor-icons/react'
import { AccessibilityMetadata, ContentType } from '@/lib/types'

export interface AccessibilityValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

interface AccessibilityCheckerProps {
  contentType: ContentType
  metadata: AccessibilityMetadata
  onFixIssue?: (field: keyof AccessibilityMetadata) => void
}

export function AccessibilityChecker({
  contentType,
  metadata,
  onFixIssue,
}: AccessibilityCheckerProps) {
  const validation = validateAccessibilityMetadata(contentType, metadata)

  const getStatusColor = () => {
    if (!validation.isValid) return 'destructive'
    if (validation.warnings.length > 0) return 'default'
    return 'default'
  }

  const getStatusIcon = () => {
    if (!validation.isValid) return <XCircle size={20} weight="fill" className="text-destructive" />
    if (validation.warnings.length > 0) return <Warning size={20} weight="fill" className="text-yellow-600" />
    return <CheckCircle size={20} weight="fill" className="text-success" />
  }

  const getStatusText = () => {
    if (!validation.isValid) return 'Accessibility Requirements Missing'
    if (validation.warnings.length > 0) return 'Accessibility Warnings'
    return 'Accessibility Requirements Met'
  }

  return (
    <Card className="p-6 border-2">
      <div className="flex items-center gap-2 mb-4">
        {getStatusIcon()}
        <h3 className="text-lg font-semibold">{getStatusText()}</h3>
      </div>

      <div className="space-y-4">
        {validation.errors.length > 0 && (
          <Alert variant="destructive">
            <XCircle size={20} weight="fill" />
            <AlertTitle>Required for Publishing</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {validation.errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validation.warnings.length > 0 && (
          <Alert>
            <Warning size={20} weight="fill" />
            <AlertTitle>Recommended Improvements</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {validation.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validation.suggestions.length > 0 && (
          <div className="bg-primary/5 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Enhancement Suggestions</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {validation.suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        <AccessibilityChecklist
          contentType={contentType}
          metadata={metadata}
          onFixIssue={onFixIssue}
        />
      </div>

      {!validation.isValid && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription className="font-medium">
            ⚠️ Publishing is blocked until all required accessibility data is provided.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  )
}

interface AccessibilityChecklistProps {
  contentType: ContentType
  metadata: AccessibilityMetadata
  onFixIssue?: (field: keyof AccessibilityMetadata) => void
}

function AccessibilityChecklist({
  contentType,
  metadata,
  onFixIssue,
}: AccessibilityChecklistProps) {
  const requirements = getRequirements(contentType)

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm mb-3">Accessibility Checklist</h4>
      {requirements.map((req) => {
        const isComplete = checkRequirement(req.field, metadata)
        return (
          <div
            key={req.field}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {isComplete ? (
                <CheckCircle size={20} weight="fill" className="text-success" />
              ) : (
                <XCircle size={20} weight="fill" className="text-muted-foreground" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  {req.icon}
                  <span className="font-medium text-sm">{req.label}</span>
                  {req.required && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                  {!req.required && (
                    <Badge variant="secondary" className="text-xs">
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
              </div>
            </div>
            {!isComplete && onFixIssue && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFixIssue(req.field)}
              >
                Add
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}

interface Requirement {
  field: keyof AccessibilityMetadata
  label: string
  description: string
  required: boolean
  icon: React.ReactNode
}

function getRequirements(contentType: ContentType): Requirement[] {
  const requirements: Requirement[] = []

  if (contentType === 'video') {
    requirements.push(
      {
        field: 'captions',
        label: 'Closed Captions',
        description: 'Synchronized text for all spoken content and important sounds',
        required: true,
        icon: <Subtitles size={16} className="text-primary" />,
      },
      {
        field: 'transcript',
        label: 'Transcript',
        description: 'Full text version of video content for reference',
        required: true,
        icon: <TextAa size={16} className="text-primary" />,
      },
      {
        field: 'audioDescription',
        label: 'Audio Description',
        description: 'Narration of visual elements for users with visual impairments',
        required: false,
        icon: <SpeakerHigh size={16} className="text-primary" />,
      }
    )
  }

  if (contentType === 'audio') {
    requirements.push({
      field: 'transcript',
      label: 'Transcript',
      description: 'Full text version of audio content',
      required: true,
      icon: <TextAa size={16} className="text-primary" />,
    })
  }

  if (contentType === 'image') {
    requirements.push({
      field: 'altText',
      label: 'Alternative Text',
      description: 'Descriptive text explaining the image content and purpose',
      required: true,
      icon: <ImageIcon size={16} className="text-primary" />,
    })
  }

  return requirements
}

function checkRequirement(
  field: keyof AccessibilityMetadata,
  metadata: AccessibilityMetadata
): boolean {
  const value = metadata[field]
  return typeof value === 'string' && value.trim().length > 0
}

export function validateAccessibilityMetadata(
  contentType: ContentType,
  metadata: AccessibilityMetadata
): AccessibilityValidation {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  if (contentType === 'video') {
    if (!metadata.captions || metadata.captions.trim().length === 0) {
      errors.push('Closed captions are required for all video content')
    }
    if (!metadata.transcript || metadata.transcript.trim().length === 0) {
      errors.push('Transcript is required for all video content')
    }
    if (!metadata.audioDescription || metadata.audioDescription.trim().length === 0) {
      warnings.push('Audio description track is recommended for visual content')
      suggestions.push(
        'Add audio description to narrate important visual elements for users with visual impairments'
      )
    }
  }

  if (contentType === 'audio') {
    if (!metadata.transcript || metadata.transcript.trim().length === 0) {
      errors.push('Transcript is required for all audio content')
    }
  }

  if (contentType === 'image') {
    if (!metadata.altText || metadata.altText.trim().length === 0) {
      errors.push('Alternative text is required for all images')
    } else if (metadata.altText.trim().length < 10) {
      warnings.push('Alternative text seems very short - consider adding more detail')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}
