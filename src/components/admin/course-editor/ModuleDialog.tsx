import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CourseModule } from '@/services/course-management-service'

interface ModuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { title: string; description: string }) => void
  module?: CourseModule | null
  title: string
}

export function ModuleDialog({ open, onOpenChange, onSave, module, title }: ModuleDialogProps) {
  const [moduleTitle, setModuleTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (module) {
      setModuleTitle(module.title)
      setDescription(module.description || '')
    } else {
      setModuleTitle('')
      setDescription('')
    }
  }, [module, open])

  const handleSave = () => {
    if (!moduleTitle.trim()) {
      alert('Module title is required')
      return
    }

    onSave({
      title: moduleTitle.trim(),
      description: description.trim(),
    })

    // Reset form
    setModuleTitle('')
    setDescription('')
    onOpenChange(false)
  }

  const handleCancel = () => {
    setModuleTitle('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {module ? 'Update the module details below.' : 'Enter the details for your new module.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="module-title">
              Module Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="module-title"
              placeholder="e.g., Introduction to React"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && moduleTitle.trim()) {
                  handleSave()
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="module-description">Description (Optional)</Label>
            <Textarea
              id="module-description"
              placeholder="Describe what students will learn in this module..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!moduleTitle.trim()}>
            {module ? 'Update Module' : 'Create Module'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
