import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, Palette, CheckCircle, XCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { BrandingSettings } from '@/hooks/use-branding'
import { checkContrastCompliance, hexToRgb, rgbToOklch } from '@/lib/contrast-checker'

interface BrandingManagementProps {
  onBack: () => void
}

export function BrandingManagement({ onBack }: BrandingManagementProps) {
  const [branding, setBranding] = useKV<BrandingSettings>('branding-settings', {})
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(branding?.logoUrl || null)
  const [primaryColor, setPrimaryColor] = useState<string>(branding?.primaryColor || '#8B5CF6')
  const [companyName, setCompanyName] = useState<string>(branding?.companyName || '')
  const [isDragging, setIsDragging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const contrastCheck = checkContrastCompliance(primaryColor)

  useEffect(() => {
    if (branding?.logoUrl) {
      setLogoPreview(branding.logoUrl)
    }
    if (branding?.primaryColor) {
      setPrimaryColor(branding.primaryColor)
    }
    if (branding?.companyName) {
      setCompanyName(branding.companyName)
    }
  }, [branding])

  const handleFileChange = (file: File) => {
    if (!file.type.match(/^image\/(png|svg\+xml)$/)) {
      toast.error('Invalid file type. Please upload a PNG or SVG file.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 2MB.')
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setPrimaryColor(color)
  }

  const handleSave = async () => {
    if (!contrastCheck.isAccessible) {
      toast.error('Cannot save: Selected color does not meet WCAG accessibility standards.')
      return
    }

    setIsSaving(true)

    try {
      const rgb = hexToRgb(primaryColor)
      const oklchColor = rgb ? rgbToOklch(rgb.r, rgb.g, rgb.b) : primaryColor

      const newBranding: BrandingSettings = {
        logoUrl: logoPreview || undefined,
        primaryColor: oklchColor,
        companyName: companyName || undefined,
      }

      await setBranding(newBranding)

      document.documentElement.style.setProperty('--primary', oklchColor)
      document.documentElement.style.setProperty('--ring', oklchColor)

      toast.success('Branding settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save branding settings.')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setLogoPreview(null)
    setLogoFile(null)
    setPrimaryColor('#8B5CF6')
    setCompanyName('')
    
    await setBranding({})
    
    document.documentElement.style.setProperty('--primary', 'oklch(0.55 0.20 290)')
    document.documentElement.style.setProperty('--ring', 'oklch(0.55 0.20 290)')
    
    toast.success('Branding reset to defaults')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette size={24} />
              Branding & Appearance
            </CardTitle>
            <CardDescription>
              Customize the platform with your company's branding. All custom themes must meet WCAG accessibility standards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="company-name">Company Name (Optional)</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Company Logo</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a PNG or SVG file. This logo will replace the GameLearn logo in the header and login page.
                </p>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {logoPreview ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={logoPreview}
                        alt="Company logo preview"
                        className="max-h-32 max-w-full object-contain"
                      />
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={20} className="mr-2" />
                        Replace Logo
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setLogoPreview(null)
                          setLogoFile(null)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-muted p-4">
                        <Upload size={32} className="text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Drag and drop your logo here, or{' '}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary hover:underline"
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG or SVG, max 2MB
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.svg"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>

            <div className="border-t pt-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="primary-color">Primary Brand Color</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    This color will be used for buttons, links, and interactive elements throughout the platform.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label htmlFor="color-input" className="text-xs">
                          Hex Color
                        </Label>
                        <Input
                          id="color-input"
                          type="text"
                          value={primaryColor}
                          onChange={handleColorChange}
                          placeholder="#8B5CF6"
                          className="font-mono mt-1"
                          maxLength={7}
                        />
                      </div>
                      <div className="flex-shrink-0">
                        <Label htmlFor="color-picker" className="text-xs">
                          Picker
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="color-picker"
                            type="color"
                            value={primaryColor}
                            onChange={handleColorChange}
                            className="h-10 w-20 cursor-pointer p-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4 space-y-3">
                      <h4 className="font-medium text-sm">Color Preview</h4>
                      <div className="space-y-2">
                        <div
                          className="h-16 rounded-md border flex items-center justify-center text-sm font-medium"
                          style={{
                            backgroundColor: primaryColor,
                            color: contrastCheck.recommendedForeground === 'white' ? '#ffffff' : '#000000',
                          }}
                        >
                          Primary Button
                        </div>
                        <div className="flex gap-2">
                          <div
                            className="flex-1 h-10 rounded border"
                            style={{ backgroundColor: primaryColor }}
                          />
                          <div
                            className="flex-1 h-10 rounded border"
                            style={{
                              backgroundColor: primaryColor,
                              opacity: 0.1,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Card className={contrastCheck.isAccessible ? 'border-success' : 'border-destructive'}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          {contrastCheck.isAccessible ? (
                            <CheckCircle size={20} weight="fill" className="text-success" />
                          ) : (
                            <XCircle size={20} weight="fill" className="text-destructive" />
                          )}
                          WCAG Contrast Check
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">On White Background:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">
                                {contrastCheck.contrastWithWhite.toFixed(2)}:1
                              </span>
                              {contrastCheck.passesAAWhite ? (
                                <CheckCircle size={16} weight="fill" className="text-success" />
                              ) : (
                                <XCircle size={16} weight="fill" className="text-destructive" />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">On Black Background:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">
                                {contrastCheck.contrastWithBlack.toFixed(2)}:1
                              </span>
                              {contrastCheck.passesAABlack ? (
                                <CheckCircle size={16} weight="fill" className="text-success" />
                              ) : (
                                <XCircle size={16} weight="fill" className="text-destructive" />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">As Button Color:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                Use {contrastCheck.recommendedForeground} text
                              </span>
                              {contrastCheck.isAccessible ? (
                                <CheckCircle size={16} weight="fill" className="text-success" />
                              ) : (
                                <XCircle size={16} weight="fill" className="text-destructive" />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          {contrastCheck.isAccessible ? (
                            <div className="flex items-start gap-2 text-sm text-success">
                              <CheckCircle size={16} weight="fill" className="mt-0.5 flex-shrink-0" />
                              <p>
                                <strong>PASS:</strong> This color meets WCAG AA standards
                                {contrastCheck.passesAAAWhite || contrastCheck.passesAAABlack
                                  ? ' and AAA standards'
                                  : ''}
                                .
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2 text-sm text-destructive">
                              <XCircle size={16} weight="fill" className="mt-0.5 flex-shrink-0" />
                              <p>
                                <strong>FAIL:</strong> This color does not meet WCAG AA standards. Please choose a darker or lighter color.
                              </p>
                            </div>
                          )}
                        </div>

                        {!contrastCheck.isAccessible && (
                          <div className="pt-2 border-t">
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Warning size={14} className="mt-0.5 flex-shrink-0" />
                              <p>
                                WCAG AA requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text.
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                      <p className="font-medium flex items-center gap-2">
                        <Warning size={16} />
                        Accessibility Note
                      </p>
                      <p className="text-muted-foreground">
                        Users with "High Contrast Mode" enabled will see the high-contrast theme regardless of your custom branding.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-6">
              <Button variant="outline" onClick={handleReset}>
                Reset to Defaults
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onBack}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!contrastCheck.isAccessible || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Theme'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
