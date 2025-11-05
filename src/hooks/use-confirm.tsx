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
import { useState } from 'react'
import { createRoot } from 'react-dom/client'

interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function useConfirm() {
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const div = document.createElement('div')
      document.body.appendChild(div)
      const root = createRoot(div)

      const cleanup = () => {
        root.unmount()
        document.body.removeChild(div)
      }

      const ConfirmDialog = () => {
        const [open, setOpen] = useState(true)

        const handleConfirm = () => {
          setOpen(false)
          setTimeout(() => {
            cleanup()
            resolve(true)
          }, 100)
        }

        const handleCancel = () => {
          setOpen(false)
          setTimeout(() => {
            cleanup()
            resolve(false)
          }, 100)
        }

        return (
          <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{options.title}</AlertDialogTitle>
                <AlertDialogDescription>{options.description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCancel}>
                  {options.cancelText || 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirm}
                  className={options.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                >
                  {options.confirmText || 'Confirm'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      }

      root.render(<ConfirmDialog />)
    })
  }

  return { confirm }
}
