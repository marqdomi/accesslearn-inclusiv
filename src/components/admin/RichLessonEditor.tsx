import { useState, useEffect } from 'react'
import { Lesson, LessonBlock } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, FloppyDisk, Plus, Trash, 
  TextB, Image as ImageIcon, Video, File as FileIcon,
  Article, DotsSixVertical, CaretUp, CaretDown
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { WYSIWYGEditor } from './WYSIWYGEditor'
import { useTranslation } from '@/lib/i18n'

interface RichLessonEditorProps {
  lesson: Lesson | null
  onSave: (lesson: Lesson) => void
  onClose: () => void
}

export function RichLessonEditor({ lesson, onSave, onClose }: RichLessonEditorProps) {
  const { t } = useTranslation()
  const [editedLesson, setEditedLesson] = useState<Lesson>(lesson || {
    id: `lesson-${Date.now()}`,
    title: '',
    description: '',
    blocks: [],
    totalXP: 0,
    estimatedMinutes: 5
  })

  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null)

  useEffect(() => {
    if (lesson) {
      setEditedLesson(lesson)
    }
  }, [lesson])

  const addBlock = (type: LessonBlock['type']) => {
    const newBlock: LessonBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      order: editedLesson.blocks.length
    }

    setEditedLesson(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }))

    // Auto-open editor for new block
    setEditingBlockIndex(editedLesson.blocks.length)
  }

  const updateBlock = (index: number, updates: Partial<LessonBlock>) => {
    const updatedBlocks = [...editedLesson.blocks]
    updatedBlocks[index] = { ...updatedBlocks[index], ...updates }
    setEditedLesson(prev => ({ ...prev, blocks: updatedBlocks }))
  }

  const deleteBlock = (index: number) => {
    setEditedLesson(prev => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index).map((b, idx) => ({ ...b, order: idx }))
    }))
    toast.success(t('courseBuilder.lessonEditor.blockDeleted'))
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === editedLesson.blocks.length - 1)) {
      return
    }

    const newBlocks = [...editedLesson.blocks]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]]
    
    setEditedLesson(prev => ({
      ...prev,
      blocks: newBlocks.map((b, idx) => ({ ...b, order: idx }))
    }))
  }

  const handleSave = () => {
    if (!editedLesson.title.trim()) {
      toast.error(t('courseBuilder.lessonEditor.lessonTitleRequired'))
      return
    }

    // Calculate XP based on content complexity
    const xp = editedLesson.blocks.length * 10
    const minutes = Math.max(5, editedLesson.blocks.length * 3)

    const finalLesson: Lesson = {
      ...editedLesson,
      totalXP: xp,
      estimatedMinutes: minutes
    }

    onSave(finalLesson)
    toast.success(t('courseBuilder.lessonEditor.lessonSaved'))
    onClose()
  }

  const getBlockIcon = (type: LessonBlock['type']) => {
    switch (type) {
      case 'text': return <TextB size={20} />
      case 'image': return <ImageIcon size={20} />
      case 'video': return <Video size={20} />
      case 'audio': return <FileIcon size={20} />
      case 'code': return <TextB size={20} />
      default: return <Article size={20} />
    }
  }

  const getBlockPreview = (block: LessonBlock) => {
    switch (block.type) {
      case 'text':
        return <p className="text-sm text-muted-foreground line-clamp-2">{block.content || 'Empty text block'}</p>
      case 'image':
        return (
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{block.imageFile || 'No image selected'}</span>
          </div>
        )
      case 'video':
        return (
          <div className="flex items-center gap-2">
            <Video size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{block.videoUrl || 'No video URL'}</span>
          </div>
        )
      case 'audio':
        return (
          <div className="flex items-center gap-2">
            <FileIcon size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Audio block</span>
          </div>
        )
      default:
        return null
    }
  }

  if (!lesson) return null

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Article size={28} weight="duotone" />
                  {lesson.id.startsWith('lesson-') && editedLesson.title === '' ? t('courseBuilder.lessonEditor.createNew') : t('courseBuilder.lessonEditor.edit')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('courseBuilder.lessonEditor.description')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                {t('courseBuilder.lessonEditor.cancel')}
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <FloppyDisk size={20} />
                {t('courseBuilder.lessonEditor.saveLesson')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('courseBuilder.lessonEditor.lessonDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">{t('courseBuilder.lessonEditor.lessonTitle')}</Label>
                <Input
                  id="lesson-title"
                  value={editedLesson.title}
                  onChange={(e) => setEditedLesson(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('courseBuilder.lessonEditor.lessonTitlePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-description">{t('courseBuilder.lessonEditor.lessonDescription')}</Label>
                <Textarea
                  id="lesson-description"
                  value={editedLesson.description}
                  onChange={(e) => setEditedLesson(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('courseBuilder.lessonEditor.lessonDescriptionPlaceholder')}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Blocks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('courseBuilder.lessonEditor.lessonContent')}</CardTitle>
              <CardDescription>{t('courseBuilder.lessonEditor.lessonContentDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => addBlock('text')} variant="outline" size="sm">
                  <TextB size={16} className="mr-2" />
                  {t('courseBuilder.lessonEditor.addText')}
                </Button>
                <Button onClick={() => addBlock('image')} variant="outline" size="sm">
                  <ImageIcon size={16} className="mr-2" />
                  {t('courseBuilder.lessonEditor.addImage')}
                </Button>
                <Button onClick={() => addBlock('video')} variant="outline" size="sm">
                  <Video size={16} className="mr-2" />
                  {t('courseBuilder.lessonEditor.embedVideo')}
                </Button>
                <Button onClick={() => addBlock('audio')} variant="outline" size="sm">
                  <FileIcon size={16} className="mr-2" />
                  {t('courseBuilder.lessonEditor.addAudio')}
                </Button>
                <Button onClick={() => addBlock('code')} variant="outline" size="sm">
                  <TextB size={16} className="mr-2" />
                  {t('courseBuilder.lessonEditor.addCodeBlock')}
                </Button>
              </div>

              {editedLesson.blocks.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Article size={40} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('courseBuilder.lessonEditor.noContentBlocks')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {editedLesson.blocks.map((block, index) => (
                    <Card key={block.id} className="bg-muted/30">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-1 text-muted-foreground mt-1">
                            <DotsSixVertical size={16} />
                            {getBlockIcon(block.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {block.type}
                              </Badge>
                            </div>
                            {getBlockPreview(block)}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => moveBlock(index, 'up')}
                              disabled={index === 0}
                            >
                              <CaretUp size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => moveBlock(index, 'down')}
                              disabled={index === editedLesson.blocks.length - 1}
                            >
                              <CaretDown size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingBlockIndex(index)}
                            >
                              <Article size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteBlock(index)}
                            >
                              <Trash size={16} className="text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      {/* Block Editor Dialog */}
      {editingBlockIndex !== null && (
        <WYSIWYGEditor
          block={editedLesson.blocks[editingBlockIndex]}
          onChange={(updatedBlock) => updateBlock(editingBlockIndex, updatedBlock)}
          onSave={() => setEditingBlockIndex(null)}
          onCancel={() => setEditingBlockIndex(null)}
        />
      )}
    </div>
  )
}
