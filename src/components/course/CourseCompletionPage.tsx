import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Star, 
  Target, 
  BookOpen,
  Home,
  Share2,
  Download,
  Award,
  AlertCircle,
  Info,
  RotateCcw,
  Loader2
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { useCompanySettings, useCertificateTemplate } from '@/hooks/use-certificates'
import { generateCertificatePDF, downloadCertificate } from '@/lib/certificate-generator'
import { Certificate } from '@/lib/types'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface CourseCompletionPageProps {
  courseTitle: string
  courseId?: string
  totalXP: number
  totalLessons: number
  totalModules: number
  finalScore?: number
  certificateEarned?: boolean
  courseConfig?: {
    certificateEnabled?: boolean
    certificateRequiresPassingScore?: boolean
    minimumScoreForCertificate?: number
    allowRetakes?: boolean
    completionMode?: 'modules-only' | 'modules-and-quizzes' | 'exam-mode' | 'study-guide'
  }
  onRetakeQuizzes?: () => void
  quizzesToRetake?: Array<{ id: string; title: string; score: number; passingScore: number }>
}

export function CourseCompletionPage({
  courseTitle,
  courseId,
  totalXP,
  totalLessons,
  totalModules,
  finalScore,
  certificateEarned = false,
  courseConfig,
  onRetakeQuizzes,
  quizzesToRetake = [],
}: CourseCompletionPageProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const { t } = useTranslation()
  const { companySettings } = useCompanySettings()
  const { template } = useCertificateTemplate()
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [isLoadingCertificate, setIsLoadingCertificate] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Load certificate when component mounts if certificate was earned
  useEffect(() => {
    if (certificateEarned && courseId && user?.id && currentTenant) {
      loadCertificate()
    }
  }, [certificateEarned, courseId, user?.id, currentTenant?.id])

  const loadCertificate = async () => {
    if (!courseId || !user?.id) return
    
    setIsLoadingCertificate(true)
    try {
      const cert = await ApiService.getCertificateByCourse(user.id, courseId)
      if (cert) {
        // Convert completionDate from ISO string to timestamp if needed
        const certificateData: Certificate = {
          ...cert,
          completionDate: typeof cert.completionDate === 'string' 
            ? new Date(cert.completionDate).getTime() 
            : cert.completionDate
        }
        setCertificate(certificateData)
      }
    } catch (error) {
      console.error('Error loading certificate:', error)
    } finally {
      setIsLoadingCertificate(false)
    }
  }

  const handleDownloadCertificate = async () => {
    if (!certificate || !companySettings) {
      toast.error('Certificado no disponible')
      return
    }

    setIsDownloading(true)
    try {
      const translations = {
        certificateTitle: t('certificate.title', 'Certificado de Completación'),
        awardedTo: t('certificate.awardedTo', 'Este certificado se otorga a'),
        completion: t('certificate.completion', 'por la completación exitosa de'),
        courseLabel: t('certificate.course', 'Curso'),
        dateLabel: t('certificate.dateLabel', 'Fecha de Completación'),
        companyLabel: t('certificate.company', 'Empresa'),
        certificateId: t('certificate.certificateId', 'ID del Certificado'),
        signature: t('certificate.signature', 'Firma Autorizada')
      }

      // Pass template if available
      const templateData = template ? {
        primaryColor: template.primaryColor,
        secondaryColor: template.secondaryColor,
        accentColor: template.accentColor,
        textColor: template.textColor,
        secondaryTextColor: template.secondaryTextColor,
        titleFont: template.titleFont,
        nameFont: template.nameFont,
        bodyFont: template.bodyFont,
        titleFontSize: template.titleFontSize,
        nameFontSize: template.nameFontSize,
        bodyFontSize: template.bodyFontSize,
        borderWidth: template.borderWidth,
        borderStyle: template.borderStyle,
        showDecorativeGradient: template.showDecorativeGradient,
        logoSize: template.logoSize,
        certificateTitle: template.certificateTitle,
        awardedToText: template.awardedToText,
        completionText: template.completionText,
        signatureText: template.signatureText
      } : undefined

      const blob = await generateCertificatePDF(certificate, companySettings, translations, templateData)
      const fileName = `certificate-${certificate.certificateCode}-${courseTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`
      downloadCertificate(blob, fileName)
      toast.success('Certificado descargado exitosamente')
    } catch (error) {
      console.error('Error generating certificate:', error)
      toast.error('Error al generar el certificado. Por favor intenta de nuevo.')
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    // Epic celebration with multiple bursts
    const duration = 5 * 1000
    const animationEnd = Date.now() + duration

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Burst from left and right
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00FF00', '#0080FF']
      })

      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00FF00', '#0080FF']
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const stats = [
    {
      icon: Trophy,
      label: 'XP Total Ganado',
      value: totalXP.toLocaleString(),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      icon: BookOpen,
      label: 'Lecciones Completadas',
      value: totalLessons,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: Target,
      label: 'Módulos Finalizados',
      value: totalModules,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Main Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 via-background to-primary/5">
            {/* Trophy Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-50 animate-pulse" />
                <Trophy className="h-32 w-32 text-yellow-500 relative z-10" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ¡Felicidades! 🎉
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6">
                Curso Completado
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Has finalizado exitosamente <span className="font-semibold text-foreground">"{courseTitle}"</span>
              </p>
            </motion.div>

            {/* Perfect Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="flex justify-center mb-8 gap-3 flex-wrap"
            >
              <Badge className="px-6 py-3 text-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <Star className="h-6 w-6 mr-2 fill-white" />
                Curso Completado {finalScore !== undefined ? `(${finalScore}%)` : ''}
              </Badge>
              {certificateEarned && (
                <Badge className="px-6 py-3 text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Award className="h-6 w-6 mr-2" />
                  Certificado Obtenido
                </Badge>
              )}
              {courseConfig?.certificateEnabled && !certificateEarned && courseConfig.certificateRequiresPassingScore && (
                <Badge variant="outline" className="px-6 py-3 text-lg border-yellow-500 text-yellow-600">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  Certificado requiere {courseConfig.minimumScoreForCertificate || 70}%
                </Badge>
              )}
            </motion.div>

            {/* Certificate Status */}
            {courseConfig?.certificateEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-8"
              >
                <Card className={`p-6 ${certificateEarned ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800' : 'bg-muted/50'}`}>
                  <div className="flex items-start gap-4">
                    <Award className={`h-8 w-8 flex-shrink-0 ${certificateEarned ? 'text-purple-600' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {certificateEarned ? '¡Certificado Obtenido!' : 'Certificado Disponible'}
                      </h3>
                      {certificateEarned ? (
                        <>
                          <p className="text-muted-foreground mb-4">
                            Has cumplido con todos los requisitos para obtener el certificado de completación.
                          </p>
                          {isLoadingCertificate ? (
                            <Button disabled variant="outline" className="gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Cargando certificado...
                            </Button>
                          ) : certificate ? (
                            <Button 
                              onClick={handleDownloadCertificate}
                              disabled={isDownloading}
                              className="gap-2 bg-purple-600 hover:bg-purple-700"
                            >
                              {isDownloading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Generando...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4" />
                                  Descargar Certificado
                                </>
                              )}
                            </Button>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              El certificado se está procesando. Por favor intenta más tarde.
                            </p>
                          )}
                        </>
                      ) : courseConfig.certificateRequiresPassingScore ? (
                        <p className="text-muted-foreground">
                          Necesitas un score mínimo de {courseConfig.minimumScoreForCertificate || 70}% para obtener el certificado.
                          {finalScore !== undefined && (
                            <span className="block mt-1">
                              Tu score actual: <strong>{finalScore}%</strong>
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-muted-foreground">
                          El certificado estará disponible una vez que completes todos los requisitos del curso.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Quizzes to Retake */}
            {courseConfig?.allowRetakes && quizzesToRetake.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-8"
              >
                <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-4">
                    <Info className="h-8 w-8 flex-shrink-0 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Puedes mejorar tu calificación</h3>
                      <p className="text-muted-foreground mb-4">
                        Tienes {quizzesToRetake.length} quiz{quizzesToRetake.length > 1 ? 'zes' : ''} que puedes reintentar para mejorar tu score final:
                      </p>
                      <div className="space-y-2 mb-4">
                        {quizzesToRetake.map((quiz) => (
                          <div key={quiz.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <span className="font-medium">{quiz.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Score: {quiz.score}% / Requerido: {quiz.passingScore}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {onRetakeQuizzes && (
                        <Button
                          variant="outline"
                          onClick={onRetakeQuizzes}
                          className="gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reintentar Quizzes
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="border-l-4 border-primary pl-6 py-4 text-left max-w-2xl mx-auto mb-8"
            >
              <p className="text-lg italic text-muted-foreground">
                "El aprendizaje es un tesoro que seguirá a su dueño a todas partes."
              </p>
              <p className="text-sm text-muted-foreground mt-2">— Proverbio Chino</p>
            </motion.div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + idx * 0.1 }}
            >
              <Card className={`p-6 ${stat.bgColor}`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-background">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <Home className="h-5 w-5" />
            Volver al Dashboard
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              // TODO: Implement certificate download
              alert('Función de certificado próximamente')
            }}
            className="gap-2"
          >
            <Download className="h-5 w-5" />
            Descargar Certificado
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              // TODO: Implement share functionality
              alert('Función de compartir próximamente')
            }}
            className="gap-2"
          >
            <Share2 className="h-5 w-5" />
            Compartir Logro
          </Button>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">¿Qué sigue?</h3>
            <p className="text-muted-foreground mb-4">
              Continúa tu camino de aprendizaje explorando más cursos
            </p>
            <Button
              variant="link"
              onClick={() => navigate('/dashboard')}
              className="text-primary"
            >
              Explorar más cursos →
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
