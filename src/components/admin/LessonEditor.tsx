import { useState } from 'react'
import { Lesson, LessonBlock, AccessibilityMetadata } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Trash, ArrowLeft, FloppyDisk, Image, VideoCamera, MicrophoneStage, Article, Code, GameController, Warning } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'

interface LessonEditorProps {
  lesson: Lesson
  moduleTitle: string
  onSave: (lesson: Lesson) => void
  onCancel: () => void
}

export function LessonEditor({ lesson, moduleTitle, onSave, onCancel }: LessonEditorProps) {
  const [editedLesson, setEditedLesson] = useState<Lesson>(lesson)
  const [errors, setErrors] = useState<string[]>([])

  const updateLesson = (field: keyof Lesson, value: any) => {
    setEditedLesson(prev => ({ ...prev, [field]: value }))
  }

  const addBlock = (type: LessonBlock['type']) => {
    const newBlock: LessonBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      order: editedLesson.blocks.length,
      xpValue: type === 'challenge' ? 10 : 0,
      accessibility: {}
    }

    updateLesson('blocks', [...editedLesson.blocks, newBlock])
  }

  const updateBlock = (blockId: string, updates: Partial<LessonBlock>) => {
    updateLesson('blocks', editedLesson.blocks.map(b =>
      b.id === blockId ? { ...b, ...updates } : b
    ))
  }

  const deleteBlock = (blockId: string) => {
    updateLesson('blocks', editedLesson.blocks.filter(b => b.id !== blockId))
  }

  const updateAccessibility = (blockId: string, field: keyof AccessibilityMetadata, value: string) => {
    const block = editedLesson.blocks.find(b => b.id === blockId)
    if (!block) return

    updateBlock(blockId, {
      accessibility: {
        ...block.accessibility,
        [field]: value
      }
    })
  }

  const validateLesson = (): string[] => {
    const validationErrors: string[] = []

    if (!editedLesson.title.trim()) {
      validationErrors.push('Lesson title is required')
    }

    editedLesson.blocks.forEach((block, idx) => {
      if (block.type === 'image' && !block.accessibility?.altText?.trim()) {
        validationErrors.push(`Block ${idx + 1} (Image): Alt text is required for accessibility`)
      }
      if (block.type === 'video' && !block.accessibility?.captions?.trim()) {
        validationErrors.push(`Block ${idx + 1} (Video): Captions are required for accessibility`)
      }
      if (block.type === 'audio' && !block.accessibility?.transcript?.trim()) {
        validationErrors.push(`Block ${idx + 1} (Audio): Transcript is required for accessibility`)
      }
      if (!block.content.trim() && block.type !== 'welcome') {
        validationErrors.push(`Block ${idx + 1} (${block.type}): Content cannot be empty`)
      }
    })

    return validationErrors
  }

  const handleSave = () => {
    const validationErrors = validateLesson()
    setErrors(validationErrors)

    if (validationErrors.length > 0) {
      return
    }

    const totalXP = editedLesson.blocks.reduce((sum, block) => sum + (block.xpValue || 0), 0)
    onSave({ ...editedLesson, totalXP })
  }

  const blockIcons: Record<LessonBlock['type'], any> = {
    welcome: GameController,
    text: Article,
    image: Image,
    audio: MicrophoneStage,
    video: VideoCamera,
    challenge: GameController,
    code: Code
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h3 className="text-xl font-bold">Edit Lesson</h3>
            <p className="text-sm text-muted-foreground">in {moduleTitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>
            <FloppyDisk className="mr-2" size={18} />
            Save Lesson
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <Warning size={18} />
          <AlertDescription>
            <p className="font-medium mb-2">Cannot save: {errors.length} error(s)</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Lesson Title *</Label>
            <Input
              id="lesson-title"
              placeholder="e.g., What are HTML Tags?"
              value={editedLesson.title}
              onChange={(e) => updateLesson('title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-description">Description</Label>
            <Textarea
              id="lesson-description"
              placeholder="Brief description of what this lesson covers"
              value={editedLesson.description}
              onChange={(e) => updateLesson('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated-minutes">Estimated Minutes</Label>
              <Input
                id="estimated-minutes"
                type="number"
                min="1"
                value={editedLesson.estimatedMinutes}
                onChange={(e) => updateLesson('estimatedMinutes', parseInt(e.target.value) || 5)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Content Blocks</CardTitle>
          <CardDescription>
            Add text, media, and interactive challenges to build your lesson
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => addBlock('welcome')}>
              <GameController className="mr-2" size={16} />
              Welcome
            </Button>
            <Button size="sm" variant="outline" onClick={() => addBlock('text')}>
              <Article className="mr-2" size={16} />
              Text
            </Button>
            <Button size="sm" variant="outline" onClick={() => addBlock('image')}>
              <Image className="mr-2" size={16} />
              Image
            </Button>
            <Button size="sm" variant="outline" onClick={() => addBlock('video')}>
              <VideoCamera className="mr-2" size={16} />
              Video
            </Button>
            <Button size="sm" variant="outline" onClick={() => addBlock('audio')}>
              <MicrophoneStage className="mr-2" size={16} />
              Audio
            </Button>
            <Button size="sm" variant="outline" onClick={() => addBlock('challenge')}>
              <GameController className="mr-2" size={16} />
              Challenge
            </Button>
          </div>

          {editedLesson.blocks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No content blocks yet. Add blocks above to build your lesson.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {editedLesson.blocks.map((block, idx) => {
                const BlockIcon = blockIcons[block.type]
                return (
                  <Card key={block.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BlockIcon size={20} className="text-primary" />
                          <CardTitle className="text-base">
                            Block {idx + 1}: {block.type}
                          </CardTitle>
                          {(block.xpValue ?? 0) > 0 && (
                            <Badge variant="secondary">{block.xpValue} XP</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteBlock(block.id)}
                        >
                          <Trash size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {block.type === 'welcome' && (
                        <>
                          <div className="space-y-2">
                            <Label>Character Message</Label>
                            <Textarea
                              placeholder="Welcome message from your guide character"
                              value={block.characterMessage || ''}
                              onChange={(e) => updateBlock(block.id, { characterMessage: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Main Content</Label>
                            <Textarea
                              placeholder="Welcome text content"
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                              rows={3}
                            />
                          </div>
                        </>
                      )}

                      {block.type === 'text' && (
                        <div className="space-y-2">
                          <Label>Text Content</Label>
                          <Textarea
                            placeholder="Enter your lesson text..."
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            rows={4}
                          />
                        </div>
                      )}

                      {block.type === 'image' && (
                        <>
                          <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              Alt Text *
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            </Label>
                            <Textarea
                              placeholder="Describe this image for users who cannot see it"
                              value={block.accessibility?.altText || ''}
                              onChange={(e) => updateAccessibility(block.id, 'altText', e.target.value)}
                              rows={2}
                            />
                            <p className="text-xs text-muted-foreground">
                              💡 Describe the image's content and purpose. Be specific and concise.
                            </p>
                          </div>
                        </>
                      )}

                      {block.type === 'video' && (
                        <>
                          <div className="space-y-2">
                            <Label>Video URL</Label>
                            <Input
                              placeholder="https://example.com/video.mp4"
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              Captions/Subtitles File *
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            </Label>
                            <Input
                              placeholder="URL to .vtt or .srt caption file"
                              value={block.accessibility?.captions || ''}
                              onChange={(e) => updateAccessibility(block.id, 'captions', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              💡 Upload a .vtt or .srt caption file for accessibility
                            </p>
                          </div>
                        </>
                      )}

                      {block.type === 'audio' && (
                        <>
                          <div className="space-y-2">
                            <Label>Audio URL</Label>
                            <Input
                              placeholder="https://example.com/audio.mp3"
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              Transcript *
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            </Label>
                            <Textarea
                              placeholder="Full text transcript of the audio"
                              value={block.accessibility?.transcript || ''}
                              onChange={(e) => updateAccessibility(block.id, 'transcript', e.target.value)}
                              rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                              💡 Provide a complete text version of the audio content
                            </p>
                          </div>
                        </>
                      )}

                      {block.type === 'challenge' && (
                        <>
                          <div className="space-y-2">
                            <Label>Challenge Question</Label>
                            <Textarea
                              placeholder="What challenge will the learner complete?"
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>XP Reward</Label>
                            <Input
                              type="number"
                              min="0"
                              value={block.xpValue ?? 0}
                              onChange={(e) => updateBlock(block.id, { xpValue: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-muted-foreground">
                              💡 Suggested: 10-20 XP for simple challenges, 30-50 for complex ones
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
