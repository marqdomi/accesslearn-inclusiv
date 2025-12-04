import { useState } from 'react'
import { AccessibilityProfile } from '@/hooks/use-accessibility-profiles'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ApiService } from '@/services/api.service'
import { toast } from 'sonner'
import {
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Settings,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccessibilityProfileCardProps {
  profile: AccessibilityProfile
  onEdit: () => void
  onToggle: (enabled: boolean) => Promise<void>
  onDelete: () => Promise<void>
  onDuplicate: () => Promise<void>
}

export function AccessibilityProfileCard({
  profile,
  onEdit,
  onToggle,
  onDelete,
  onDuplicate,
}: AccessibilityProfileCardProps) {
  const [isToggling, setIsToggling] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  const handleToggle = async (enabled: boolean) => {
    try {
      setIsToggling(true)
      await ApiService.toggleAccessibilityProfile(profile.id, enabled)
      toast.success(
        enabled
          ? `Perfil "${profile.name}" activado`
          : `Perfil "${profile.name}" desactivado`
      )
      await onToggle(enabled)
    } catch (error: any) {
      console.error('Error toggling profile:', error)
      toast.error(error.message || 'Error al cambiar el estado del perfil')
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await ApiService.deleteAccessibilityProfile(profile.id)
      toast.success(`Perfil "${profile.name}" eliminado`)
      setShowDeleteDialog(false)
      await onDelete()
    } catch (error: any) {
      console.error('Error deleting profile:', error)
      toast.error(error.message || 'Error al eliminar el perfil')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDuplicate = async () => {
    try {
      setIsDuplicating(true)
      const newName = `${profile.name} (Copia)`
      await ApiService.duplicateAccessibilityProfile(profile.id, newName)
      toast.success(`Perfil duplicado como "${newName}"`)
      await onDuplicate()
    } catch (error: any) {
      console.error('Error duplicating profile:', error)
      toast.error(error.message || 'Error al duplicar el perfil')
    } finally {
      setIsDuplicating(false)
    }
  }

  return (
    <>
      <Card
        className={cn(
          'transition-all hover:shadow-md',
          profile.enabled && 'border-primary/50 bg-primary/5'
        )}
      >
        <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              {profile.icon ? (
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              ) : (
                <div className="p-1.5 sm:p-2 rounded-lg bg-muted flex-shrink-0">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                  <CardTitle className="text-sm sm:text-lg truncate">{profile.name}</CardTitle>
                  {profile.isDefault && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">
                      Sistema
                    </Badge>
                  )}
                  {profile.enabled && (
                    <Badge variant="default" className="text-[10px] sm:text-xs bg-green-500">
                      <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                      Activo
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs sm:text-sm line-clamp-2">
                  {profile.description}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 touch-target">
                  <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit} className="text-xs sm:text-sm">
                  <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating} className="text-xs sm:text-sm">
                  <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                {!profile.isDefault && (
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive text-xs sm:text-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0 p-4 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            {/* Metadata Preview */}
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Audiencia:</p>
              <p className="text-xs sm:text-sm">{profile.metadata.targetAudience}</p>
            </div>

            {/* Benefits Preview */}
            {profile.metadata.benefits.length > 0 && (
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Beneficios:</p>
                <ul className="text-[10px] sm:text-xs text-muted-foreground space-y-0.5">
                  {profile.metadata.benefits.slice(0, 2).map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span>•</span>
                      <span className="line-clamp-1">{benefit}</span>
                    </li>
                  ))}
                  {profile.metadata.benefits.length > 2 && (
                    <li className="text-[10px] sm:text-xs text-muted-foreground/70">
                      +{profile.metadata.benefits.length - 2} más
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Toggle Switch */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                {profile.enabled ? (
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className="text-xs sm:text-sm font-medium truncate">
                  {profile.enabled ? 'Visible para usuarios' : 'Oculto para usuarios'}
                </span>
              </div>
              <Switch
                checked={profile.enabled}
                onCheckedChange={handleToggle}
                disabled={isToggling}
                className="flex-shrink-0 touch-target"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El perfil "{profile.name}" será eliminado
              permanentemente. Los usuarios que lo tengan activo perderán la configuración.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

