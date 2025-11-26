import { FloppyDisk, CheckCircle, Warning, CloudArrowUp } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface AutoSaveIndicatorProps {
  lastSaved: number | null // Last time saved to localStorage
  lastSavedBackend?: number | null // Last time saved to backend (Cosmos DB)
  isSaving: boolean
  isDirty: boolean
}

export function AutoSaveIndicator({ lastSaved, lastSavedBackend, isSaving, isDirty }: AutoSaveIndicatorProps) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FloppyDisk className="animate-pulse" size={16} />
        <span>Guardando en el servidor...</span>
      </div>
    )
  }
  
  if (isDirty) {
    // Show different message based on whether there's a backend save
    if (lastSavedBackend) {
      return (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <Warning size={16} />
          <span>
            Cambios sin guardar en el servidor
            {lastSaved && (
              <span className="text-muted-foreground text-xs ml-1">
                (guardado localmente {formatDistanceToNow(lastSaved, { addSuffix: true, locale: es })})
              </span>
            )}
          </span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <Warning size={16} />
          <span>
            Cambios sin guardar
            {lastSaved && (
              <span className="text-muted-foreground text-xs ml-1">
                (guardado localmente {formatDistanceToNow(lastSaved, { addSuffix: true, locale: es })})
              </span>
            )}
          </span>
        </div>
      )
    }
  }
  
  // No changes - show save status
  if (lastSavedBackend) {
    // Saved to backend - best status
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CloudArrowUp size={16} weight="fill" />
        <span>
          Guardado en el servidor {formatDistanceToNow(lastSavedBackend, { addSuffix: true, locale: es })}
        </span>
      </div>
    )
  } else if (lastSaved) {
    // Only saved locally
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600">
        <FloppyDisk size={16} />
        <span>
          Guardado localmente {formatDistanceToNow(lastSaved, { addSuffix: true, locale: es })}
          <span className="text-xs ml-1 text-muted-foreground">(no en servidor)</span>
        </span>
      </div>
    )
  }
  
  return null
}
