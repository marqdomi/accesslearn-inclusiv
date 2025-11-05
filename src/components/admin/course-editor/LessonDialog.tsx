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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CourseLesson } from '@/services/course-management-service'
import { Video, FileText, Brain, Code, Dumbbell } from 'lucide-react'

interface LessonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: {
    title: string
    description: string
    type: 'video' | 'text' | 'quiz' | 'interactive' | 'exercise'
  }) => void
  lesson?: CourseLesson | null
  title: string
}

const lessonTypes = [
  { value: 'video', label: 'Video', icon: Video, color: 'text-blue-500' },
  { value: 'text', label: 'Text', icon: FileText, color: 'text-green-500' },
  { value: 'quiz', label: 'Quiz', icon: Brain, color: 'text-purple-500' },
  { value: 'interactive', label: 'Interactive', icon: Code, color: 'text-orange-500' },
  { value: 'exercise', label: 'Exercise', icon: Dumbbell, color: 'text-red-500' },
] as const

export function LessonDialog({ open, onOpenChange, onSave, lesson, title }: LessonDialogProps) {
  const [lessonTitle, setLessonTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'video' | 'text' | 'quiz' | 'interactive' | 'exercise'>('text')

  useEffect(() => {
    if (lesson) {
      setLessonTitle(lesson.title)
      setDescription(lesson.description || '')
      setType(lesson.type)
    } else {
      setLessonTitle('')
      setDescription('')
      setType('text')
    }
  }, [lesson, open])

  const handleSave = () => {
    if (!lessonTitle.trim()) {
      alert('Lesson title is required')
      return
    }

    onSave({
      title: lessonTitle.trim(),
      description: description.trim(),
      type,
    })

    // Reset form
    setLessonTitle('')
    setDescription('')
    setType('text')
    onOpenChange(false)
  }

  const handleCancel = () => {
    setLessonTitle('')
    setDescription('')
    setType('text')
    onOpenChange(false)
  }

  const selectedType = lessonTypes.find((t) => t.value === type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {lesson
              ? 'Update the lesson details below.'
              : 'Enter the details for your new lesson.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">
              Lesson Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lesson-title"
              placeholder="e.g., What is React?"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && lessonTitle.trim()) {
                  handleSave()
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-type">
              Lesson Type <span className="text-destructive">*</span>
            </Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger id="lesson-type">
                <SelectValue>
                  {selectedType && (
                    <div className="flex items-center gap-2">
                      <selectedType.icon className={`h-4 w-4 ${selectedType.color}`} />
                      <span>{selectedType.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {lessonTypes.map((lessonType) => (
                  <SelectItem key={lessonType.value} value={lessonType.value}>
                    <div className="flex items-center gap-2">
                      <lessonType.icon className={`h-4 w-4 ${lessonType.color}`} />
                      <span>{lessonType.label}</span>
                      {lessonType.value === 'quiz' && (
                        <Badge variant="secondary" className="ml-auto">
                          Interactive
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-description">Description (Optional)</Label>
            <Textarea
              id="lesson-description"
              placeholder="Describe what students will learn in this lesson..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!lessonTitle.trim()}>
            {lesson ? 'Update Lesson' : 'Create Lesson'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
