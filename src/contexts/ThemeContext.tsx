import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme-preference',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get from localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey) as Theme | null
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored
      }
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  })

  useEffect(() => {
    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    root.removeAttribute('data-appearance')
    
    // Apply resolved theme - force override system preference
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
      root.setAttribute('data-appearance', 'dark')
      // Force dark mode even if system prefers light
      root.style.colorScheme = 'dark'
    } else {
      root.classList.add('light')
      root.setAttribute('data-appearance', 'light')
      // Force light mode even if system prefers dark
      root.style.colorScheme = 'light'
    }
  }, [resolvedTheme])

  useEffect(() => {
    // Update resolved theme when theme changes
    if (theme === 'system') {
      // Only listen to system preference when theme is 'system'
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const updateResolvedTheme = () => {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')
      }
      
      updateResolvedTheme()
      mediaQuery.addEventListener('change', updateResolvedTheme)
      
      return () => {
        mediaQuery.removeEventListener('change', updateResolvedTheme)
      }
    } else {
      // When user explicitly selects light or dark, ignore system preference
      setResolvedTheme(theme)
    }
  }, [theme])

  useEffect(() => {
    // Persist theme preference
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, theme)
    }
  }, [theme, storageKey])

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

