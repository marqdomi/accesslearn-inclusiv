import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  title: string
  description: string
}

interface StepperNavigationProps {
  steps: Step[]
  currentStep: number
  onStepClick: (step: number) => void
  canNavigate?: (step: number) => boolean
}

export function StepperNavigation({ 
  steps, 
  currentStep, 
  onStepClick,
  canNavigate = () => true 
}: StepperNavigationProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isClickable = canNavigate(step.id)
          
          return (
            <li key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  'group flex items-center w-full',
                  !isClickable && 'cursor-not-allowed'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                      isCompleted && 'bg-primary border-primary text-primary-foreground',
                      isCurrent && 'border-primary text-primary bg-primary/10',
                      !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground',
                      isClickable && !isCurrent && 'group-hover:border-primary group-hover:text-primary'
                    )}
                  >
                    {isCompleted ? (
                      <Check size={20} weight="bold" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </span>
                  
                  {/* Step Labels - Hidden on mobile */}
                  <div className="hidden md:block text-left">
                    <p
                      className={cn(
                        'text-sm font-medium transition-colors',
                        isCurrent && 'text-primary',
                        isCompleted && 'text-foreground',
                        !isCompleted && !isCurrent && 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </button>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'hidden sm:block h-0.5 flex-1 mx-2 transition-colors',
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
