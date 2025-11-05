import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Upload, Download, CheckCircle, Warning, UserPlus, FileCsv } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { EmployeeCredentials, BulkUploadResult } from '@/lib/types'
import { parseCSVEmployees, generateTemporaryPassword, formatCredentialsForDownload } from '@/lib/auth-utils'
import { useTranslation } from '@/lib/i18n'
import { EmployeeService } from '@/services/employee-service'

type UploadStage = 'initial' | 'preview' | 'confirmed'

export function BulkEmployeeUpload() {
  const { t } = useTranslation()
  const [credentials, setCredentials] = useState<EmployeeCredentials[]>([])
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadStage, setUploadStage] = useState<UploadStage>('initial')
  const [previewData, setPreviewData] = useState<{
    successful: EmployeeCredentials[]
    failed: Array<{ row: number; email: string; errors: string[] }>
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar credenciales existentes al montar el componente
  useEffect(() => {
    loadCredentials()
  }, [])

  const loadCredentials = async () => {
    try {
      setIsLoading(true)
      const data = await EmployeeService.getAll()
      setCredentials(data)
    } catch (error) {
      console.error('Failed to load credentials:', error)
      toast.error('Error al cargar credenciales existentes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error(t('bulkUpload.uploadError'))
      return
    }

    setIsProcessing(true)
    try {
      const content = await file.text()
      const { employees, errors } = parseCSVEmployees(content)

      const successful: EmployeeCredentials[] = []
      const failed: Array<{ row: number; email: string; errors: string[] }> = []

      const existingEmails = new Set((credentials || []).map(c => c.email.toLowerCase()))

      employees.forEach((emp, idx) => {
        if (existingEmails.has(emp.email.toLowerCase())) {
          failed.push({
            row: idx + 2,
            email: emp.email,
            errors: [t('bulkUpload.employeeExists')]
          })
          return
        }

        const newCredential: EmployeeCredentials = {
          id: `emp_${Date.now()}_${idx}`,
          email: emp.email,
          temporaryPassword: generateTemporaryPassword(),
          firstName: emp.firstName,
          lastName: emp.lastName,
          department: emp.department,
          status: 'pending',
          createdAt: Date.now(),
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
        }
        successful.push(newCredential)
        existingEmails.add(emp.email.toLowerCase())
      })

      errors.forEach(error => {
        failed.push({
          row: error.row,
          email: '',
          errors: [error.message]
        })
      })

      setPreviewData({ successful, failed })
      setUploadStage('preview')
      
      if (successful.length > 0) {
        toast.success(`${t('bulkUpload.validEmployeesFound')}: ${successful.length}`)
      }
      if (failed.length > 0) {
        toast.warning(`${t('bulkUpload.invalidRows')}: ${failed.length}`)
      }
    } catch (error) {
      toast.error(t('bulkUpload.processingError'))
      console.error(error)
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleConfirmUpload = async () => {
    if (!previewData) return

    setIsProcessing(true)
    try {
      // Enviar empleados al servidor para crear en batch
      const result = await EmployeeService.createBulk(previewData.successful)
      
      if (result.successful.length > 0) {
        // Recargar las credenciales desde el servidor
        await loadCredentials()
        
        const message = result.successful.length === 1 
          ? t('bulkUpload.accountsCreated', { count: result.successful.length.toString() })
          : t('bulkUpload.accountsCreatedPlural', { count: result.successful.length.toString() })
        toast.success(message)
      }

      setUploadResult(result)
      setUploadStage('confirmed')
      setPreviewData(null)
    } catch (error) {
      toast.error('Error al confirmar la inscripción')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelUpload = () => {
    setPreviewData(null)
    setUploadStage('initial')
    toast.info(t('bulkUpload.uploadCancelled'))
  }

  const handleStartNewUpload = () => {
    setUploadResult(null)
    setUploadStage('initial')
    setPreviewData(null)
  }

  const handleDownloadCredentials = (credList: EmployeeCredentials[]) => {
    if (!credList || credList.length === 0) {
      toast.error('No hay credenciales para descargar')
      return
    }

    try {
      const csvContent = formatCredentialsForDownload(credList)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `employee-credentials-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(t('bulkUpload.credentialsDownloaded'))
    } catch (error) {
      console.error('Error downloading credentials:', error)
      toast.error('Error al descargar las credenciales')
    }
  }

  const handleDownloadTemplate = () => {
    const template = 'email,firstName,lastName,department\njohn.doe@company.com,John,Doe,Sales\njane.smith@company.com,Jane,Smith,Engineering'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'employee-upload-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(t('bulkUpload.templateDownloaded'))
  }

  const pendingCredentials = (credentials || []).filter(c => c.status === 'pending')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus size={24} className="text-primary" aria-hidden="true" />
            {t('bulkUpload.title')}
          </CardTitle>
          <CardDescription>{t('bulkUpload.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {uploadStage === 'initial' && (
            <>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="gap-2">
                  <Upload size={20} aria-hidden="true" />
                  {isProcessing ? t('bulkUpload.processing') : t('bulkUpload.uploadButton')}
                </Button>
                <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2">
                  <FileCsv size={20} aria-hidden="true" />
                  {t('bulkUpload.downloadTemplate')}
                </Button>
                {pendingCredentials.length > 0 && (
                  <Button variant="secondary" onClick={() => handleDownloadCredentials(pendingCredentials)} className="gap-2">
                    <Download size={20} aria-hidden="true" />
                    {t('bulkUpload.downloadCredentials')}
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload CSV file"
              />

              <Alert className="bg-primary/5 border-primary/20">
                <AlertDescription>
                  <strong>{t('bulkUpload.formatHelp')}</strong> {t('bulkUpload.formatDescription')}
                </AlertDescription>
              </Alert>
            </>
          )}

          {uploadStage === 'preview' && previewData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Alert className="bg-accent/10 border-accent/30">
                <Warning size={20} className="text-accent" />
                <AlertDescription className="ml-2">
                  <strong>{t('bulkUpload.confirmationRequired')}</strong> {t('bulkUpload.reviewBeforeConfirming')}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-success">{previewData.successful.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t('bulkUpload.validEmployees')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-destructive">{previewData.failed.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t('bulkUpload.invalidRows')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-foreground">{previewData.successful.length + previewData.failed.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t('bulkUpload.totalProcessed')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {previewData.successful.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <CheckCircle size={20} className="text-success" aria-hidden="true" />
                    {t('bulkUpload.employeesToBeCreated')}
                  </h3>
                  <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('bulkUpload.name')}</TableHead>
                          <TableHead>{t('bulkUpload.email')}</TableHead>
                          <TableHead>{t('bulkUpload.department')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.successful.map((cred) => (
                          <TableRow key={cred.id}>
                            <TableCell className="font-medium">{cred.firstName} {cred.lastName}</TableCell>
                            <TableCell>{cred.email}</TableCell>
                            <TableCell>{cred.department || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {previewData.failed.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Warning size={20} className="text-destructive" aria-hidden="true" />
                    {t('bulkUpload.invalidRowsWillBeSkipped')}
                  </h3>
                  <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('bulkUpload.row')}</TableHead>
                          <TableHead>{t('bulkUpload.email')}</TableHead>
                          <TableHead>{t('bulkUpload.errors')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.failed.map((fail, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{fail.row}</TableCell>
                            <TableCell>{fail.email || '-'}</TableCell>
                            <TableCell className="text-destructive text-sm">{fail.errors.join(', ')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4">
                <Button 
                  size="lg" 
                  onClick={handleConfirmUpload} 
                  disabled={isProcessing || previewData.successful.length === 0}
                  className="gap-2"
                >
                  <CheckCircle size={20} aria-hidden="true" />
                  {isProcessing ? t('bulkUpload.processing') : t('bulkUpload.confirmAndCreate')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleCancelUpload}
                  disabled={isProcessing}
                >
                  {t('bulkUpload.cancel')}
                </Button>
              </div>
            </motion.div>
          )}

          {uploadStage === 'confirmed' && uploadResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-success">{uploadResult.successful.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t('bulkUpload.successful')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-destructive">{uploadResult.failed.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t('bulkUpload.failed')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-foreground">{uploadResult.totalProcessed}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t('bulkUpload.totalProcessed')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {uploadResult.successful.length > 0 && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle size={20} className="text-success" aria-hidden="true" />
                      {t('bulkUpload.successfullyCreated')}
                    </h3>
                    <Button 
                      size="lg" 
                      variant="default" 
                      onClick={() => handleDownloadCredentials(uploadResult.successful)}
                      className="gap-2 bg-success hover:bg-success/90 text-success-foreground shadow-lg"
                    >
                      <Download size={20} aria-hidden="true" />
                      {t('bulkUpload.downloadTheseCredentials')}
                    </Button>
                  </div>
                  
                  <Alert className="mb-4 bg-success/10 border-success/30">
                    <CheckCircle size={20} className="text-success" />
                    <AlertDescription className="ml-2">
                      <strong>{t('bulkUpload.accountsSaved')}</strong> {t('bulkUpload.accountsSavedDescription')}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('bulkUpload.name')}</TableHead>
                          <TableHead>{t('bulkUpload.email')}</TableHead>
                          <TableHead>{t('bulkUpload.department')}</TableHead>
                          <TableHead>{t('bulkUpload.temporaryPassword')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadResult.successful.slice(0, 10).map((cred) => (
                          <TableRow key={cred.id}>
                            <TableCell className="font-medium">{cred.firstName} {cred.lastName}</TableCell>
                            <TableCell>{cred.email}</TableCell>
                            <TableCell>{cred.department || '-'}</TableCell>
                            <TableCell>
                              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{cred.temporaryPassword}</code>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {uploadResult.successful.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      {t('bulkUpload.showingXofY', { showing: '10', total: uploadResult.successful.length.toString() })}
                    </p>
                  )}
                </div>
              )}

              {uploadResult.failed.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Warning size={20} className="text-destructive" aria-hidden="true" />
                    {t('bulkUpload.failedToProcess')}
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('bulkUpload.row')}</TableHead>
                          <TableHead>{t('bulkUpload.email')}</TableHead>
                          <TableHead>{t('bulkUpload.errors')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadResult.failed.map((fail, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{fail.row}</TableCell>
                            <TableCell>{fail.email || '-'}</TableCell>
                            <TableCell className="text-destructive text-sm">{fail.errors.join(', ')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button onClick={handleStartNewUpload} variant="outline" className="gap-2">
                  <Upload size={20} aria-hidden="true" />
                  {t('bulkUpload.uploadAnotherFile')}
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {pendingCredentials.length > 0 && !uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle>{t('bulkUpload.pendingAccounts', { count: pendingCredentials.length.toString() })}</CardTitle>
            <CardDescription>{t('bulkUpload.pendingDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('bulkUpload.name')}</TableHead>
                    <TableHead>{t('bulkUpload.email')}</TableHead>
                    <TableHead>{t('bulkUpload.department')}</TableHead>
                    <TableHead>{t('bulkUpload.status')}</TableHead>
                    <TableHead>{t('bulkUpload.created')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingCredentials.slice(0, 20).map((cred) => (
                    <TableRow key={cred.id}>
                      <TableCell className="font-medium">{cred.firstName} {cred.lastName}</TableCell>
                      <TableCell>{cred.email}</TableCell>
                      <TableCell>{cred.department || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{cred.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(cred.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {pendingCredentials.length > 20 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                {t('bulkUpload.showingXofYAccounts', { showing: '20', total: pendingCredentials.length.toString() })}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
