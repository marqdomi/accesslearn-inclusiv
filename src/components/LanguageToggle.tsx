import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Translate } from '@phosphor-icons/react'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en'
    i18n.changeLanguage(newLang)
  }
  
  const currentLang = i18n.language === 'en' ? 'EN' : 'ES'
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
      title={i18n.language === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés'}
      aria-label={i18n.language === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés'}
    >
      <Translate size={18} aria-hidden="true" />
      <span className="font-bold">{currentLang}</span>
    </Button>
  )
}
