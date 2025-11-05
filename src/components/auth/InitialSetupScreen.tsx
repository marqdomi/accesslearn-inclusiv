import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Envelope, Key, UserCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthService } from '@/services/auth-service'
import { validatePassword, isValidEmail } from '@/lib/auth-utils'

interface InitialSetupScreenProps {
  onSetupComplete: (credentials: { email: string; password: string }) => Promise<void> | void
  initialError?: string | null
}

export function InitialSetupScreen({ onSetupComplete, initialError }: InitialSetupScreenProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setError(initialError ?? null)
  }, [initialError])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios.')
      return
    }

    if (!isValidEmail(email)) {
      setError('El correo electrónico no es válido.')
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors.join(' '))
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)

    try {
      await AuthService.initializeAdmin({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword
      })

      await onSetupComplete({ email: email.trim().toLowerCase(), password })
      setSuccess(true)
    } catch (setupErr) {
      console.error('Initial admin setup failed:', setupErr)
      const message = setupErr instanceof Error ? setupErr.message : 'No se pudo crear el usuario administrador.'
      setSuccess(false)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const friendlyError = useMemo(() => {
    if (!error) return null
    if (/404/.test(error) || /Failed to fetch/i.test(error)) {
      return `${error}. ¿El servidor API está ejecutándose? Inicia \`npm run server\` en otra terminal.`
    }
    return error
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-primary/10 to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-primary/20 shadow-xl">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
                <ShieldCheck size={28} weight="fill" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Configurar Administrador</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Bienvenido a AccessLearn Inclusiv. Crea la cuenta de administrador para completar la inicialización del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {friendlyError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{friendlyError}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 border-emerald-500/60 bg-emerald-500/10 text-emerald-900">
                  <AlertDescription>¡Administrador creado correctamente! Iniciando sesión…</AlertDescription>
                </Alert>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName" className="flex items-center gap-2">
                      <UserCircle size={18} />
                      Nombre
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="Nombre"
                      required
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="flex items-center gap-2">
                      <UserCircle size={18} />
                      Apellido
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Apellido"
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Envelope size={18} />
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@empresa.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Key size={18} />
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Contraseña segura"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Key size={18} />
                      Confirmar contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repite la contraseña"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-4 text-sm text-muted-foreground">
                  La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, un número y un símbolo.
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Creando administrador…' : 'Crear cuenta de administrador'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
