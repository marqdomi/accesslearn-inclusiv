/**
 * Platform User Directory
 * Cross-tenant user search and management
 */

import { useState, useMemo } from 'react';
import { 
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Shield,
  Building2,
  Calendar,
  MoreHorizontal,
  Eye,
  UserCog,
  Ban,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';

// Types
interface PlatformUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  tenantId: string;
  tenantName: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date | null;
  createdAt: Date;
  coursesEnrolled: number;
  coursesCompleted: number;
}

// Mock data
const MOCK_USERS: PlatformUser[] = [
  {
    id: 'u1',
    email: 'ana.lopez@kainet.mx',
    firstName: 'Ana',
    lastName: 'López',
    role: 'super-admin',
    tenantId: 'kainet',
    tenantName: 'Kainet (Platform)',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: new Date('2024-01-01'),
    coursesEnrolled: 0,
    coursesCompleted: 0,
  },
  {
    id: 'u2',
    email: 'carlos.martinez@acme.com',
    firstName: 'Carlos',
    lastName: 'Martínez',
    role: 'tenant-admin',
    tenantId: 'acme',
    tenantName: 'Acme Corporation',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
    createdAt: new Date('2024-03-15'),
    coursesEnrolled: 5,
    coursesCompleted: 3,
  },
  {
    id: 'u3',
    email: 'maria.garcia@techcorp.io',
    firstName: 'María',
    lastName: 'García',
    role: 'instructor',
    tenantId: 'techcorp',
    tenantName: 'TechCorp Industries',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24),
    createdAt: new Date('2024-05-20'),
    coursesEnrolled: 12,
    coursesCompleted: 8,
  },
  {
    id: 'u4',
    email: 'juan.rodriguez@acme.com',
    firstName: 'Juan',
    lastName: 'Rodríguez',
    role: 'student',
    tenantId: 'acme',
    tenantName: 'Acme Corporation',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 48),
    createdAt: new Date('2024-06-10'),
    coursesEnrolled: 8,
    coursesCompleted: 2,
  },
  {
    id: 'u5',
    email: 'laura.sanchez@globalbank.com',
    firstName: 'Laura',
    lastName: 'Sánchez',
    role: 'content-manager',
    tenantId: 'globalbank',
    tenantName: 'Global Bank',
    status: 'inactive',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    createdAt: new Date('2024-02-01'),
    coursesEnrolled: 3,
    coursesCompleted: 1,
  },
  {
    id: 'u6',
    email: 'pedro.torres@techcorp.io',
    firstName: 'Pedro',
    lastName: 'Torres',
    role: 'student',
    tenantId: 'techcorp',
    tenantName: 'TechCorp Industries',
    status: 'suspended',
    lastLogin: null,
    createdAt: new Date('2024-07-01'),
    coursesEnrolled: 2,
    coursesCompleted: 0,
  },
];

const ROLES = [
  { value: 'all', label: 'Todos los roles' },
  { value: 'super-admin', label: 'Super Admin' },
  { value: 'tenant-admin', label: 'Tenant Admin' },
  { value: 'content-manager', label: 'Content Manager' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'student', label: 'Estudiante' },
];

const STATUSES = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'suspended', label: 'Suspendido' },
];

// Column Helper
const columnHelper = createColumnHelper<PlatformUser>();

export default function PlatformUserDirectory() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Filter data
  const filteredData = useMemo(() => {
    return MOCK_USERS.filter(user => {
      const matchesSearch = !search || 
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        user.tenantName.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [search, roleFilter, statusFilter]);

  // Table columns
  const columns = useMemo(() => [
    columnHelper.accessor(row => `${row.firstName} ${row.lastName}`, {
      id: 'name',
      header: 'Usuario',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.original.avatar} />
            <AvatarFallback className="bg-indigo-100 text-indigo-600">
              {row.original.firstName[0]}{row.original.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
            <p className="text-sm text-gray-500">{row.original.email}</p>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('tenantName', {
      header: 'Tenant',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span>{row.original.tenantName}</span>
        </div>
      ),
    }),
    columnHelper.accessor('role', {
      header: 'Rol',
      cell: ({ getValue }) => {
        const role = getValue();
        const roleConfig: Record<string, { color: string; label: string }> = {
          'super-admin': { color: 'bg-purple-100 text-purple-800', label: 'Super Admin' },
          'tenant-admin': { color: 'bg-blue-100 text-blue-800', label: 'Tenant Admin' },
          'content-manager': { color: 'bg-indigo-100 text-indigo-800', label: 'Content Manager' },
          'instructor': { color: 'bg-green-100 text-green-800', label: 'Instructor' },
          'mentor': { color: 'bg-teal-100 text-teal-800', label: 'Mentor' },
          'student': { color: 'bg-gray-100 text-gray-800', label: 'Estudiante' },
        };
        const config = roleConfig[role] || roleConfig.student;
        return (
          <Badge className={cn('font-normal', config.color)}>
            <Shield className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Estado',
      cell: ({ getValue }) => {
        const status = getValue();
        return (
          <Badge variant="outline" className={cn(
            status === 'active' && 'border-green-500 text-green-700',
            status === 'inactive' && 'border-gray-500 text-gray-700',
            status === 'suspended' && 'border-red-500 text-red-700'
          )}>
            {status === 'active' && <CheckCircle2 className="mr-1 h-3 w-3" />}
            {status === 'inactive' && <Clock className="mr-1 h-3 w-3" />}
            {status === 'suspended' && <XCircle className="mr-1 h-3 w-3" />}
            {status === 'active' ? 'Activo' : status === 'inactive' ? 'Inactivo' : 'Suspendido'}
          </Badge>
        );
      },
    }),
    columnHelper.accessor('coursesEnrolled', {
      header: 'Cursos',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <GraduationCap className="h-4 w-4 text-gray-400" />
          <span>{row.original.coursesCompleted}/{row.original.coursesEnrolled}</span>
        </div>
      ),
    }),
    columnHelper.accessor('lastLogin', {
      header: 'Último Acceso',
      cell: ({ getValue }) => {
        const date = getValue();
        if (!date) return <span className="text-gray-400">Nunca</span>;
        
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        
        if (hours < 1) return 'Hace menos de 1 hora';
        if (hours < 24) return `Hace ${hours} horas`;
        if (days < 30) return `Hace ${days} días`;
        return date.toLocaleDateString();
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Ver perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserCog className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Enviar email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.status !== 'suspended' ? (
              <DropdownMenuItem className="text-red-600">
                <Ban className="mr-2 h-4 w-4" />
                Suspender
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-green-600">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Reactivar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Stats
  const totalUsers = MOCK_USERS.length;
  const activeUsers = MOCK_USERS.filter(u => u.status === 'active').length;
  const suspendedUsers = MOCK_USERS.filter(u => u.status === 'suspended').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-500" />
            Directorio de Usuarios
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestión de usuarios a nivel de plataforma
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Usuarios</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Activos</p>
                <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Suspendidos</p>
                <p className="text-2xl font-bold text-red-600">{suspendedUsers}</p>
              </div>
              <Ban className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tenants</p>
                <p className="text-2xl font-bold">{new Set(MOCK_USERS.map(u => u.tenantId)).size}</p>
              </div>
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o tenant..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              >
                {STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="border-b bg-gray-50 dark:bg-gray-800">
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-medium text-gray-500"
                      >
                        {header.isPlaceholder ? null : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Mostrando {table.getRowModel().rows.length} de {filteredData.length} usuarios
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
