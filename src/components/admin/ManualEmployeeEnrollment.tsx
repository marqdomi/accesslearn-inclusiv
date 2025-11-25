import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { UserPlus, CheckCircle, Eye, EyeSlash, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { EmployeeCredentials } from '@/lib/types'
import { generateTemporaryPassword, isValidEmail, validatePassword } from '@/lib/auth-utils'
import { useTranslation } from 'react-i18next'

export function ManualEmployeeEnrollment() {
  const { t } = useTranslation()
  const [credentials, setCredentials] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: 'employee' as 'employee' | 'admin' | 'mentor'
  })
  const [passwordMode, setPasswordMode] = useState<'auto' | 'manual'>('auto')
  const [manualPassword, setManualPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdEmployee, setCreatedEmployee] = useState<EmployeeCredentials | null>(null)

  const handleGeneratePassword = () => {
    const newPassword = generateTemporaryPassword()
    setGeneratedPassword(newPassword)
    toast.success('Contraseña generada')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error('El nombre y apellido son requeridos')
        setIsSubmitting(false)
        return
      }

      if (!isValidEmail(formData.email)) {
        toast.error('Email inválido')
        setIsSubmitting(false)
        return
      }

      const existingEmployee = (credentials || []).find(
        c => c.email.toLowerCase() === formData.email.toLowerCase()
      )

      if (existingEmployee) {
        toast.error('Ya existe un empleado con este email')
        setIsSubmitting(false)
        return
      }

      let finalPassword = ''
      if (passwordMode === 'auto') {
        if (!generatedPassword) {
          finalPassword = generateTemporaryPassword()
          setGeneratedPassword(finalPassword)
        } else {
          finalPassword = generatedPassword
        }
      } else {
        const validation = validatePassword(manualPassword)
        if (!validation.valid) {
          toast.error(validation.errors[0])
          setIsSubmitting(false)
          return
        }
        finalPassword = manualPassword
      }

      const newEmployee: EmployeeCredentials = {
        id: `emp_${Date.now()}`,
        email: formData.email.toLowerCase(),
        temporaryPassword: finalPassword,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        department: formData.department.trim() || undefined,
        role: formData.role,
        status: 'pending',
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
      }

      setCredentials((current) => [...(current || []), newEmployee])
      setCreatedEmployee(newEmployee)
      toast.success(`Empleado creado: ${newEmployee.firstName} ${newEmployee.lastName}`)

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        role: 'employee'
      })
      setManualPassword('')
      setGeneratedPassword('')
      setPasswordMode('auto')
    } catch (error) {
      console.error('Error creating employee:', error)
      toast.error('Error al crear el empleado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateAnother = () => {
    setCreatedEmployee(null)
  }

  if (createdEmployee) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle size={24} className="text-success" aria-hidden="true" />
            Empleado Creado Exitosamente
          </CardTitle>
          <CardDescription>
            El empleado ha sido guardado en la base de datos y puede iniciar sesión
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-success/10 border-success/30">
            <CheckCircle size={20} className="text-success" />
            <AlertDescription className="ml-2">
              <strong>Cuenta creada y guardada permanentemente</strong> - El empleado ya existe en el sistema
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Nombre Completo</Label>
                <p className="font-semibold">{createdEmployee.firstName} {createdEmployee.lastName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-semibold">{createdEmployee.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Departamento</Label>
                <p className="font-semibold">{createdEmployee.department || 'No especificado'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Rol</Label>
                <p className="font-semibold capitalize">{createdEmployee.role}</p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <Label className="text-muted-foreground mb-2 block">Contraseña Temporal</Label>
              <code className="text-lg font-mono font-bold text-foreground">
                {createdEmployee.temporaryPassword}
              </code>
              <p className="text-sm text-muted-foreground mt-2">
                Comparte esta contraseña de forma segura con el empleado. Se les pedirá cambiarla en el primer inicio de sesión.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCreateAnother} className="gap-2">
              <UserPlus size={20} aria-hidden="true" />
              Crear Otro Empleado
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus size={24} className="text-primary" aria-hidden="true" />
          Añadir Empleado Manualmente
        </CardTitle>
        <CardDescription>
          Crea una cuenta de empleado individual con contraseña personalizada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Juan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Corporativo *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan.perez@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Ventas, IT, RRHH..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Empleado</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Configuración de Contraseña *</Label>
            <RadioGroup value={passwordMode} onValueChange={(value) => setPasswordMode(value as 'auto' | 'manual')}>
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="auto" id="auto" />
                <div className="space-y-1">
                  <Label htmlFor="auto" className="font-normal cursor-pointer">
                    Generar contraseña temporal segura (Recomendado)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    El sistema creará una contraseña segura automáticamente
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="manual" id="manual" />
                <div className="space-y-1">
                  <Label htmlFor="manual" className="font-normal cursor-pointer">
                    Establecer contraseña manual
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Define tu propia contraseña (debe cumplir requisitos de seguridad)
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {passwordMode === 'auto' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePassword}
                className="gap-2"
              >
                <Sparkle size={20} aria-hidden="true" />
                Generar Contraseña
              </Button>
              {generatedPassword && (
                <Alert className="bg-primary/5 border-primary/20">
                  <AlertDescription>
                    <Label className="text-muted-foreground mb-1 block">Contraseña Generada:</Label>
                    <code className="text-lg font-mono font-bold text-foreground">
                      {generatedPassword}
                    </code>
                  </AlertDescription>
                </Alert>
              )}
            </motion.div>
          )}

          {passwordMode === 'manual' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="space-y-2">
                <Label htmlFor="manualPassword">Contraseña Manual</Label>
                <div className="relative">
                  <Input
                    id="manualPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres..."
                    required={passwordMode === 'manual'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </Button>
                </div>
              </div>
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Requisitos:</strong> Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas, números y caracteres especiales
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <UserPlus size={20} aria-hidden="true" />
              {isSubmitting ? 'Creando...' : 'Crear Empleado'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
