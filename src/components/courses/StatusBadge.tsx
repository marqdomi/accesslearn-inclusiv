import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, FileEdit, Archive } from 'lucide-react'

type CourseStatus = 'draft' | 'pending-review' | 'published' | 'archived'

interface StatusBadgeProps {
  status?: CourseStatus
  className?: string
  showIcon?: boolean
}

const statusConfig = {
  draft: {
    label: 'Draft',
    variant: 'outline' as const,
    icon: FileEdit,
    className: 'border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300'
  },
  'pending-review': {
    label: 'Pending Review',
    variant: 'outline' as const,
    icon: Clock,
    className: 'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:bg-amber-950/20'
  },
  published: {
    label: 'Published',
    variant: 'outline' as const,
    icon: CheckCircle2,
    className: 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:bg-emerald-950/20'
  },
  archived: {
    label: 'Archived',
    variant: 'outline' as const,
    icon: Archive,
    className: 'border-slate-300 text-slate-500 bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:bg-slate-950/20'
  }
}

export function StatusBadge({ status = 'draft', className, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  )
}
