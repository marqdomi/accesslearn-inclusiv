import { Certificate, CompanySettings } from './types'

export function generateCertificateCode(): string {
  const segments: string[] = []
  for (let i = 0; i < 4; i++) {
    const segment = Math.random().toString(36).substring(2, 6).toUpperCase()
    segments.push(segment)
  }
  return `CERT-${segments.join('-')}`
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
  }
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Could not create canvas context')
  }

  canvas.width = 2480
  canvas.height = 1754

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = '#8B5CF6'
  ctx.lineWidth = 8
  ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120)

  ctx.strokeStyle = '#D8B4FE'
  ctx.lineWidth = 4
  ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160)

  if (companySettings.companyLogo) {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = companySettings.companyLogo!
      })
      
      const logoSize = 120
      const logoX = (canvas.width - logoSize) / 2
      const logoY = 140
      
      ctx.drawImage(img, logoX, logoY, logoSize, logoSize)
    } catch (error) {
      console.warn('Could not load company logo:', error)
    }
  }

  ctx.fillStyle = '#6B21A8'
  ctx.font = 'bold 80px Poppins, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(translations.certificateTitle, canvas.width / 2, 360)

  ctx.fillStyle = '#666666'
  ctx.font = '40px Poppins, sans-serif'
  ctx.fillText(translations.awardedTo, canvas.width / 2, 460)

  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 72px Poppins, sans-serif'
  ctx.fillText(certificate.userFullName, canvas.width / 2, 580)

  ctx.fillStyle = '#666666'
  ctx.font = '40px Poppins, sans-serif'
  ctx.fillText(translations.completion, canvas.width / 2, 680)

  ctx.fillStyle = '#8B5CF6'
  ctx.font = 'bold 56px Poppins, sans-serif'
  ctx.fillText(certificate.courseTitle, canvas.width / 2, 800)

  const date = new Date(certificate.completionDate)
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  ctx.fillStyle = '#666666'
  ctx.font = '36px Poppins, sans-serif'
  ctx.fillText(`${translations.dateLabel}: ${formattedDate}`, canvas.width / 2, 920)

  if (companySettings.companyName) {
    ctx.fillStyle = '#666666'
    ctx.font = '36px Poppins, sans-serif'
    ctx.fillText(`${translations.companyLabel}: ${companySettings.companyName}`, canvas.width / 2, 1000)
  }

  ctx.fillStyle = '#999999'
  ctx.font = '28px Poppins, sans-serif'
  ctx.fillText(`${translations.certificateId}: ${certificate.certificateCode}`, canvas.width / 2, 1120)

  ctx.strokeStyle = '#D8B4FE'
  ctx.lineWidth = 2
  const lineY = 1300
  const lineWidth = 400
  ctx.beginPath()
  ctx.moveTo(canvas.width / 2 - lineWidth / 2, lineY)
  ctx.lineTo(canvas.width / 2 + lineWidth / 2, lineY)
  ctx.stroke()

  ctx.fillStyle = '#666666'
  ctx.font = '32px Poppins, sans-serif'
  ctx.fillText(translations.signature, canvas.width / 2, lineY + 50)

  const decorativeGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
  decorativeGradient.addColorStop(0, '#8B5CF6')
  decorativeGradient.addColorStop(0.5, '#D8B4FE')
  decorativeGradient.addColorStop(1, '#8B5CF6')
  
  ctx.fillStyle = decorativeGradient
  ctx.fillRect(200, 1450, canvas.width - 400, 6)

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
