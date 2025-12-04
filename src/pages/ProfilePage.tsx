/**
 * ProfilePage Component
 * User profile management page
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '@/hooks/use-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Lock, 
  Camera, 
  ArrowLeft, 
  CheckCircle, 
  WarningCircle,
  X,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export function ProfilePage() {
  const navigate = useNavigate()
  const { profile, loading, error, updateProfile, changePassword, updateAvatar } = useProfile()
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
    dateOfBirth: profile?.dateOfBirth || '',
    gender: profile?.gender || ('prefer-not-to-say' as const),
    address: {
      street: profile?.address?.street || '',
      city: profile?.address?.city || '',
      state: profile?.address?.state || '',
      zipCode: profile?.address?.zipCode || '',
      country: profile?.address?.country || 'México',
    },
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar || null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Update profile data when profile loads
  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || 'prefer-not-to-say',
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          zipCode: profile.address?.zipCode || '',
          country: profile.address?.country || 'México',
        },
      })
      setAvatarPreview(profile.avatar || null)
    }
  }, [profile])

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || undefined,
        dateOfBirth: profileData.dateOfBirth || undefined,
        gender: profileData.gender,
        address: Object.values(profileData.address).some(v => v) 
          ? profileData.address 
          : undefined,
      })
    } catch (error: any) {
      console.error('[ProfilePage] Error updating profile:', error)
    }
  }

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Todos los campos son obligatorios')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('La nueva contraseña debe ser diferente a la actual')
      return
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      console.error('[ProfilePage] Error changing password:', error)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB')
      return
    }

    setIsUploadingAvatar(true)

    try {
      const newAvatar = await updateAvatar(file)
      setAvatarPreview(newAvatar)
    } catch (error: any) {
      console.error('[ProfilePage] Error uploading avatar:', error)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!profile) return 'U'
    const first = profile.firstName?.[0] || ''
    const last = profile.lastName?.[0] || ''
    return `${first}${last}`.toUpperCase() || 'U'
  }

  // Show loading state
  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  // Show error state if profile failed to load (e.g., 404)
  if (!loading && !profile && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <WarningCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'No se pudo cargar el perfil. Por favor, intenta de nuevo.'}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex-1">
                Volver al Dashboard
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1">
                Recargar Página
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show empty state if no profile but no error (shouldn't normally happen)
  if (!profile && !error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <WarningCircle className="h-4 w-4" />
              <AlertDescription>
                No hay información de perfil disponible. Por favor, intenta recargar la página.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex-1">
                Volver al Dashboard
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1">
                Recargar Página
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-3 sm:mb-4 touch-target"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Volver al Dashboard</span>
            <span className="sm:hidden">Volver</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mi Perfil</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Administra tu información personal y configuración de cuenta
          </p>
        </div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-4 sm:mb-6">
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                    <AvatarImage src={avatarPreview || undefined} alt={profile.firstName} />
                    <AvatarFallback className="text-xl sm:text-2xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 sm:p-2 cursor-pointer hover:bg-primary/90 transition-colors touch-target"
                  >
                    <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1 break-words">
                    {profile.email}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 mt-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {profile.role === 'super-admin' && 'Super Administrador'}
                      {profile.role === 'tenant-admin' && 'Administrador'}
                      {profile.role === 'instructor' && 'Instructor'}
                      {profile.role === 'mentor' && 'Mentor'}
                      {profile.role === 'employee' && 'Empleado'}
                      {profile.role === 'student' && 'Estudiante'}
                    </span>
                    {profile.totalXP !== undefined && (
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        • XP: {profile.totalXP} • Nivel {profile.level || 1}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <TabsList className="w-full grid grid-cols-2 h-auto">
            <TabsTrigger value="profile" className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 touch-target">
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Información Personal</span>
              <span className="sm:hidden">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 touch-target">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Cambiar Contraseña</span>
              <span className="sm:hidden">Contraseña</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Información Personal</CardTitle>
                  <CardDescription className="text-sm">
                    Actualiza tu información personal y datos de contacto
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" required className="text-sm">
                          Nombre
                        </Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          required
                          className="h-12 touch-target"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" required className="text-sm">
                          Apellido
                        </Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          required
                          className="h-12 touch-target"
                        />
                      </div>
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="bg-muted h-12 touch-target"
                      />
                      <p className="text-xs text-muted-foreground">
                        El correo electrónico no se puede cambiar
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+52 55 1234 5678"
                        className="h-12 touch-target"
                      />
                    </div>

                    {/* Date of Birth and Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-sm">Fecha de Nacimiento</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                          className="h-12 touch-target"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm">Género</Label>
                        <select
                          id="gender"
                          value={profileData.gender}
                          onChange={(e) => setProfileData({ 
                            ...profileData, 
                            gender: e.target.value as any 
                          })}
                          className="w-full px-3 py-3 h-12 border border-border rounded-md bg-background text-foreground touch-target"
                        >
                          <option value="prefer-not-to-say">Prefiero no decir</option>
                          <option value="male">Masculino</option>
                          <option value="female">Femenino</option>
                          <option value="other">Otro</option>
                        </select>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-3 sm:space-y-4 border-t pt-4">
                      <h3 className="text-base sm:text-lg font-semibold">Dirección (Opcional)</h3>
                      <div className="space-y-2">
                        <Label htmlFor="street" className="text-sm">Calle</Label>
                        <Input
                          id="street"
                          value={profileData.address.street}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, street: e.target.value }
                          })}
                          placeholder="Calle y número"
                          className="h-12 touch-target"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Ciudad</Label>
                          <Input
                            id="city"
                            value={profileData.address.city}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, city: e.target.value }
                            })}
                            placeholder="Ciudad"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">Estado</Label>
                          <Input
                            id="state"
                            value={profileData.address.state}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, state: e.target.value }
                            })}
                            placeholder="Estado"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">Código Postal</Label>
                          <Input
                            id="zipCode"
                            value={profileData.address.zipCode}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, zipCode: e.target.value }
                            })}
                            placeholder="CP"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">País</Label>
                        <Input
                          id="country"
                          value={profileData.address.country}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, country: e.target.value }
                          })}
                          placeholder="País"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/dashboard')}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Cambiar Contraseña</CardTitle>
                  <CardDescription className="text-sm">
                    Actualiza tu contraseña para mantener tu cuenta segura
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" required className="text-sm">
                        Contraseña Actual
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value
                          })}
                          required
                          className="pr-10 h-12 touch-target"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 touch-target"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeSlash className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" required className="text-sm">
                        Nueva Contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value
                          })}
                          required
                          minLength={8}
                          className="pr-10 h-12 touch-target"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 touch-target"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeSlash className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        La contraseña debe tener al menos 8 caracteres
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" required className="text-sm">
                        Confirmar Nueva Contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value
                          })}
                          required
                          minLength={8}
                          className="pr-10 h-12 touch-target"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 touch-target"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeSlash className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {passwordData.newPassword && passwordData.confirmPassword && 
                       passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-xs text-destructive">
                          Las contraseñas no coinciden
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        })}
                        className="w-full sm:w-auto touch-target"
                      >
                        Limpiar
                      </Button>
                      <Button type="submit" disabled={loading} className="w-full sm:w-auto touch-target">
                        {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

