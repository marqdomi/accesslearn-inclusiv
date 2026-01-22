import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'
import { ApiService } from '@/services/api.service'
import { getFileTypeIcon, formatFileSize, canPreviewFile } from '@/lib/file-utils'
import { 
  DownloadSimple,
  Eye,
  SpinnerGap
} from '@phosphor-icons/react'

interface FileBlockProps {
  fileUrl: string
  fileName?: string
  fileSize?: number
  fileType?: string
  description?: string
}

export function FileBlock({ fileUrl, fileName, fileSize, fileType, description }: FileBlockProps) {
  const { preferences } = useAccessibilityPreferences()
  const shouldAnimate = !preferences?.reduceMotion
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const FileTypeIcon = getFileTypeIcon(fileType)

  // Get secure download URL
  const getDownloadUrl = async () => {
    if (!fileUrl) return

    setIsLoading(true)
    setError(null)

    try {
      // If fileUrl is already a full URL with SAS token, use it directly
      if (fileUrl.startsWith('http')) {
        setDownloadUrl(fileUrl)
        return
      }

      // Otherwise, it's a blobName reference (container/path)
      const parts = fileUrl.split('/')
      const containerName = parts[0]
      const blobName = parts.slice(1).join('/')

      const { url } = await ApiService.getMediaUrl(containerName, blobName)
      setDownloadUrl(url)
    } catch (err: any) {
      console.error('Error getting download URL:', err)
      setError('No se pudo obtener el enlace de descarga')
    } finally {
      setIsLoading(false)
    }
  }

  // Get download URL on mount
  useEffect(() => {
    getDownloadUrl()
  }, [fileUrl])

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    }
  }

  const handlePreview = () => {
    if (downloadUrl && canPreviewFile(fileType)) {
      window.open(downloadUrl, '_blank')
    }
  }

  return (
    <Card className="overflow-hidden">
      <motion.div
        initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
            {(() => {
              const Icon = getFileTypeIcon(fileType)
              return <Icon size={32} className="text-primary" />
            })()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-lg truncate">
              {fileName || 'Material de Apoyo'}
            </h4>
            
            {description && (
              <p className="text-muted-foreground mt-1">
                {description}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              {fileSize && (
                <span>{formatFileSize(fileSize)}</span>
              )}
              {fileType && (
                <>
                  {fileSize && <span>•</span>}
                  <span>{fileType.split('/').pop()?.toUpperCase()}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
            <Button 
              variant="link" 
              size="sm" 
              onClick={getDownloadUrl}
              className="ml-2 p-0 h-auto text-destructive underline"
            >
              Reintentar
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          <Button
            onClick={handleDownload}
            disabled={isLoading || !downloadUrl}
            className="gap-2"
          >
            {isLoading ? (
              <SpinnerGap size={18} className="animate-spin" />
            ) : (
              <DownloadSimple size={18} />
            )}
            Descargar
          </Button>

          {canPreviewFile(fileType) && (
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={isLoading || !downloadUrl}
              className="gap-2"
            >
              <Eye size={18} />
              Vista Previa
            </Button>
          )}
        </div>
      </motion.div>
    </Card>
  )
}
