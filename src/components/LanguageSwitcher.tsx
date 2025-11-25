import { Globe } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from 'react-i18next'

const SUPPORTED_LANGUAGES = {
  es: 'Español',
  en: 'English'
} as const

type Language = keyof typeof SUPPORTED_LANGUAGES

interface LanguageSwitcherProps {
  variant?: 'default' | 'outline' | 'ghost'
  showLabel?: boolean
}

export function LanguageSwitcher({ variant = 'outline', showLabel = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const language = (i18n.language || 'es') as Language

  const handleLanguageChange = (newLanguage: Language) => {
    i18n.changeLanguage(newLanguage)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          className="gap-2"
          aria-label="Change language"
        >
          <Globe size={20} aria-hidden="true" />
          {showLabel && <span>{SUPPORTED_LANGUAGES[language]}</span>}
          {!showLabel && <span className="uppercase font-semibold">{language}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(SUPPORTED_LANGUAGES) as Language[]).map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={language === lang ? 'bg-accent' : ''}
          >
            <span className="flex items-center gap-2">
              <span className="uppercase font-semibold text-sm">{lang}</span>
              <span>{SUPPORTED_LANGUAGES[lang]}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
