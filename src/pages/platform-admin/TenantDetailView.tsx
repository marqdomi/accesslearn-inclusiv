/**
 * Tenant Detail View
 * 
 * Comprehensive view of a single tenant with tabs for
 * Overview, Users, Courses, Billing, Settings, and Audit Log.
 */

import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Building2,
  Users,
  BookOpen,
  CreditCard,
  Settings,
  FileText,
  MoreHorizontal,
  Edit,
  Pause,
  Play,
  Trash2,
  UserPlus,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Palette,
  Shield,
  BarChart3,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Mock data for demonstration
const mockTenant = {
  id: '1',
  name: 'Acme Corporation',
  slug: 'acme',
  domain: 'learn.acme.com',
  contactEmail: 'admin@acme.com',
  contactPhone: '+1 555-123-4567',
  plan: 'enterprise' as const,
  status: 'active' as const,
  logo: null,
  primaryColor: '#4F46E5',
  secondaryColor: '#10B981',
  createdAt: '2024-01-15',
  updatedAt: '2024-01-20',
  createdBy: 'super-admin@platform.com',
  subscriptionStartDate: '2024-01-15',
  trialEndsAt: null,
  maxUsers: 500,
  maxCourses: 100,
  
  // Stats
  stats: {
    userCount: 245,
    activeUsers: 189,
    courseCount: 32,
    completionRate: 78,
    totalLessonsCompleted: 4523,
    avgTimePerUser: '2.5 hrs/week',
  },
  
  // Mexican compliance
  rfc: 'ACM901213AB5',
  businessName: 'Acme Corporation S.A. de C.V.',
  address: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX, 03100',
}

const mockUsers = [
  { id: '1', name: 'María García', email: 'maria@acme.com', role: 'tenant-admin', status: 'active', lastLogin: '2024-01-20' },
  { id: '2', name: 'Juan Pérez', email: 'juan@acme.com', role: 'instructor', status: 'active', lastLogin: '2024-01-19' },
  { id: '3', name: 'Ana López', email: 'ana@acme.com', role: 'student', status: 'active', lastLogin: '2024-01-20' },
  { id: '4', name: 'Carlos Ruiz', email: 'carlos@acme.com', role: 'student', status: 'inactive', lastLogin: '2024-01-10' },
  { id: '5', name: 'Laura Sánchez', email: 'laura@acme.com', role: 'mentor', status: 'active', lastLogin: '2024-01-18' },
]

const mockCourses = [
  { id: '1', title: 'Onboarding Empresarial', status: 'published', students: 180, completionRate: 85, createdAt: '2024-01-05' },
  { id: '2', title: 'Seguridad Informática', status: 'published', students: 145, completionRate: 72, createdAt: '2024-01-08' },
  { id: '3', title: 'Liderazgo Efectivo', status: 'draft', students: 0, completionRate: 0, createdAt: '2024-01-15' },
  { id: '4', title: 'Comunicación Profesional', status: 'published', students: 98, completionRate: 65, createdAt: '2024-01-12' },
]

const mockBillingHistory = [
  { id: '1', date: '2024-01-15', description: 'Enterprise Plan - Monthly', amount: 499, status: 'paid' },
  { id: '2', date: '2023-12-15', description: 'Enterprise Plan - Monthly', amount: 499, status: 'paid' },
  { id: '3', date: '2023-11-15', description: 'Professional Plan - Monthly', amount: 199, status: 'paid' },
  { id: '4', date: '2023-10-15', description: 'Professional Plan - Monthly', amount: 199, status: 'paid' },
]

