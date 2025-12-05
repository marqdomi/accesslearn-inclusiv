import { Certificate, CompanySettings } from './types'

export function generateCertificateCode(): string {
  const segments: string[] = []
  for (let i = 0; i < 4; i++) {
    const segment = Math.random().toString(36).substring(2, 6).toUpperCase()
    segments.push(segment)
  }
  return `CERT-${segments.join('-')}`
}

interface CertificateTemplate {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  secondaryTextColor: string
  titleFont: string
  nameFont: string
  bodyFont: string
  titleFontSize: number
  nameFontSize: number
  bodyFontSize: number
  borderWidth: number
  borderStyle: 'solid' | 'double' | 'gradient'
  showDecorativeGradient: boolean
  logoSize: number
  certificateTitle: string
  awardedToText: string
  completionText: string
  signatureText: string
}

const DEFAULT_TEMPLATE: CertificateTemplate = {
  primaryColor: '#8B5CF6',
  secondaryColor: '#D8B4FE',
  accentColor: '#8B5CF6',
  textColor: '#1a1a1a',
  secondaryTextColor: '#666666',
  titleFont: 'Poppins',
  nameFont: 'Poppins',
  bodyFont: 'Poppins',
  titleFontSize: 80,
  nameFontSize: 72,
  bodyFontSize: 40,
  borderWidth: 8,
  borderStyle: 'solid',
  showDecorativeGradient: true,
  logoSize: 120,
  certificateTitle: 'Certificado de Completación',
  awardedToText: 'Este certificado se otorga a',
  completionText: 'por la completación exitosa de',
  signatureText: 'Firma Autorizada'
}

