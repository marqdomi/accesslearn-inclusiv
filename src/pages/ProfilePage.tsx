/**
 * ProfilePage Component
 * User profile management page
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProfile } from '@/hooks/use-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, 
  Lock, 
  Camera, 
  CheckCircle, 
  WarningCircle,
  X,
  Eye,
  EyeSlash,
  Chalkboard,
  Plus,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export function ProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation('common')
  const { profile, loading, error, updateProfile, updateMentorProfile, changePassword, updateAvatar } = useProfile()
  const [activeTab, setActiveTab] = useState('profile')
  
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

  // Mentor profile state  
  const isMentor = profile?.role === 'mentor'
  const [mentorData, setMentorData] = useState({
    mentorBio: profile?.mentorBio || '',
    mentorSpecialties: profile?.mentorSpecialties || [] as string[],
    mentorIsAvailable: profile?.mentorIsAvailable !== false,
    mentorAvailability: profile?.mentorAvailability || {} as Record<string, string[]>,
  })
  const [newSpecialty, setNewSpecialty] = useState('')

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
      // Load mentor fields
      if (profile.role === 'mentor') {
        setMentorData({
          mentorBio: profile.mentorBio || '',
          mentorSpecialties: profile.mentorSpecialties || [],
          mentorIsAvailable: profile.mentorIsAvailable !== false,
          mentorAvailability: profile.mentorAvailability || {},
        })
      }
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
      toast.error(t('profile.allFieldsRequired'))
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error(t('profile.passwordMinLength'))
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('profile.passwordsMismatch'))
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error(t('profile.passwordMustBeDifferent'))
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
      toast.error(t('profile.fileMustBeImage'))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageTooLarge'))
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

  // Handle mentor profile update
  const handleUpdateMentorProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateMentorProfile({
        mentorBio: mentorData.mentorBio,
        mentorSpecialties: mentorData.mentorSpecialties,
        mentorIsAvailable: mentorData.mentorIsAvailable,
        mentorAvailability: mentorData.mentorAvailability,
      })
    } catch (error: any) {
      console.error('[ProfilePage] Error updating mentor profile:', error)
    }
  }

  // Add a new specialty tag
  const handleAddSpecialty = () => {
    const trimmed = newSpecialty.trim()
    if (trimmed && !mentorData.mentorSpecialties.includes(trimmed)) {
      setMentorData({
        ...mentorData,
        mentorSpecialties: [...mentorData.mentorSpecialties, trimmed],
      })
      setNewSpecialty('')
    }
  }

  // Remove a specialty tag
  const handleRemoveSpecialty = (specialty: string) => {
    setMentorData({
      ...mentorData,
      mentorSpecialties: mentorData.mentorSpecialties.filter(s => s !== specialty),
    })
  }

  // Toggle availability for a day
  const DAYS = [
    { key: 'monday', label: t('profile.days.monday') },
    { key: 'tuesday', label: t('profile.days.tuesday') },
    { key: 'wednesday', label: t('profile.days.wednesday') },
    { key: 'thursday', label: t('profile.days.thursday') },
    { key: 'friday', label: t('profile.days.friday') },
    { key: 'saturday', label: t('profile.days.saturday') },
    { key: 'sunday', label: t('profile.days.sunday') },
  ] as const

  const TIME_SLOTS = ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00']

  const toggleTimeSlot = (day: string, slot: string) => {
    const current = mentorData.mentorAvailability[day] || []
    const updated = current.includes(slot)
      ? current.filter(s => s !== slot)
      : [...current, slot]
    setMentorData({
      ...mentorData,
      mentorAvailability: {
        ...mentorData.mentorAvailability,
        [day]: updated,
      },
    })
  }

  // Show loading state
  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('profile.loadingProfile')}</p>
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
                {error || t('profile.loadError')}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex-1">
                {t('profile.backToDashboard')}
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1">
                {t('profile.reloadPage')}
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
                {t('profile.noProfileInfo')}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex-1">
                {t('profile.backToDashboard')}
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1">
                {t('profile.reloadPage')}
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('profile.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {t('profile.subtitle')}
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
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-16 w-16 sm:h-24 sm:w-24">
                    <AvatarImage src={avatarPreview || undefined} alt={profile.firstName} />
                    <AvatarFallback className="text-lg sm:text-2xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 sm:p-2 cursor-pointer hover:bg-primary/90 transition-colors touch-target shadow-md"
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
                  <h2 className="text-lg sm:text-2xl font-bold text-foreground">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-xs sm:text-base text-muted-foreground mt-1 break-words">
                    {profile.email}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-4 mt-2">
                    <span className="text-[10px] sm:text-sm text-muted-foreground">
                      {profile.role === 'super-admin' && t('role.superAdmin')}
                      {profile.role === 'tenant-admin' && t('role.tenantAdmin')}
                      {profile.role === 'instructor' && t('role.instructor')}
                      {profile.role === 'mentor' && t('role.mentor')}
                      {profile.role === 'employee' && t('profile.employee')}
                      {profile.role === 'student' && t('role.student')}
                    </span>
                    {profile.totalXP !== undefined && (
                      <span className="text-[10px] sm:text-sm text-muted-foreground">
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
        <Tabs 
          value={activeTab}
          onValueChange={(value) => {
            // Mantener la posición del scroll al cambiar de tab
            const scrollPosition = window.scrollY || document.documentElement.scrollTop
            setActiveTab(value)
            requestAnimationFrame(() => {
              window.scrollTo({
                top: scrollPosition,
                behavior: 'instant'
              })
            })
          }}
          className="space-y-4 sm:space-y-6"
        >
          <TabsList className={`w-full grid ${isMentor ? 'grid-cols-3' : 'grid-cols-2'} h-auto bg-muted/30 p-1.5 rounded-xl border-0 shadow-sm`}>
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all duration-200 hover:bg-muted/50 data-[state=inactive]:text-muted-foreground touch-target"
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">{t('profile.personalInfo')}</span>
              <span className="sm:hidden">{t('profile.profileShort')}</span>
            </TabsTrigger>
            {isMentor && (
              <TabsTrigger 
                value="mentor" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all duration-200 hover:bg-muted/50 data-[state=inactive]:text-muted-foreground touch-target"
              >
                <Chalkboard className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">{t('profile.mentorProfile')}</span>
                <span className="sm:hidden">{t('role.mentor')}</span>
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="password" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all duration-200 hover:bg-muted/50 data-[state=inactive]:text-muted-foreground touch-target"
            >
              <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">{t('profile.changePassword')}</span>
              <span className="sm:hidden">{t('profile.passwordShort')}</span>
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
                <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-xl">{t('profile.personalInfo')}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    {t('profile.personalInfoDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <form onSubmit={handleUpdateProfile} className="space-y-3 sm:space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="firstName" required className="text-xs sm:text-sm">
                          {t('profile.firstName')}
                        </Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          required
                          className="h-11 sm:h-12 text-sm sm:text-base touch-target"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="lastName" required className="text-xs sm:text-sm">
                          {t('profile.lastName')}
                        </Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          required
                          className="h-11 sm:h-12 text-sm sm:text-base touch-target"
                        />
                      </div>
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="email" className="text-xs sm:text-sm">{t('profile.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="bg-muted h-11 sm:h-12 text-sm sm:text-base touch-target"
                      />
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {t('profile.emailCannotChange')}
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="phone" className="text-xs sm:text-sm">{t('profile.phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+52 55 1234 5678"
                        className="h-11 sm:h-12 text-sm sm:text-base touch-target"
                      />
                    </div>

                    {/* Date of Birth and Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-xs sm:text-sm">{t('profile.dateOfBirth')}</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                          className="h-11 sm:h-12 text-sm sm:text-base touch-target"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="gender" className="text-xs sm:text-sm">{t('profile.gender')}</Label>
                        <select
                          id="gender"
                          value={profileData.gender}
                          onChange={(e) => setProfileData({ 
                            ...profileData, 
                            gender: e.target.value as any 
                          })}
                          className="w-full px-3 py-2.5 sm:py-3 h-11 sm:h-12 border border-border rounded-md bg-background text-sm sm:text-base text-foreground touch-target"
                        >
                          <option value="prefer-not-to-say">{t('profile.genderPreferNot')}</option>
                          <option value="male">{t('profile.genderMale')}</option>
                          <option value="female">{t('profile.genderFemale')}</option>
                          <option value="other">{t('profile.genderOther')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
                      <h3 className="text-sm sm:text-lg font-semibold">{t('profile.addressOptional')}</h3>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="street" className="text-xs sm:text-sm">{t('profile.street')}</Label>
                        <Input
                          id="street"
                          value={profileData.address.street}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, street: e.target.value }
                          })}
                          placeholder="Calle y número"
                          className="h-11 sm:h-12 text-sm sm:text-base touch-target"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="city" className="text-xs sm:text-sm">{t('profile.city')}</Label>
                          <Input
                            id="city"
                            value={profileData.address.city}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, city: e.target.value }
                            })}
                            placeholder="Ciudad"
                            className="h-11 sm:h-12 text-sm sm:text-base touch-target"
                          />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="state" className="text-xs sm:text-sm">{t('profile.state')}</Label>
                          <Input
                            id="state"
                            value={profileData.address.state}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, state: e.target.value }
                            })}
                            placeholder="Estado"
                            className="h-11 sm:h-12 text-sm sm:text-base touch-target"
                          />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="zipCode" className="text-xs sm:text-sm">{t('profile.zipCode')}</Label>
                          <Input
                            id="zipCode"
                            value={profileData.address.zipCode}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, zipCode: e.target.value }
                            })}
                            placeholder="CP"
                            className="h-11 sm:h-12 text-sm sm:text-base touch-target"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="country" className="text-xs sm:text-sm">{t('profile.country')}</Label>
                        <Input
                          id="country"
                          value={profileData.address.country}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, country: e.target.value }
                          })}
                          placeholder="País"
                          className="h-11 sm:h-12 text-sm sm:text-base touch-target"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/dashboard')}
                        className="w-full sm:w-auto touch-target"
                      >
                        {t('cancel')}
                      </Button>
                      <Button type="submit" disabled={loading} className="w-full sm:w-auto touch-target">
                        {loading ? t('profile.saving') : t('profile.saveChanges')}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Mentor Profile Tab */}
          {isMentor && (
            <TabsContent value="mentor">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleUpdateMentorProfile} className="space-y-4 sm:space-y-6">
                  {/* Availability Toggle */}
                  <Card>
                    <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base sm:text-xl">{t('profile.mentor.availability')}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm mt-1">
                            {t('profile.mentor.availabilityDesc')}
                          </CardDescription>
                        </div>
                        <Switch
                          checked={mentorData.mentorIsAvailable}
                          onCheckedChange={(checked) =>
                            setMentorData({ ...mentorData, mentorIsAvailable: checked })
                          }
                        />
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Bio */}
                  <Card>
                    <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-xl">{t('profile.mentor.aboutMe')}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-1">
                        {t('profile.mentor.aboutMeDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <Textarea
                        value={mentorData.mentorBio}
                        onChange={(e) =>
                          setMentorData({ ...mentorData, mentorBio: e.target.value })
                        }
                        placeholder={t('profile.mentor.bioPlaceholder')}
                        rows={5}
                        className="text-sm sm:text-base resize-none"
                      />
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                        {mentorData.mentorBio.length}/500 {t('profile.mentor.characters')}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Specialties */}
                  <Card>
                    <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-xl">{t('profile.mentor.specialties')}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-1">
                        {t('profile.mentor.specialtiesDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {mentorData.mentorSpecialties.map((specialty) => (
                          <Badge
                            key={specialty}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm"
                          >
                            {specialty}
                            <button
                              type="button"
                              onClick={() => handleRemoveSpecialty(specialty)}
                              className="ml-1 hover:text-destructive transition-colors"
                              title={`Eliminar ${specialty}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {mentorData.mentorSpecialties.length === 0 && (
                          <p className="text-xs sm:text-sm text-muted-foreground italic">
                            {t('profile.mentor.noSpecialties')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newSpecialty}
                          onChange={(e) => setNewSpecialty(e.target.value)}
                          placeholder={t('profile.mentor.specialtyPlaceholder')}
                          className="h-11 sm:h-12 text-sm sm:text-base touch-target flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddSpecialty()
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddSpecialty}
                          disabled={!newSpecialty.trim()}
                          className="touch-target"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {t('profile.mentor.add')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weekly Availability Grid */}
                  <Card>
                    <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-xl">{t('profile.mentor.availableHours')}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-1">
                        {t('profile.mentor.availableHoursDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="min-w-[600px] px-4 sm:px-0">
                          <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-1 sm:gap-2">
                            {/* Header row */}
                            <div className="text-xs font-semibold text-muted-foreground p-1" />
                            {TIME_SLOTS.map((slot) => (
                              <div
                                key={slot}
                                className="text-[10px] sm:text-xs font-semibold text-muted-foreground text-center p-1"
                              >
                                {slot}
                              </div>
                            ))}
                            {/* Day rows */}
                            {DAYS.map(({ key, label }) => (
                              <>
                                <div
                                  key={`label-${key}`}
                                  className="text-xs sm:text-sm font-medium text-foreground flex items-center p-1"
                                >
                                  {label}
                                </div>
                                {TIME_SLOTS.map((slot) => {
                                  const isSelected = (
                                    mentorData.mentorAvailability[key] || []
                                  ).includes(slot)
                                  return (
                                    <button
                                      key={`${key}-${slot}`}
                                      type="button"
                                      onClick={() => toggleTimeSlot(key, slot)}
                                      className={`rounded-md h-8 sm:h-10 text-[10px] sm:text-xs font-medium transition-all duration-150 border ${
                                        isSelected
                                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                          : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/60 hover:border-border'
                                      }`}
                                    >
                                      {isSelected ? '✓' : ''}
                                    </button>
                                  )
                                })}
                              </>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats (read only) */}
                  {(profile.mentorRating !== undefined || profile.totalMentorSessions !== undefined) && (
                    <Card>
                      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                        <CardTitle className="text-base sm:text-xl">{t('profile.mentor.statistics')}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 pt-0">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {profile.mentorRating?.toFixed(1) || '—'}
                            </p>
                            <p className="text-xs text-muted-foreground">{t('profile.mentor.rating')}</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {profile.totalMentorSessions || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">{t('profile.mentor.sessions')}</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {profile.totalMentees || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">{t('profile.mentor.mentees')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Submit */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="w-full sm:w-auto touch-target"
                    >
                      {t('profile.cancel')}
                    </Button>
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto touch-target">
                      {loading ? t('profile.saving') : t('profile.mentor.saveMentorProfile')}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </TabsContent>
          )}

          {/* Password Tab */}
          <TabsContent value="password">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-xl">{t('profile.password.title')}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    {t('profile.password.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <form onSubmit={handleChangePassword} className="space-y-3 sm:space-y-6">
                    {/* Current Password */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="currentPassword" required className="text-xs sm:text-sm">
                        {t('profile.password.currentPassword')}
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
                          className="pr-10 h-11 sm:h-12 text-sm sm:text-base touch-target"
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
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="newPassword" required className="text-xs sm:text-sm">
                        {t('profile.password.newPassword')}
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
                          className="pr-10 h-11 sm:h-12 text-sm sm:text-base touch-target"
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
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {t('profile.password.minLength')}
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="confirmPassword" required className="text-xs sm:text-sm">
                        {t('profile.password.confirmNewPassword')}
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
                          className="pr-10 h-11 sm:h-12 text-sm sm:text-base touch-target"
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
                        <p className="text-[10px] sm:text-xs text-destructive">
                          {t('profile.password.passwordsMismatch')}
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
                        {t('profile.password.clear')}
                      </Button>
                      <Button type="submit" disabled={loading} className="w-full sm:w-auto touch-target">
                        {loading ? t('profile.password.changing') : t('profile.password.title')}
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

