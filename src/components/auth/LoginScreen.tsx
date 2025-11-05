import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Lightning, Eye, EyeSlash, ShieldCheck } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useBranding } from '@/hooks/use-branding'

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { t } = useTranslation()
  const { branding } = useBranding()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const appTitle = branding?.companyName || t('app.title')
  const friendlyError = useMemo(() => {
    if (!error) return null
    if (/404/.test(error) || /Failed to fetch/i.test(error)) {
      return `${error}. Verifica que el servidor API esté corriendo (\`npm run server\`).`
    }
    return error
  }, [error])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Ingresa tu correo y contraseña.')
      return
    }

    setIsLoading(true)
    try {
      const result = await onLogin(email, password)
      if (!result.success) {
        setError(result.error || 'Credenciales inválidas. Intenta nuevamente.')
      }
    } catch (loginError) {
      console.error('Login failed:', loginError)
      setError('No se pudo iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-primary/15 to-secondary/20 py-12 px-4 sm:px-6 lg:px-8">
      <header className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {branding?.logoUrl ? (
            <img src={branding.logoUrl} alt={appTitle} className="h-10 w-auto" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-secondary to-accent shadow-lg">
              <Lightning size={24} weight="fill" className="text-white" aria-hidden="true" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{appTitle}</h1>
            <p className="text-sm text-muted-foreground">{t('app.subtitle')}</p>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-md"
      >
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
              <ShieldCheck size={28} weight="fill" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              {t('auth.login.title', 'Iniciar sesión')}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {t('auth.login.subtitle', 'Accede al panel administrativo de AccessLearn Inclusiv')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {friendlyError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{friendlyError}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email', 'Correo electrónico')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@empresa.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password', 'Contraseña')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="********"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition hover:text-foreground"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? t('auth.loggingIn', 'Iniciando sesión…') : t('auth.login.cta', 'Ingresar')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
