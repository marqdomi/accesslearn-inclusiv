import { useMemo } from 'react'
import { useCertificates, useCompanySettings } from '@/hooks/use-certificates'
import { CertificateCard } from './CertificateCard'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Certificate as CertificateIcon } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface MyCertificatesProps {
  userId: string
}

export function MyCertificates({ userId }: MyCertificatesProps) {
  const { t } = useTranslation()
  const { getUserCertificates } = useCertificates(userId)
  const { companySettings } = useCompanySettings()
  
  const userCertificates = useMemo(() => {
    return getUserCertificates(userId).sort((a, b) => b.completionDate - a.completionDate)
  }, [getUserCertificates, userId])

  if (userCertificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
          <CertificateIcon size={48} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t('certificates.noCertificates')}
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          {t('certificates.noCertificatesDesc')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-secondary to-accent">
          <CertificateIcon size={24} weight="fill" className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {t('certificates.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('certificates.subtitle').replace('{count}', userCertificates.length.toString())}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {userCertificates.map((certificate, index) => (
          <motion.div
            key={certificate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <CertificateCard
              certificate={certificate}
              companySettings={companySettings}
              variant="compact"
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
