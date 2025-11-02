import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useBranding } from '@/hooks/use-branding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeSlash, Lightning, Warning, Info } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { isValidEmail } from '@/lib/auth-utils'
import { EmployeeCredentials } from '@/lib/types'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { t } = useTranslation()
  const { branding } = useBranding()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTestHint, setShowTestHint] = useState(true)
  const [credentials, setCredentials] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  const [debugMode, setDebugMode] = useState(false)
  const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV
  const [kvReady, setKvReady] = useState(false)
  const [kvStats, setKvStats] = useState<{ credCount: number; profileCount: number; hasSession: boolean }>({ credCount: 0, profileCount: 0, hasSession: false })

  const appTitle = branding?.companyName || t('app.title')

  // Shared sample credentials used for quick seeding in development
  const SAMPLE_CREDS: EmployeeCredentials[] = [
    {
      id: 'admin-001',
      email: 'admin@gamelearn.test',
      temporaryPassword: 'Admin2024!',
      firstName: 'Admin',
      lastName: 'User',
      department: 'IT',
      role: 'admin',
      status: 'activated',
      createdAt: Date.now(),
    },
    {
      id: 'user-001',
      email: 'sarah.johnson@gamelearn.test',
      temporaryPassword: 'Welcome123!',
      firstName: 'Sarah',
      lastName: 'Johnson',
      department: 'Sales',
      role: 'employee',
      status: 'activated',
      createdAt: Date.now(),
    },
    {
      id: 'user-002',
      email: 'mike.chen@gamelearn.test',
      temporaryPassword: 'Welcome123!',
      firstName: 'Mike',
      lastName: 'Chen',
      department: 'Engineering',
      role: 'employee',
      status: 'activated',
      createdAt: Date.now(),
    },
    {
      id: 'user-003',
      email: 'emma.rodriguez@gamelearn.test',
      temporaryPassword: 'Welcome123!',
      firstName: 'Emma',
      lastName: 'Rodriguez',
      department: 'Marketing',
      role: 'employee',
      status: 'activated',
      createdAt: Date.now(),
    },
  ]

  useEffect(() => {
    console.log('Login Screen - Current credentials in KV:', credentials)
  }, [credentials])

  // Tiny seeding effect: in development, if there are no credentials yet, seed defaults for easier testing
  useEffect(() => {
    if (!isDev) return
    const count = credentials?.length || 0
    if (count === 0) {
      console.log('🧪 Dev mode: Seeding default credentials for login testing...')
      setCredentials(SAMPLE_CREDS)
    }
    // We only want to run when the credentials list changes; isDev is stable in a session
  }, [credentials])

  // KV readiness poller (dev only): helps diagnose races where spark.kv may not yet be available
  useEffect(() => {
    if (!isDev) return
    let active = true
    const poll = async () => {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
      for (let i = 0; i < 30 && active; i++) {
        const ready = !!((window as any)?.spark?.kv?.get && (window as any)?.spark?.kv?.set)
        if (ready) {
          setKvReady(true)
          try {
            const [creds, session, profiles] = await Promise.all([
              (window as any).spark.kv.get('employee-credentials'),
              (window as any).spark.kv.get('auth-session'),
              (window as any).spark.kv.get('user-profiles'),
            ])
            if (!active) return
            setKvStats({
              credCount: Array.isArray(creds) ? creds.length : (creds ? 1 : 0),
              profileCount: Array.isArray(profiles) ? profiles.length : (profiles ? 1 : 0),
              hasSession: !!session,
            })
          } catch (e) {
            console.warn('KV readiness stats failed:', e)
          }
          return
        }
        await sleep(100)
      }
    }
    poll()
    return () => {
      active = false
    }
  }, [isDev])

  const resetCredentials = () => {
    console.log('Manually resetting credentials to:', SAMPLE_CREDS)
    setCredentials(SAMPLE_CREDS)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    console.log('Login attempt with:', { email, password, credentialsCount: credentials?.length })

    setIsLoading(true)
    try {
      const result = await onLogin(email, password)
      console.log('Login result:', result)
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/10 to-secondary/10 px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          {branding?.logoUrl ? (
            <motion.div
              className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <img
                src={branding.logoUrl}
                alt={appTitle}
                className="max-h-24 max-w-full object-contain"
              />
            </motion.div>
          ) : (
            <motion.div
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <Lightning size={32} weight="fill" className="text-white" aria-hidden="true" />
            </motion.div>
          )}
          {!branding?.logoUrl && (
            <>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {appTitle}
              </h1>
              <p className="text-muted-foreground mt-2">{t('app.subtitle')}</p>
            </>
          )}
        </div>

        <Card className="shadow-2xl border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
            <CardDescription>{t('login.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {showTestHint && (
                <Alert className="bg-muted/50 border-primary/20">
                  <Info size={18} className="mt-0.5 text-primary" aria-hidden="true" />
                  <div className="flex items-start justify-between gap-2">
                    <AlertDescription className="flex-1 text-sm">
                      <strong className="font-semibold">{t('login.testCredentials')}:</strong>
                      <br />
                      <span className="text-xs">
                        {t('login.adminAccount')}: admin@gamelearn.test / Admin2024!
                        <br />
                        {t('login.userAccount')}: sarah.johnson@gamelearn.test / Welcome123!
                      </span>
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => setDebugMode(!debugMode)}
                        >
                          {debugMode ? 'Hide' : 'Show'} Debug Info
                        </Button>
                      </div>
                    </AlertDescription>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowTestHint(false)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </Alert>
              )}

              {debugMode && (
                <Alert className="bg-yellow-50 border-yellow-200 text-xs">
                  <AlertDescription>
                    <strong>Debug Info:</strong>
                    <br />
                    <div className="mt-1">
                      KV ready: <span className={kvReady ? 'text-green-600' : 'text-red-600'}>{kvReady ? 'Yes' : 'No'}</span>
                      {isDev && (
                        <>
                          {' '}• creds: {kvStats.credCount} • profiles: {kvStats.profileCount} • session: {kvStats.hasSession ? 'present' : 'none'}
                        </>
                      )}
                    </div>
                    <br />
                    Credentials loaded: {credentials?.length || 0}
                    <br />
                    {credentials && credentials.length > 0 && (
                      <div className="mt-2">
                        <strong>Available accounts:</strong>
                        {credentials.map((c) => (
                          <div key={c.id} className="ml-2">
                            • {c.email} / {c.temporaryPassword} (Status: {c.status})
                          </div>
                        ))}
                      </div>
                    )}
                    {(!credentials || credentials.length === 0) && (
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={resetCredentials}
                          className="text-xs"
                        >
                          Reset Test Credentials
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                  <Warning size={18} className="mt-0.5" aria-hidden="true" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  {t('login.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-12 text-base"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">
                  {t('login.password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('login.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 text-base pr-12"
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showPassword ? (
                      <EyeSlash size={20} aria-hidden="true" />
                    ) : (
                      <Eye size={20} aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm font-medium"
                  onClick={() => setError('Please contact your administrator to reset your password')}
                >
                  {t('login.forgotPassword')}
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? `${t('common.loading')}` : t('login.signIn')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                First time here?{' '}
                <span className="font-medium text-foreground">
                  Use the credentials provided by your administrator
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Protected by enterprise security standards</p>
        </div>
      </motion.div>
    </div>
  )
}
