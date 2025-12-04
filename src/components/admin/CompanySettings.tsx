import { useState } from 'react'
import { useCompanySettings } from '@/hooks/use-certificates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Certificate, Upload, ArrowLeft } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CompanySettingsProps {
  onBack: () => void
}

export function CompanySettings({ onBack }: CompanySettingsProps) {
  const { companySettings, setCompanySettings } = useCompanySettings()
  const [companyName, setCompanyName] = useState(companySettings.companyName || '')
  const [logoPreview, setLogoPreview] = useState(companySettings.companyLogo || '')
  const [isUploading, setIsUploading] = useState(false)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setLogoPreview(dataUrl)
      setIsUploading(false)
      toast.success('Logo uploaded successfully')
    }

    reader.onerror = () => {
      setIsUploading(false)
      toast.error('Failed to upload logo')
    }

    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!companyName.trim()) {
      toast.error('Company name is required')
      return
    }

    setCompanySettings((current) => ({
      ...current,
      companyName: companyName.trim(),
      companyLogo: logoPreview || undefined
    }))

    toast.success('Company settings saved successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-secondary to-accent">
          <Certificate size={24} weight="fill" className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Company Settings
          </h1>
          <p className="text-muted-foreground">
            Configure company branding for certificates
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificate Branding</CardTitle>
          <CardDescription>
            This information will appear on all certificates issued to learners
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter your company name"
            />
            <p className="text-xs text-muted-foreground">
              This name will be displayed on all certificates
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyLogo">Company Logo</Label>
            <div className="space-y-4">
              {logoPreview && (
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                  <img
                    src={logoPreview}
                    alt="Company logo preview"
                    className="h-24 w-24 object-contain bg-background rounded border"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Logo Preview</p>
                    <p className="text-xs text-muted-foreground">
                      This logo will appear on all certificates
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLogoPreview('')}
                  >
                    Remove
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Input
                  id="companyLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isUploading}
                  onClick={() => document.getElementById('companyLogo')?.click()}
                >
                  <Upload size={20} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a square logo (PNG, JPG). Max size: 2MB. Recommended: 500x500px
              </p>
            </div>
          </div>

          <Alert>
            <Certificate size={16} />
            <AlertDescription>
              These settings apply to all certificates. Changes will affect new certificates immediately.
              Previously issued certificates remain unchanged.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
