import { useState, useRef, useEffect } from 'react'
import { LessonBlock } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  TextB, TextItalic, ListBullets, ListNumbers, 
  Image as ImageIcon, Video, UploadSimple, Link as LinkIcon,
  Warning, CheckCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ApiService } from '@/services/api.service'

interface WYSIWYGEditorProps {
  block: LessonBlock
  onChange: (block: LessonBlock) => void
  onSave: () => void
  onCancel: () => void
  courseId?: string
  lessonId?: string
}

export function WYSIWYGEditor({ block, onChange, onSave, onCancel, courseId, lessonId }: WYSIWYGEditorProps) {
  const [content, setContent] = useState(block.content)
  const [altText, setAltText] = useState(block.accessibility?.altText || '')
  const [captions, setCaptions] = useState(block.accessibility?.captions || '')
  const [videoUrl, setVideoUrl] = useState(block.videoUrl || '')
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'video'>('text')
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const captionInputRef = useRef<HTMLInputElement>(null)

  // Load image preview URL when block changes
  useEffect(() => {
    const loadImagePreview = async () => {
      if (block.type === 'image' && block.imageFile) {
        // Si ya es una URL (con SAS token o externa), usarla directamente
        if (block.imageFile.startsWith('http') || block.imageFile.startsWith('data:')) {
          setImagePreviewUrl(block.imageFile)
        } else if (block.imageFile.includes('/')) {
          // Es un blobName (formato: container/blobName), generar URL con SAS
          try {
            const [containerName, ...blobNameParts] = block.imageFile.split('/')
            const blobName = blobNameParts.join('/')
            const { url } = await ApiService.getMediaUrl(containerName, blobName)
            setImagePreviewUrl(url)
          } catch (error) {
            console.error('Error generating image preview URL:', error)
            setImagePreviewUrl(null)
          }
        } else {
          setImagePreviewUrl(block.imageFile)
        }
      } else {
        setImagePreviewUrl(null)
      }
    }

    loadImagePreview()
  }, [block.imageFile, block.type])

  const applyFormatting = (format: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    let newText = ''
    switch (format) {
      case 'bold':
        newText = content.substring(0, start) + `**${selectedText}**` + content.substring(end)
        break
      case 'italic':
        newText = content.substring(0, start) + `*${selectedText}*` + content.substring(end)
        break
      case 'ul':
        newText = content.substring(0, start) + `\n- ${selectedText}` + content.substring(end)
        break
      case 'ol':
        newText = content.substring(0, start) + `\n1. ${selectedText}` + content.substring(end)
        break
      default:
        return
    }

    setContent(newText)
    onChange({ ...block, content: newText })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, sube un archivo de imagen (JPG, PNG, GIF)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB')
      return
    }

    // Si no hay courseId o lessonId, usar Base64 como fallback
    if (!courseId || !lessonId) {
      console.warn('[WYSIWYGEditor] courseId o lessonId no disponibles, usando Base64 como fallback')
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        onChange({
          ...block,
          type: 'image',
          content: dataUrl,
          imageFile: dataUrl,
          accessibility: { ...block.accessibility, altText }
        })
        toast.success('Imagen subida exitosamente')
      }
      reader.readAsDataURL(file)
      return
    }

    try {
      // Upload to Blob Storage
      const { url, blobName, containerName } = await ApiService.uploadFile(file, 'lesson-image', {
        courseId,
        lessonId
      })

      // Guardar blobName en formato container/blobName para Cosmos DB
      const blobNameForStorage = `${containerName}/${blobName}`
      
      onChange({
        ...block,
        type: 'image',
        content: blobNameForStorage, // Guardar blobName en lugar de Base64
        imageFile: blobNameForStorage, // Guardar blobName también en imageFile para consistencia
        accessibility: { ...block.accessibility, altText }
      })
      
      // Actualizar preview con URL con SAS token
      setImagePreviewUrl(url)
      toast.success('Imagen subida exitosamente')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(error.message || 'Error al subir la imagen')
    }
  }

  const handleCaptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.srt') && !file.name.endsWith('.vtt')) {
      toast.error('Please upload a caption file (.srt or .vtt)')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const captionData = event.target?.result as string
      setCaptions(captionData)
      onChange({
        ...block,
        accessibility: { ...block.accessibility, captions: captionData }
      })
      toast.success('Captions uploaded successfully')
    }
    reader.readAsText(file)
  }

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url)
    
    let videoType: 'youtube' | 'vimeo' | 'wistia' | 'upload' = 'upload'
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      videoType = 'youtube'
    } else if (url.includes('vimeo.com')) {
      videoType = 'vimeo'
    } else if (url.includes('wistia.com')) {
      videoType = 'wistia'
    }

    onChange({
      ...block,
      type: 'video',
      videoUrl: url,
      videoType,
      content: url
    })
  }

  const canSave = () => {
    if (block.type === 'image' && !altText) return false
    if (block.type === 'video' && !captions) return false
    if (block.type === 'text' && !content.trim()) return false
    return true
  }

  const handleSave = () => {
    if (!canSave()) {
      toast.error('Please complete all required fields before saving')
      return
    }

    onChange({
      ...block,
      content,
      accessibility: {
        ...block.accessibility,
        altText: block.type === 'image' ? altText : undefined,
        captions: block.type === 'video' ? captions : undefined
      }
    })
    onSave()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="text">Text Content</TabsTrigger>
            <TabsTrigger value="image">Image Upload</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-1 border-b pb-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting('bold')}
                  title="Bold"
                >
                  <TextB size={20} weight="bold" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting('italic')}
                  title="Italic"
                >
                  <TextItalic size={20} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting('ul')}
                  title="Bullet List"
                >
                  <ListBullets size={20} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting('ol')}
                  title="Numbered List"
                >
                  <ListNumbers size={20} />
                </Button>
              </div>

              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  onChange({ ...block, content: e.target.value, type: 'text' })
                }}
                placeholder="Enter your lesson content here. Use the formatting buttons above for bold, italic, and lists."
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use **text** for bold, *text* for italic, - for bullet lists, 1. for numbered lists
              </p>
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUpload">Upload Image</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadSimple size={20} className="mr-2" />
                    Choose Image File
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG, or GIF • Max 5MB
                  </p>
                </div>
              </div>

              {imagePreviewUrl && (
                <div className="border rounded-lg p-4">
                  <img src={imagePreviewUrl} alt="Preview" className="max-w-full h-auto rounded" />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="altText">
                    Alt Text (Alternative Text) *
                  </Label>
                  {altText ? (
                    <Badge variant="outline" className="gap-1 border-success text-success">
                      <CheckCircle size={14} weight="fill" />
                      Required
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <Warning size={14} weight="fill" />
                      Required
                    </Badge>
                  )}
                </div>
                <Input
                  id="altText"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe this image for screen reader users"
                  className={!altText ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  Describe what's in the image. Be specific and concise (minimum 10 characters).
                </p>
                {!altText && (
                  <Alert variant="destructive">
                    <Warning size={20} />
                    <AlertDescription>
                      Alt text is required for accessibility compliance. You cannot save without it.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="Paste YouTube, Vimeo, or Wistia URL"
                />
                <p className="text-xs text-muted-foreground">
                  Supports YouTube, Vimeo, and Wistia embeds
                </p>
              </div>

              {videoUrl && (
                <div className="border rounded-lg p-4 bg-muted">
                  <p className="text-sm">
                    Video URL detected: <span className="font-mono text-xs">{videoUrl}</span>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="captionUpload">
                    Caption File (.srt or .vtt) *
                  </Label>
                  {captions ? (
                    <Badge variant="outline" className="gap-1 border-success text-success">
                      <CheckCircle size={14} weight="fill" />
                      Required
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <Warning size={14} weight="fill" />
                      Required
                    </Badge>
                  )}
                </div>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    ref={captionInputRef}
                    id="captionUpload"
                    type="file"
                    accept=".srt,.vtt"
                    onChange={handleCaptionUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => captionInputRef.current?.click()}
                  >
                    <UploadSimple size={20} className="mr-2" />
                    Upload Caption File
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    .srt or .vtt format
                  </p>
                </div>
                {captions && (
                  <p className="text-sm text-success">✓ Caption file uploaded</p>
                )}
                {!captions && (
                  <Alert variant="destructive">
                    <Warning size={20} />
                    <AlertDescription>
                      Captions are required for accessibility compliance. You cannot publish without them.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave()}>
            {canSave() ? 'Save Content' : 'Complete Required Fields'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