export async function generateCertificatePDF(
  certificate: Certificate,
  companySettings: CompanySettings,
  translations: {
    certificateTitle: string
    awardedTo: string
    completion: string
    courseLabel: string
    dateLabel: string
    companyLabel: string
    certificateId: string
    signature: string
  },
  template?: Partial<CertificateTemplate>
): Promise<Blob> {
  // Merge template with defaults
  const finalTemplate = { ...DEFAULT_TEMPLATE, ...template }
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Could not create canvas context')
  }

  canvas.width = 2480
  canvas.height = 1754

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw borders based on template
  const borderOffset = finalTemplate.borderWidth
  ctx.strokeStyle = finalTemplate.primaryColor
  ctx.lineWidth = finalTemplate.borderWidth
  ctx.strokeRect(borderOffset, borderOffset, canvas.width - borderOffset * 2, canvas.height - borderOffset * 2)

  if (finalTemplate.borderStyle === 'double') {
    ctx.strokeStyle = finalTemplate.secondaryColor
    ctx.lineWidth = finalTemplate.borderWidth / 2
    ctx.strokeRect(borderOffset * 2, borderOffset * 2, canvas.width - borderOffset * 4, canvas.height - borderOffset * 4)
  } else if (finalTemplate.borderStyle === 'gradient') {
    const borderGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    borderGradient.addColorStop(0, finalTemplate.primaryColor)
    borderGradient.addColorStop(0.5, finalTemplate.secondaryColor)
    borderGradient.addColorStop(1, finalTemplate.primaryColor)
    ctx.strokeStyle = borderGradient
    ctx.lineWidth = finalTemplate.borderWidth / 2
    ctx.strokeRect(borderOffset * 1.5, borderOffset * 1.5, canvas.width - borderOffset * 3, canvas.height - borderOffset * 3)
  }

  // Logo
  if (companySettings.companyLogo) {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = companySettings.companyLogo!
      })
      
      const logoSize = finalTemplate.logoSize
      const logoX = (canvas.width - logoSize) / 2
      const logoY = 140
      
      ctx.drawImage(img, logoX, logoY, logoSize, logoSize)
    } catch (error) {
      console.warn('Could not load company logo:', error)
    }
  }

  // Title - use template title or translation
  const titleText = finalTemplate.certificateTitle || translations.certificateTitle
  ctx.fillStyle = finalTemplate.primaryColor
  ctx.font = `bold ${finalTemplate.titleFontSize}px ${finalTemplate.titleFont}, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(titleText, canvas.width / 2, 360)

  // Awarded To - use template text or translation
  const awardedToText = finalTemplate.awardedToText || translations.awardedTo
  ctx.fillStyle = finalTemplate.secondaryTextColor
  ctx.font = `${finalTemplate.bodyFontSize}px ${finalTemplate.bodyFont}, sans-serif`
  ctx.fillText(awardedToText, canvas.width / 2, 460)

  // User Name
  ctx.fillStyle = finalTemplate.textColor
  ctx.font = `bold ${finalTemplate.nameFontSize}px ${finalTemplate.nameFont}, sans-serif`
  ctx.fillText(certificate.userFullName, canvas.width / 2, 580)

  // Completion Text - use template text or translation
  const completionText = finalTemplate.completionText || translations.completion
  ctx.fillStyle = finalTemplate.secondaryTextColor
  ctx.font = `${finalTemplate.bodyFontSize}px ${finalTemplate.bodyFont}, sans-serif`
  ctx.fillText(completionText, canvas.width / 2, 680)

  // Course Title
  ctx.fillStyle = finalTemplate.accentColor
  ctx.font = `bold ${Math.floor(finalTemplate.bodyFontSize * 1.4)}px ${finalTemplate.bodyFont}, sans-serif`
  ctx.fillText(certificate.courseTitle, canvas.width / 2, 800)

  const date = new Date(certificate.completionDate)
  const formattedDate = date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  ctx.fillStyle = finalTemplate.secondaryTextColor
  ctx.font = `${Math.floor(finalTemplate.bodyFontSize * 0.9)}px ${finalTemplate.bodyFont}, sans-serif`
  ctx.fillText(`${translations.dateLabel}: ${formattedDate}`, canvas.width / 2, 920)

  if (companySettings.companyName) {
    ctx.fillStyle = finalTemplate.secondaryTextColor
    ctx.font = `${Math.floor(finalTemplate.bodyFontSize * 0.9)}px ${finalTemplate.bodyFont}, sans-serif`
    ctx.fillText(`${translations.companyLabel}: ${companySettings.companyName}`, canvas.width / 2, 1000)
  }

  ctx.fillStyle = '#999999'
  ctx.font = `${Math.floor(finalTemplate.bodyFontSize * 0.7)}px ${finalTemplate.bodyFont}, sans-serif`
  ctx.fillText(`${translations.certificateId}: ${certificate.certificateCode}`, canvas.width / 2, 1120)

  // Signature line
  ctx.strokeStyle = finalTemplate.secondaryColor
  ctx.lineWidth = 2
  const lineY = 1300
  const lineWidth = 400
  ctx.beginPath()
  ctx.moveTo(canvas.width / 2 - lineWidth / 2, lineY)
  ctx.lineTo(canvas.width / 2 + lineWidth / 2, lineY)
  ctx.stroke()

  // Signature text - use template text or translation
  const signatureText = finalTemplate.signatureText || translations.signature
  ctx.fillStyle = finalTemplate.secondaryTextColor
  ctx.font = `${Math.floor(finalTemplate.bodyFontSize * 0.8)}px ${finalTemplate.bodyFont}, sans-serif`
  ctx.fillText(signatureText, canvas.width / 2, lineY + 50)

  // Decorative gradient
  if (finalTemplate.showDecorativeGradient) {
    const decorativeGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
    decorativeGradient.addColorStop(0, finalTemplate.primaryColor)
    decorativeGradient.addColorStop(0.5, finalTemplate.secondaryColor)
    decorativeGradient.addColorStop(1, finalTemplate.primaryColor)
    
    ctx.fillStyle = decorativeGradient
    ctx.fillRect(200, 1450, canvas.width - 400, 6)
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to generate PDF blob'))
      }
    }, 'image/png')
  })
}

export function downloadCertificate(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