const mockAuditLog = [
  { id: '1', action: 'User invited', user: 'maria@acme.com', details: 'Invited carlos@acme.com as student', timestamp: '2024-01-20 14:30' },
  { id: '2', action: 'Course published', user: 'juan@acme.com', details: 'Published "Seguridad Informática"', timestamp: '2024-01-19 10:15' },
  { id: '3', action: 'Plan upgraded', user: 'maria@acme.com', details: 'Upgraded from Professional to Enterprise', timestamp: '2024-01-15 09:00' },
  { id: '4', action: 'Logo updated', user: 'maria@acme.com', details: 'Updated organization logo', timestamp: '2024-01-14 16:45' },
  { id: '5', action: 'User deactivated', user: 'maria@acme.com', details: 'Deactivated user pedro@acme.com', timestamp: '2024-01-12 11:20' },
]

// Helper components
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; label: string }> = {
    active: { className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', label: 'Active' },
    trial: { className: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'Trial' },
    suspended: { className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', label: 'Suspended' },
    canceled: { className: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Canceled' },
    inactive: { className: 'bg-muted text-muted-foreground border-muted', label: 'Inactive' },
  }
  const { className, label } = config[status] || config.active

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'outline'; className: string }> = {
    enterprise: { variant: 'default', className: 'bg-purple-500 hover:bg-purple-600' },
    profesional: { variant: 'secondary', className: '' },
    demo: { variant: 'outline', className: '' },
  }
  const config = variants[plan] || variants.demo
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </Badge>
  )
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, string> = {
    'tenant-admin': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'instructor': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'mentor': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'student': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  }
  
  return (
    <Badge variant="outline" className={config[role] || config.student}>
      {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </Badge>
  )
}

function StatCard({ icon: Icon, label, value, subValue, trend }: {
  icon: React.ElementType
  label: string
  value: string | number
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
          {subValue && (
            <p className={cn(
              "text-xs",
              trend === 'up' && "text-emerald-600",
              trend === 'down' && "text-destructive",
              !trend && "text-muted-foreground"
            )}>
              {subValue}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

// Tab content components
function OverviewTab() {
  const [copied, setCopied] = useState(false)
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={mockTenant.stats.userCount} subValue={`${mockTenant.stats.activeUsers} active`} />
        <StatCard icon={BookOpen} label="Courses" value={mockTenant.stats.courseCount} subValue="3 in draft" />
        <StatCard icon={TrendingUp} label="Completion Rate" value={`${mockTenant.stats.completionRate}%`} subValue="+5% vs last month" trend="up" />
        <StatCard icon={Activity} label="Avg. Engagement" value={mockTenant.stats.avgTimePerUser} subValue="per user" />
      </div>

      {/* Tenant Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Tenant ID</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{mockTenant.id}</code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(mockTenant.id)}>
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Slug</Label>
                <p className="text-sm mt-1">@{mockTenant.slug}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Contact Email</Label>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {mockTenant.contactEmail}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Contact Phone</Label>
                <p className="text-sm mt-1">{mockTenant.contactPhone}</p>
              </div>
              {mockTenant.domain && (
                <div>
                  <Label className="text-xs text-muted-foreground">Custom Domain</Label>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={`https://${mockTenant.domain}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {mockTenant.domain}
                      <ExternalLink className="inline h-3 w-3 ml-1" />
                    </a>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs text-muted-foreground">Current Plan</Label>
                <div className="mt-1">
                  <PlanBadge plan={mockTenant.plan} />
                </div>
              </div>
              <div className="text-right">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <StatusBadge status={mockTenant.status} />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Subscription Start</Label>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(mockTenant.subscriptionStartDate), 'MMMM dd, yyyy')}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">User Limit</Label>
                  <div className="mt-1">
                    <p className="text-sm">{mockTenant.stats.userCount} / {mockTenant.maxUsers}</p>
                    <Progress value={(mockTenant.stats.userCount / mockTenant.maxUsers) * 100} className="h-1 mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Course Limit</Label>
                  <div className="mt-1">
                    <p className="text-sm">{mockTenant.stats.courseCount} / {mockTenant.maxCourses}</p>
                    <Progress value={(mockTenant.stats.courseCount / mockTenant.maxCourses) * 100} className="h-1 mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mexican Compliance */}
      {(mockTenant.rfc || mockTenant.businessName) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Mexican Compliance Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="text-xs text-muted-foreground">RFC</Label>
                <p className="text-sm mt-1 font-mono">{mockTenant.rfc}</p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Business Name</Label>
                <p className="text-sm mt-1">{mockTenant.businessName}</p>
              </div>
              <div className="sm:col-span-3">
                <Label className="text-xs text-muted-foreground">Address</Label>
                <p className="text-sm mt-1">{mockTenant.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function UsersTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Users</h3>
          <p className="text-sm text-muted-foreground">
            {mockTenant.stats.userCount} users in this organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email All
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(user.lastLogin), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Login as User</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function CoursesTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Courses</h3>
          <p className="text-sm text-muted-foreground">
            {mockTenant.stats.courseCount} courses created
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync Stats
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>
                  <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                </TableCell>
                <TableCell>{course.students}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={course.completionRate} className="h-2 w-16" />
                    <span className="text-sm">{course.completionRate}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(course.createdAt), 'MMM dd, yyyy')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function BillingTab() {
  return (
    <div className="space-y-6">
      {/* Current subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold">$499<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <p className="text-sm text-muted-foreground">Enterprise Plan • Billed monthly</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Change Plan</Button>
              <Button variant="outline" size="sm" className="text-destructive">Cancel</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBillingHistory.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="text-sm">
                    {format(new Date(invoice.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell className="font-medium">${invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-8 w-8 rounded border" style={{ backgroundColor: mockTenant.primaryColor }} />
                <Input value={mockTenant.primaryColor} className="font-mono" readOnly />
              </div>
            </div>
            <div>
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-8 w-8 rounded border" style={{ backgroundColor: mockTenant.secondaryColor }} />
                <Input value={mockTenant.secondaryColor} className="font-mono" readOnly />
              </div>
            </div>
          </div>
          <div>
            <Label>Logo</Label>
            <div className="mt-1 flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg border flex items-center justify-center bg-muted">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <Button variant="outline" size="sm">Upload Logo</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Max Users</Label>
              <Input type="number" value={mockTenant.maxUsers} className="mt-1" readOnly />
            </div>
            <div>
              <Label>Max Courses</Label>
              <Input type="number" value={mockTenant.maxCourses} className="mt-1" readOnly />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            To change limits, upgrade the tenant's plan or contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function AuditLogTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Audit Log</h3>
          <p className="text-sm text-muted-foreground">
            Recent activity in this organization
          </p>
        </div>
        <Button variant="outline" size="sm">
          Export Log
        </Button>
      </div>

      <Card>
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-4">
            {mockAuditLog.map((entry, index) => (
              <div key={entry.id} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  {index < mockAuditLog.length - 1 && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium">{entry.action}</p>
                  <p className="text-xs text-muted-foreground">{entry.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">{entry.user}</span> • {entry.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}

export function TenantDetailView() {
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  
  // In real implementation, fetch tenant data based on tenantId
  const tenant = mockTenant

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/platform-admin/tenants')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-purple-500/20 to-indigo-500/20">
            <Building2 className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{tenant.name}</h1>
              <StatusBadge status={tenant.status} />
              <PlanBadge plan={tenant.plan} />
            </div>
            <p className="text-sm text-muted-foreground">@{tenant.slug} • {tenant.contactEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Tenant Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Globe className="mr-2 h-4 w-4" />
                Visit App
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlus className="mr-2 h-4 w-4" />
                Login as Admin
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-yellow-600">
                <Pause className="mr-2 h-4 w-4" />
                Suspend Tenant
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Tenant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild>
            <Link to={`/platform-admin/tenants/${tenantId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <FileText className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <UsersTab />
        </TabsContent>
        <TabsContent value="courses" className="mt-6">
          <CoursesTab />
        </TabsContent>
        <TabsContent value="billing" className="mt-6">
          <BillingTab />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <SettingsTab />
        </TabsContent>
        <TabsContent value="audit" className="mt-6">
          <AuditLogTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
