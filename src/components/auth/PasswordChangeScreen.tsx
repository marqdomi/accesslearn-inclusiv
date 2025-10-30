import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Eye, EyeSlash, CheckCircle, Warning, ShieldCheck } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { validatePasswordChange, calculatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthBg } from '@/lib/auth-utils'
import { PasswordChangeRequest } from '@/lib/types'

interface PasswordChangeScreenProps {
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

export function PasswordChangeScreen({ onPasswordChange }: PasswordChangeScreenProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [passwordStrength, setPasswordStrength] = useState<{ strength: 'weak' | 'fair' | 'good' | 'strong'; score: number }>({ strength: 'weak', score: 0 })

  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(calculatePasswordStrength(newPassword))
    }
  }, [newPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    const request: PasswordChangeRequest = {
      currentPassword,
      newPassword,
      confirmPassword
    }

    const validation = validatePasswordChange(request)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setIsLoading(true)
    try {
      const result = await onPasswordChange(currentPassword, newPassword)
      if (!result.success) {
        setErrors([result.error || 'Failed to change password'])
      }
    } catch (err) {
      setErrors(['An unexpected error occurred. Please try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  const requirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'One number', met: /[0-9]/.test(newPassword) },
    { label: 'One special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) }
  ]

  const strengthPercentage = (passwordStrength.score / 7) * 100

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/10 to-secondary/10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <ShieldCheck size={32} weight="fill" className="text-white" aria-hidden="true" />
          </motion.div>
          <h1 className="text-3xl font-bold">Create Your Password</h1>
          <p className="text-muted-foreground mt-2">Please change your temporary password to continue</p>
        </div>

        <Card className="shadow-2xl border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Security First</CardTitle>
            <CardDescription>Choose a strong, unique password to protect your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.length > 0 && (
                <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                  <Warning size={18} className="mt-0.5" aria-hidden="true" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-base font-medium">
                  Current Temporary Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Enter temporary password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 text-base pr-12"
                    autoComplete="current-password"
                    autoFocus
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  >
                    {showCurrentPassword ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-base font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 text-base pr-12"
                    autoComplete="new-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                  </Button>
                </div>
                {newPassword && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={`font-semibold capitalize ${getPasswordStrengthColor(passwordStrength.strength)}`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthBg(passwordStrength.strength)}`}
                        style={{ width: `${strengthPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-base font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 text-base pr-12"
                    autoComplete="new-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                  </Button>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Password Requirements:</p>
                <ul className="space-y-1.5">
                  {requirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle
                        size={16}
                        weight={req.met ? 'fill' : 'regular'}
                        className={req.met ? 'text-success' : 'text-muted-foreground'}
                        aria-hidden="true"
                      />
                      <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>{req.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                {isLoading ? 'Updating Password...' : 'Change Password & Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
