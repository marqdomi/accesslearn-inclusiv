import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiService } from '@/services/api.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { EnvelopeSimple, CheckCircle, WarningCircle, Eye, EyeSlash, User, Building } from '@phosphor-icons/react'
import { toast } from 'sonner'

const ROLE_LABELS: Record<string, string> = {
  'student': 'Estudiante',
  'instructor': 'Instructor',
  'content-manager': 'Gestor de Contenido',
  'tenant-admin': 'Administrador',
  'super-admin': 'Super Administrador',
  'mentor': 'Mentor',
}

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!token) {
      setIsValid(false)
      setValidating(false)
      return
    }

    validateToken()
  }, [token])

  const validateToken = async () => {
    if (!token) {
      setIsValid(false)
      setValidating(false)
      return
    }

    try {
      setValidating(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/validate-invitation/${token}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Token inválido')
      }
      
      const userData = await response.json()
      setUserInfo(userData)
      setIsValid(true)
      
      // Try to load tenant info from query param (if tenant slug is in URL)
      // This is optional - the invitation works without it
      const tenantSlug = searchParams.get('tenant')
      if (tenantSlug) {
        try {
          const tenant = await ApiService.getTenantBySlug(tenantSlug)
          setTenantInfo(tenant)
        } catch (tenantError) {
          console.warn('Could not load tenant info:', tenantError)
          // Continue without tenant info - invitation is still valid
        }
      }
    } catch (error: any) {
      setIsValid(false)
      console.error('Error validating token:', error)
      toast.error(error.message || 'Token de invitación inválido o expirado')
    } finally {
      setValidating(false)
    }
  }

  const validateForm = () => {
    const newErrors = {
      password: '',
      confirmPassword: '',
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return !newErrors.password && !newErrors.confirmPassword
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !token) return

    try {
      setLoading(true)

      const result = await ApiService.acceptInvitation(token, formData.password)

      toast.success('¡Cuenta activada exitosamente!', {
        description: 'Ya puedes iniciar sesión con tus credenciales',
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error: any) {
      console.error('Error accepting invitation:', error)
      
      if (error.message?.includes('expired')) {
        toast.error('Token expirado', {
          description: 'Por favor solicita una nueva invitación',
        })
      } else if (error.message?.includes('not found')) {
        toast.error('Invitación no encontrada', {
          description: 'Verifica el enlace e intenta nuevamente',
        })
      } else {
        toast.error('Error al activar cuenta', {
          description: error.message || 'Por favor intenta nuevamente',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Validando invitación...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!token || !isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <WarningCircle size={64} className="text-destructive" />
            </div>
            <CardTitle>Invitación Inválida</CardTitle>
            <CardDescription>
              El token de invitación es inválido o ha expirado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Si necesitas acceso, por favor contacta al administrador de tu organización para solicitar una nueva invitación.
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full" 
              onClick={() => navigate('/login')}
            >
              Ir a Inicio de Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <EnvelopeSimple size={64} className="text-primary" />
          </div>
          <CardTitle>Activa tu Cuenta</CardTitle>
          <CardDescription className="space-y-2">
            {userInfo ? (
              <>
                <div>
                  Hola <strong>{userInfo.firstName} {userInfo.lastName}</strong>,
                </div>
                <div>
                  has sido invitado a unirte a la plataforma. Configura tu contraseña para continuar.
                </div>
                {(userInfo.role || tenantInfo) && (
                  <div className="flex flex-wrap gap-2 mt-3 justify-center">
                    {userInfo.role && (
                      <Badge variant="secondary" className="gap-1">
                        <User size={14} />
                        {ROLE_LABELS[userInfo.role] || userInfo.role}
                      </Badge>
                    )}
                    {tenantInfo && (
                      <Badge variant="outline" className="gap-1">
                        <Building size={14} />
                        {tenantInfo.name}
                      </Badge>
                    )}
                  </div>
                )}
              </>
            ) : (
              'Has sido invitado a unirte a la plataforma. Configura tu contraseña para continuar.'
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    setErrors({ ...errors, password: '' })
                  }}
                  className={errors.password ? 'border-destructive' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Debe tener al menos 8 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value })
                    setErrors({ ...errors, confirmPassword: '' })
                  }}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Tu cuenta será activada inmediatamente después de configurar tu contraseña.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Activando...
                </>
              ) : (
                'Activar Cuenta'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
