/**
 * STPS Compliance Dashboard
 *
 * Admin page for managing STPS DC-3 constancias and DC-4 reports.
 * Allows tenant-admins and super-admins to:
 * - View compliance stats
 * - Configure tenant STPS data (IMSS, domicilio, etc.)
 * - Enable/configure courses for STPS
 * - Generate DC-3 constancias
 * - Download DC-3 PDFs
 * - Generate DC-4 summary reports
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiService } from '@/services/api.service'
import {
  type STPSConstancia,
  type STPSCourseConfig,
  type STPSTenantConfig,
  type STPSStats,
  STPS_AREAS_TEMATICAS,
  type STPSAreaTematica,
} from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  ArrowClockwise,
  GraduationCap,
  Buildings,
  Certificate,
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function STPSCompliancePage() {
  const { user } = useAuth()

  const [stats, setStats] = useState<STPSStats | null>(null)
  const [constancias, setConstancias] = useState<STPSConstancia[]>([])
  const [tenantConfig, setTenantConfig] = useState<STPSTenantConfig | null>(null)
  const [enabledCourses, setEnabledCourses] = useState<STPSCourseConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Tenant config form state
  const [configForm, setConfigForm] = useState({
    registroPatronalIMSS: '',
    actividadGiro: '',
    representanteLegal: '',
    calle: '',
    colonia: '',
    municipio: '',
    estado: '',
    codigoPostal: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, constanciasRes, configRes, coursesRes] = await Promise.allSettled([
        ApiService.getSTPSStats(),
        ApiService.getSTPSConstancias(),
        ApiService.getSTPSTenantConfig(),
        ApiService.getSTPSEnabledCourses(),
      ])

      if (statsRes.status === 'fulfilled') setStats(statsRes.value)
      if (constanciasRes.status === 'fulfilled') setConstancias(constanciasRes.value)
      if (configRes.status === 'fulfilled') {
        const cfg = configRes.value
        setTenantConfig(cfg)
        setConfigForm({
          registroPatronalIMSS: cfg.registroPatronalIMSS || '',
          actividadGiro: cfg.actividadGiro || '',
          representanteLegal: cfg.representanteLegal || '',
          calle: cfg.domicilioEstructurado?.calle || '',
          colonia: cfg.domicilioEstructurado?.colonia || '',
          municipio: cfg.domicilioEstructurado?.municipio || '',
          estado: cfg.domicilioEstructurado?.estado || '',
          codigoPostal: cfg.domicilioEstructurado?.codigoPostal || '',
        })
      }
      if (coursesRes.status === 'fulfilled') setEnabledCourses(coursesRes.value)
    } catch (error: any) {
      console.error('[STPS] Error loading data:', error)
      toast.error('Error cargando datos STPS')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveTenantConfig = async () => {
    setSaving(true)
    try {
      const updated = await ApiService.updateSTPSTenantConfig({
        registroPatronalIMSS: configForm.registroPatronalIMSS || undefined,
        actividadGiro: configForm.actividadGiro || undefined,
        representanteLegal: configForm.representanteLegal || undefined,
        domicilioEstructurado: {
          calle: configForm.calle,
          colonia: configForm.colonia,
          municipio: configForm.municipio,
          estado: configForm.estado,
          codigoPostal: configForm.codigoPostal,
        },
      })
      setTenantConfig(updated)
      toast.success('Configuración STPS guardada')
    } catch (error: any) {
      toast.error(error.message || 'Error guardando configuración')
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPDF = async (constancia: STPSConstancia) => {
    try {
      const blob = await ApiService.downloadDC3PDF(constancia.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `DC3-${constancia.folioInterno}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('PDF descargado')
    } catch {
      toast.error('Error descargando PDF')
    }
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return iso
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Certificate className="h-7 w-7 text-primary" weight="duotone" />
            Cumplimiento STPS
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de constancias DC-3 y reportes DC-4
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <ArrowClockwise className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="constancias">Constancias DC-3</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="courses">Cursos STPS</TabsTrigger>
        </TabsList>

        {/* ── Dashboard Tab ── */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Constancias"
              value={stats?.totalConstancias ?? 0}
              icon={<FileText className="h-5 w-5" />}
              description="DC-3 generadas"
            />
            <StatCard
              title="Tasa de Aprobación"
              value={`${stats?.tasaAprobacion?.toFixed(1) ?? 0}%`}
              icon={<CheckCircle className="h-5 w-5" />}
              description={`${stats?.constanciasAprobadas ?? 0} aprobadas`}
              variant={
                (stats?.tasaAprobacion ?? 0) >= 80
                  ? 'success'
                  : (stats?.tasaAprobacion ?? 0) >= 60
                    ? 'warning'
                    : 'danger'
              }
            />
            <StatCard
              title="Trabajadores Capacitados"
              value={stats?.totalTrabajadoresCapacitados ?? 0}
              icon={<Users className="h-5 w-5" />}
              description="Colaboradores únicos"
            />
            <StatCard
              title="Horas de Capacitación"
              value={stats?.totalHorasCapacitacion ?? 0}
              icon={<Clock className="h-5 w-5" />}
              description="Horas-hombre total"
            />
          </div>

          {/* Quick overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado del Cumplimiento</CardTitle>
              <CardDescription>Resumen de la configuración STPS de tu organización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ComplianceRow
                label="Registro Patronal IMSS"
                value={tenantConfig?.registroPatronalIMSS}
              />
              <ComplianceRow
                label="Representante Legal"
                value={tenantConfig?.representanteLegal}
              />
              <ComplianceRow
                label="Domicilio Registrado"
                value={tenantConfig?.domicilioEstructurado?.calle}
              />
              <ComplianceRow
                label="Cursos Habilitados STPS"
                value={
                  enabledCourses.length > 0
                    ? `${enabledCourses.length} curso(s)`
                    : undefined
                }
              />
              <Separator className="my-2" />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setActiveTab('config')}>
                  <Buildings className="h-4 w-4 mr-2" />
                  Configurar Datos
                </Button>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('courses')}>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Configurar Cursos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent constancias */}
          {constancias.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Últimas Constancias</CardTitle>
              </CardHeader>
              <CardContent>
                <ConstanciasTable
                  constancias={constancias.slice(0, 5)}
                  onDownload={handleDownloadPDF}
                  formatDate={formatDate}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Constancias Tab ── */}
        <TabsContent value="constancias" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Constancias DC-3</CardTitle>
                  <CardDescription>
                    Todas las constancias de competencias generadas
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {constancias.length} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {constancias.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No hay constancias generadas</p>
                  <p className="text-sm mt-1">
                    Habilita cursos para STPS y genera constancias cuando los usuarios completen sus capacitaciones
                  </p>
                </div>
              ) : (
                <ConstanciasTable
                  constancias={constancias}
                  onDownload={handleDownloadPDF}
                  formatDate={formatDate}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Configuration Tab ── */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Empresa (STPS)</CardTitle>
              <CardDescription>
                Información requerida para generar constancias DC-3.
                Estos datos aparecerán en la Sección B de cada constancia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="registroIMSS">Registro Patronal IMSS</Label>
                  <Input
                    id="registroIMSS"
                    placeholder="Ej: Y45-1234567-8"
                    value={configForm.registroPatronalIMSS}
                    onChange={e =>
                      setConfigForm(f => ({ ...f, registroPatronalIMSS: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actividadGiro">Actividad o Giro</Label>
                  <Input
                    id="actividadGiro"
                    placeholder="Ej: Desarrollo de Software"
                    value={configForm.actividadGiro}
                    onChange={e =>
                      setConfigForm(f => ({ ...f, actividadGiro: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="representanteLegal">Representante Legal</Label>
                  <Input
                    id="representanteLegal"
                    placeholder="Nombre completo del representante legal"
                    value={configForm.representanteLegal}
                    onChange={e =>
                      setConfigForm(f => ({ ...f, representanteLegal: e.target.value }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Domicilio Fiscal</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="calle">Calle y Número</Label>
                    <Input
                      id="calle"
                      placeholder="Ej: Av. Insurgentes Sur 1234, Int. 5"
                      value={configForm.calle}
                      onChange={e =>
                        setConfigForm(f => ({ ...f, calle: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colonia">Colonia</Label>
                    <Input
                      id="colonia"
                      placeholder="Ej: Del Valle"
                      value={configForm.colonia}
                      onChange={e =>
                        setConfigForm(f => ({ ...f, colonia: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="municipio">Municipio / Alcaldía</Label>
                    <Input
                      id="municipio"
                      placeholder="Ej: Benito Juárez"
                      value={configForm.municipio}
                      onChange={e =>
                        setConfigForm(f => ({ ...f, municipio: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      placeholder="Ej: Ciudad de México"
                      value={configForm.estado}
                      onChange={e =>
                        setConfigForm(f => ({ ...f, estado: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cp">Código Postal</Label>
                    <Input
                      id="cp"
                      placeholder="Ej: 03100"
                      maxLength={5}
                      value={configForm.codigoPostal}
                      onChange={e =>
                        setConfigForm(f => ({ ...f, codigoPostal: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveTenantConfig} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Courses Tab ── */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cursos Habilitados para STPS</CardTitle>
              <CardDescription>
                Configura qué cursos generan constancias DC-3 al ser completados.
                Cada curso necesita: área temática, objetivo, modalidad y horas oficiales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enabledCourses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No hay cursos habilitados para STPS</p>
                  <p className="text-sm mt-1">
                    Para habilitar un curso, edita su configuración STPS desde la vista del curso
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Curso ID</TableHead>
                      <TableHead>Área Temática</TableHead>
                      <TableHead>Modalidad</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Calificación Mínima</TableHead>
                      <TableHead>Instructor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enabledCourses.map(course => (
                      <TableRow key={course.courseId}>
                        <TableCell className="font-mono text-xs">
                          {course.courseId.substring(0, 12)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {course.areaTematica}. {STPS_AREAS_TEMATICAS[course.areaTematica as STPSAreaTematica]}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{course.modalidad}</TableCell>
                        <TableCell>{course.horasOficiales}h</TableCell>
                        <TableCell>{course.calificacionMinima ?? 80}/100</TableCell>
                        <TableCell>{course.instructorNombre || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ── Subcomponents ──

function StatCard({
  title,
  value,
  icon,
  description,
  variant = 'default',
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const variantColors = {
    default: 'text-primary',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className={`text-2xl font-bold mt-1 ${variantColors[variant]}`}>
                {value}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <div className="p-2 bg-muted rounded-lg">{icon}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ComplianceRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {value ? (
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" weight="fill" />
          <span>{value}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-amber-500">
          <XCircle className="h-4 w-4" weight="fill" />
          <span>Sin configurar</span>
        </div>
      )}
    </div>
  )
}

function ConstanciasTable({
  constancias,
  onDownload,
  formatDate,
}: {
  constancias: STPSConstancia[]
  onDownload: (c: STPSConstancia) => void
  formatDate: (iso: string) => string
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Folio</TableHead>
          <TableHead>Trabajador</TableHead>
          <TableHead>Curso</TableHead>
          <TableHead>Resultado</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {constancias.map(c => (
          <TableRow key={c.id}>
            <TableCell className="font-mono text-xs">{c.folioInterno}</TableCell>
            <TableCell>
              <div>
                <p className="text-sm font-medium">{c.trabajador.nombreCompleto}</p>
                <p className="text-xs text-muted-foreground">{c.trabajador.curp}</p>
              </div>
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-sm">
              {c.curso.nombre}
            </TableCell>
            <TableCell>
              {c.resultado.aprobado ? (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Aprobado ({c.resultado.calificacion})
                </Badge>
              ) : (
                <Badge variant="destructive">
                  No aprobado ({c.resultado.calificacion})
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-sm">{formatDate(c.fechaExpedicion)}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload(c)}
                title="Descargar DC-3 PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
