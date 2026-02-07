/**
 * CoursePreviewRenderer
 *
 * Renders actual block content (text, images, video, audio, code, files)
 * for the student-facing preview in ReviewPublishStep.
 */
import { CourseStructure, LessonBlock } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tree,
  Book,
  Question,
  Sparkle,
  Lightning,
  Code,
  MusicNote,
  VideoCamera,
} from '@phosphor-icons/react'
import { VideoPreview } from '../VideoPreview'
import { useSasUrl } from '@/hooks/useSasUrl'
import ReactMarkdown from 'react-markdown'

interface CoursePreviewRendererProps {
  course: CourseStructure
}

export function CoursePreviewRenderer({ course }: CoursePreviewRendererProps) {
  const totalXP = course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((acc2, l) => acc2 + l.totalXP + (l.quiz?.totalXP || 0), 0),
    0
  )

  return (
    <div className="space-y-6">
      {/* ── Course Header ── */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        {course.coverImage && <CoverImage src={course.coverImage} title={course.title} />}
        <h3 className="text-2xl lg:text-3xl font-bold mb-3">{course.title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-4">{course.description}</p>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">{course.category}</Badge>
          <Badge variant="outline">Dificultad: {course.difficulty}</Badge>
          <Badge variant="outline">{course.estimatedHours || 0} horas</Badge>
          <Badge variant="secondary">{totalXP} XP Total</Badge>
        </div>
      </div>

      {/* ── Modules ── */}
      {course.modules.map((module, moduleIndex) => (
        <Card key={module.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tree size={18} />
              Módulo {moduleIndex + 1}: {module.title}
              {module.badge && <Badge variant="outline">{module.badge}</Badge>}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{module.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {module.lessons.map((lesson, lessonIndex) => (
              <div key={lesson.id} className="space-y-3">
                {/* Lesson Header */}
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Book size={16} className="text-primary" />
                  <span className="font-semibold">
                    {lessonIndex + 1}. {lesson.title}
                  </span>
                  <div className="ml-auto flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {lesson.totalXP} XP
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {lesson.estimatedMinutes} min
                    </Badge>
                  </div>
                </div>

                {/* Lesson Blocks */}
                {lesson.blocks.length > 0 && (
                  <div className="pl-4 space-y-3">
                    {lesson.blocks.map((block) => (
                      <BlockRenderer key={block.id} block={block} />
                    ))}
                  </div>
                )}

                {/* Quiz summary */}
                {lesson.quiz && (
                  <div className="pl-4">
                    <div className="flex items-center gap-2 p-3 border border-primary/20 rounded-lg bg-primary/5">
                      <Question size={16} className="text-primary" />
                      <span className="font-medium text-sm">{lesson.quiz.title}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {lesson.quiz.questions.length} preguntas &middot; {lesson.quiz.totalXP} XP &middot;{' '}
                        {lesson.quiz.passingScore}% para aprobar
                      </span>
                    </div>
                  </div>
                )}

                {lessonIndex < module.lessons.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ──── Sub-components ──────────────────────────────────────

function CoverImage({ src, title }: { src: string; title: string }) {
  const { url } = useSasUrl(src)
  if (!url) return null
  return (
    <img
      src={url}
      alt={title}
      className="w-full h-48 object-cover rounded-lg mb-4"
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}

function BlockRenderer({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case 'welcome':
      return (
        <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
          <Sparkle size={18} className="text-primary mt-1 flex-shrink-0" />
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      )

    case 'text':
      return (
        <div
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      )

    case 'image':
      return <ImageBlock block={block} />

    case 'video':
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <VideoCamera size={14} />
            <span>Video</span>
          </div>
          {block.videoUrl ? (
            <VideoPreview videoUrl={block.videoUrl} videoType={block.videoType || 'youtube'} />
          ) : (
            <div className="p-4 border rounded-lg text-center text-muted-foreground text-sm">
              Video no configurado
            </div>
          )}
        </div>
      )

    case 'audio':
      return <AudioBlock block={block} />

    case 'code':
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Code size={14} />
            <span>Código</span>
            {(block.xpValue ?? 0) > 0 && <Badge variant="secondary" className="text-xs">{block.xpValue} XP</Badge>}
          </div>
          <div className="bg-muted rounded-lg p-4 overflow-x-auto">
            <ReactMarkdown>{block.content}</ReactMarkdown>
          </div>
        </div>
      )

    case 'challenge':
      return (
        <div className="flex items-start gap-3 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
          <Lightning size={18} className="text-yellow-600 mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm mb-1">Desafío ({block.xpValue} XP)</p>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          </div>
        </div>
      )

    case 'file':
      return (
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <div className="text-2xl">📄</div>
          <div>
            <p className="font-medium text-sm">{block.fileName || 'Archivo adjunto'}</p>
            {block.fileSize && (
              <p className="text-xs text-muted-foreground">{(block.fileSize / 1024).toFixed(0)} KB</p>
            )}
          </div>
        </div>
      )

    default:
      return (
        <div className="p-3 border rounded-lg text-sm text-muted-foreground">
          Bloque tipo "{block.type}"
        </div>
      )
  }
}

function ImageBlock({ block }: { block: LessonBlock }) {
  const { url } = useSasUrl(block.imageFile || '')
  return (
    <div className="space-y-1">
      {url ? (
        <img
          src={url}
          alt={block.content || 'Imagen del curso'}
          className="max-w-full rounded-lg border"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        <div className="p-4 border rounded-lg text-center text-muted-foreground text-sm">Imagen no disponible</div>
      )}
      {block.content && <p className="text-sm text-muted-foreground italic">{block.content}</p>}
    </div>
  )
}

function AudioBlock({ block }: { block: LessonBlock }) {
  const audioSrc = block.audioFile || block.videoUrl || block.fileUrl || ''
  const { url } = useSasUrl(audioSrc)

  if (!url) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg">
        <MusicNote size={18} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Audio no configurado</span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MusicNote size={14} />
        <span>Audio</span>
      </div>
      <audio controls className="w-full" src={url}>
        Tu navegador no soporta audio.
      </audio>
      {block.content && <p className="text-sm text-muted-foreground">{block.content}</p>}
    </div>
  )
}
