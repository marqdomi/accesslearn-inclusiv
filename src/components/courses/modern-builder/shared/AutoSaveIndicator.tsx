import { FloppyDisk, CheckCircle, Warning } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface AutoSaveIndicatorProps {
  lastSaved: number | null
  isSaving: boolean
  isDirty: boolean
}

export function AutoSaveIndicator({ lastSaved, isSaving, isDirty }: AutoSaveIndicatorProps) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FloppyDisk className="animate-pulse" size={16} />
        <span>Guardando...</span>
      </div>
    )
  }
  
  if (isDirty) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600">
        <Warning size={16} />
        <span>Cambios sin guardar</span>
      </div>
    )
  }
  
  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle size={16} />
        <span>
          Guardado {formatDistanceToNow(lastSaved, { addSuffix: true, locale: es })}
        </span>
      </div>
    )
  }
  
  return null
}
