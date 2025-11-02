import { useKV } from '@github/spark/hooks'
import { useEffect } from 'react'

export interface BrandingSettings {
  logoUrl?: string
  primaryColor?: string
  companyName?: string
}

export function useBranding() {
  const [branding, setBranding] = useKV<BrandingSettings>('branding-settings', {})

  useEffect(() => {
    const applyBranding = () => {
      const isHighContrast = document.documentElement.classList.contains('high-contrast')
      
      if (branding?.primaryColor && !isHighContrast) {
        document.documentElement.style.setProperty('--primary', branding.primaryColor)
        document.documentElement.style.setProperty('--ring', branding.primaryColor)
      } else if (!branding?.primaryColor || isHighContrast) {
        document.documentElement.style.setProperty('--primary', 'oklch(0.55 0.20 290)')
        document.documentElement.style.setProperty('--ring', 'oklch(0.55 0.20 290)')
      }
    }

    applyBranding()

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          applyBranding()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [branding?.primaryColor])

  return { branding, setBranding }
}
