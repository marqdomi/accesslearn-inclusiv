import { useState } from 'react'
import { Certificate, CompanySettings } from '@/lib/types'
import { generateCertificatePDF, downloadCertificate } from '@/lib/certificate-generator'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Certificate as CertificateIcon, Download, Check } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface CertificateCardProps {
  certificate: Certificate
  companySettings: CompanySettings
  variant?: 'compact' | 'full'
}

export function CertificateCard({ certificate, companySettings, variant = 'compact' }: CertificateCardProps) {
  const { t } = useTranslation()
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    
    try {
      const translations = {
        certificateTitle: t('certificate.title'),
        awardedTo: t('certificate.awardedTo'),
        completion: t('certificate.completion'),
        courseLabel: t('certificate.courseLabel'),
        dateLabel: t('certificate.dateLabel'),
        companyLabel: t('certificate.companyLabel'),
        certificateId: t('certificate.certificateId'),
        signature: t('certificate.signature')
      }

      const blob = await generateCertificatePDF(certificate, companySettings, translations)
      const fileName = `Certificate-${certificate.courseTitle.replace(/[^a-z0-9]/gi, '-')}-${certificate.certificateCode}.png`
      downloadCertificate(blob, fileName)
      
      toast.success(t('certificate.downloadSuccess'))
    } catch (error) {
      console.error('Certificate download error:', error)
      toast.error(t('certificate.downloadError'))
    } finally {
      setIsDownloading(false)
    }
  }

  const completionDate = new Date(certificate.completionDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  if (variant === 'compact') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-secondary to-accent shrink-0">
                <CertificateIcon size={24} weight="fill" className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-foreground truncate">
                  {certificate.courseTitle}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('certificate.completedOn')} {completionDate}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {certificate.certificateCode}
                </p>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              size="sm"
              className="gap-2 shrink-0"
            >
              <Download size={16} />
              {isDownloading ? t('certificate.downloading') : t('certificate.download')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary via-secondary to-accent">
                <CertificateIcon size={40} weight="fill" className="text-white" />
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
                {t('certificate.title')}
              </h2>
              <p className="text-muted-foreground">{t('certificate.awardedTo')}</p>
            </div>

            <div className="py-6 border-y border-border">
              <p className="text-2xl font-bold text-foreground mb-2">
                {certificate.userFullName}
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                {t('certificate.completion')}
              </p>
              <p className="text-xl font-semibold text-primary">
                {certificate.courseTitle}
              </p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{t('certificate.dateLabel')}: <span className="font-medium text-foreground">{completionDate}</span></p>
              <p className="font-mono text-xs">{t('certificate.certificateId')}: {certificate.certificateCode}</p>
            </div>

            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              size="lg"
              className="gap-2"
            >
              <Download size={20} />
              {isDownloading ? t('certificate.downloading') : t('certificate.downloadCertificate')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
