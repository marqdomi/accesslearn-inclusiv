import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, Article, Lightbulb, Timer } from '@phosphor-icons/react'
import { AdaptiveFeedback, RemediationSuggestion } from '@/lib/adaptive-feedback'
import { motion } from 'framer-motion'

interface AdaptiveFeedbackDisplayProps {
  feedback: AdaptiveFeedback
  onRemediationSelect?: (suggestion: RemediationSuggestion) => void
  onRetry?: () => void
  showRetryButton?: boolean
}

export function AdaptiveFeedbackDisplay({
  feedback,
  onRemediationSelect,
  onRetry,
  showRetryButton = false,
}: AdaptiveFeedbackDisplayProps) {
  const getAlertVariant = () => {
    switch (feedback.tone) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getRemediationIcon = (type: RemediationSuggestion['type']) => {
    switch (type) {
      case 'video-segment':
        return PlayCircle
      case 'text-section':
        return Article
      case 'interactive-challenge':
        return Lightbulb
      default:
        return Article
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Alert variant={getAlertVariant()} className="border-2">
        <span className="text-2xl mr-2" role="img" aria-label="Feedback emoji">
          {feedback.emoji}
        </span>
        <AlertTitle className="text-lg font-semibold">
          {feedback.tone === 'success' ? 'Success!' : feedback.tone === 'error' ? 'Not Quite' : 'Keep Going!'}
        </AlertTitle>
        <AlertDescription className="text-base mt-2">
          {feedback.message}
        </AlertDescription>
      </Alert>

      {feedback.remediation && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb size={24} className="text-primary" weight="fill" />
            Recommended Next Steps
          </h3>
          <div className="space-y-3">
            <RemediationCard
              suggestion={feedback.remediation}
              onSelect={() => onRemediationSelect?.(feedback.remediation!)}
              icon={getRemediationIcon(feedback.remediation.type)}
            />
          </div>
        </Card>
      )}

      {showRetryButton && onRetry && (
        <Button onClick={onRetry} className="w-full" size="lg">
          Try Again
        </Button>
      )}
    </motion.div>
  )
}

interface RemediationCardProps {
  suggestion: RemediationSuggestion
  onSelect: () => void
  icon: React.ComponentType<any>
}

function RemediationCard({ suggestion, onSelect, icon: Icon }: RemediationCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border-2"
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect()
          }
        }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon size={24} className="text-primary" weight="duotone" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-base">{suggestion.title}</h4>
              <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
                <Timer size={14} weight="fill" />
                {suggestion.estimatedMinutes} min
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {suggestion.description}
            </p>
            {suggestion.type === 'video-segment' && suggestion.startTime !== undefined && (
              <p className="text-xs text-primary mt-2 font-medium">
                Jump to {formatTime(suggestion.startTime)}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface MultipleRemediationDisplayProps {
  suggestions: RemediationSuggestion[]
  onSelect: (suggestion: RemediationSuggestion) => void
  encouragement?: string
}

export function MultipleRemediationDisplay({
  suggestions,
  onSelect,
  encouragement,
}: MultipleRemediationDisplayProps) {
  const getRemediationIcon = (type: RemediationSuggestion['type']) => {
    switch (type) {
      case 'video-segment':
        return PlayCircle
      case 'text-section':
        return Article
      case 'interactive-challenge':
        return Lightbulb
      default:
        return Article
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {encouragement && (
        <Alert className="border-2 bg-gradient-to-r from-primary/5 to-secondary/5">
          <span className="text-2xl mr-2" role="img" aria-label="Encouragement">
            💪
          </span>
          <AlertDescription className="text-base font-medium">
            {encouragement}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6 border-2">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lightbulb size={24} className="text-primary" weight="fill" />
          Focus on These Topics
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Instead of reviewing everything, let's focus on the specific concepts you need. Choose any topic below:
        </p>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <RemediationCard
              key={index}
              suggestion={suggestion}
              onSelect={() => onSelect(suggestion)}
              icon={getRemediationIcon(suggestion.type)}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
