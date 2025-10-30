import { useState, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
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

export function BulkEmployeeUpload() {
  const [credentials, setCredentials] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    setIsProcessing(true)
    try {
      const content = await file.text()
      const { employees, errors } = parseCSVEmployees(content)

      const successful: EmployeeCredentials[] = []
      const failed: Array<{ row: number; email: string; errors: string[] }> = []

      const existingEmails = new Set((credentials || []).map(c => c.email))

      employees.forEach((emp, idx) => {
        if (existingEmails.has(emp.email)) {
          failed.push({
            row: idx + 2,
            email: emp.email,
            errors: ['Employee already exists']
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
        existingEmails.add(emp.email)
      })

      errors.forEach(error => {
        failed.push({
          row: error.row,
          email: '',
          errors: [error.message]
        })
      })

      const result: BulkUploadResult = {
        successful,
        failed,
        totalProcessed: employees.length + errors.length
      }

      setUploadResult(result)

      if (successful.length > 0) {
        setCredentials((current) => [...(current || []), ...successful])
        toast.success(`Successfully created ${successful.length} employee account${successful.length > 1 ? 's' : ''}`)
      }

      if (failed.length > 0) {
        toast.error(`${failed.length} row${failed.length > 1 ? 's' : ''} failed to process`)
      }
    } catch (error) {
      toast.error('Failed to process CSV file')
      console.error(error)
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownloadCredentials = (credList: EmployeeCredentials[]) => {
    const csvContent = formatCredentialsForDownload(credList)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `employee-credentials-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Credentials downloaded successfully')
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
    toast.success('Template downloaded')
  }

  const pendingCredentials = (credentials || []).filter(c => c.status === 'pending')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus size={24} className="text-primary" aria-hidden="true" />
            Bulk Employee Enrollment
          </CardTitle>
          <CardDescription>Upload a CSV file to create multiple employee accounts at once</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="gap-2">
              <Upload size={20} aria-hidden="true" />
              {isProcessing ? 'Processing...' : 'Upload CSV File'}
            </Button>
            <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2">
              <FileCsv size={20} aria-hidden="true" />
              Download Template
            </Button>
            {pendingCredentials.length > 0 && (
              <Button variant="secondary" onClick={() => handleDownloadCredentials(pendingCredentials)} className="gap-2">
                <Download size={20} aria-hidden="true" />
                Download All Credentials
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
              <strong>CSV Format:</strong> Your file must include columns: email, firstName, lastName, and optionally department.
              The system will automatically generate secure temporary passwords for each employee.
            </AlertDescription>
          </Alert>

          {uploadResult && (
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
                      <p className="text-sm text-muted-foreground mt-1">Successful</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-destructive">{uploadResult.failed.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">Failed</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-foreground">{uploadResult.totalProcessed}</p>
                      <p className="text-sm text-muted-foreground mt-1">Total Processed</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {uploadResult.successful.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle size={20} className="text-success" aria-hidden="true" />
                      Successfully Created Accounts
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadCredentials(uploadResult.successful)}>
                      <Download size={16} className="mr-2" aria-hidden="true" />
                      Download These Credentials
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Temporary Password</TableHead>
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
                      Showing 10 of {uploadResult.successful.length} accounts. Download CSV to see all.
                    </p>
                  )}
                </div>
              )}

              {uploadResult.failed.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Warning size={20} className="text-destructive" aria-hidden="true" />
                    Failed to Process
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Errors</TableHead>
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
            </motion.div>
          )}
        </CardContent>
      </Card>

      {pendingCredentials.length > 0 && !uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Employee Accounts ({pendingCredentials.length})</CardTitle>
            <CardDescription>Employees who have not yet activated their accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
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
                Showing 20 of {pendingCredentials.length} pending accounts
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
