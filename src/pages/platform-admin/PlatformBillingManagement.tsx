/**
 * Platform Billing Management
 * Plan management, invoices, and subscription tracking
 * 
 * Connected to real Azure Cosmos DB via Platform Admin API.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Search,
  Filter,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  ArrowUpRight,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  platformAdminApi, 
  Subscription as ApiSubscription, 
  Invoice as ApiInvoice 
} from '@/services/platform-admin.api';

// Plan colors for badges
const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-800',
  profesional: 'bg-indigo-100 text-indigo-800',
  enterprise: 'bg-purple-100 text-purple-800',
};

// Status configuration
const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  active: { color: 'border-green-500 text-green-700', icon: CheckCircle2, label: 'Activo' },
  past_due: { color: 'border-red-500 text-red-700', icon: AlertCircle, label: 'Pago Atrasado' },
  canceled: { color: 'border-gray-500 text-gray-700', icon: XCircle, label: 'Cancelado' },
  trial: { color: 'border-blue-500 text-blue-700', icon: Clock, label: 'Prueba' },
  paid: { color: 'border-green-500 text-green-700', icon: CheckCircle2, label: 'Pagada' },
  pending: { color: 'border-yellow-500 text-yellow-700', icon: Clock, label: 'Pendiente' },
  overdue: { color: 'border-red-500 text-red-700', icon: AlertCircle, label: 'Vencida' },
};

export default function PlatformBillingManagement() {
  const [subscriptions, setSubscriptions] = useState<ApiSubscription[]>([]);
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchSubs, setSearchSubs] = useState('');
  const [searchInvoices, setSearchInvoices] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      const [subsData, invoicesData] = await Promise.all([
        platformAdminApi.getSubscriptions(),
        platformAdminApi.getInvoices(),
      ]);
      setSubscriptions(subsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Calculate metrics from real data
  const mrr = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.priceMonthly : s.priceMonthly), 0);
  
  const arr = mrr * 12;
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const overdueAmount = invoices
    .filter(i => i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount, 0);

  // Filter subscriptions
  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = !searchSubs || 
      sub.tenantName.toLowerCase().includes(searchSubs.toLowerCase());
    const matchesPlan = planFilter === 'all' || sub.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    return !searchInvoices || 
      inv.tenantName.toLowerCase().includes(searchInvoices.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchInvoices.toLowerCase());
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-indigo-500" />
            Facturación y Suscripciones
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestión de planes, pagos y facturación
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
            Actualizar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">MRR</p>
                <p className="text-2xl font-bold text-green-600">
                  ${mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +12% vs mes anterior
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ARR</p>
                <p className="text-2xl font-bold">${arr.toLocaleString('en-US')}</p>
                <p className="text-xs text-gray-500">Ingresos anuales recurrentes</p>
              </div>
              <TrendingUp className="h-10 w-10 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Suscripciones Activas</p>
                <p className="text-2xl font-bold">{activeSubscriptions}</p>
                <p className="text-xs text-gray-500">de {subscriptions.length} totales</p>
              </div>
              <Building2 className="h-10 w-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className={overdueAmount > 0 ? 'border-red-200' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pagos Vencidos</p>
                <p className={cn('text-2xl font-bold', overdueAmount > 0 ? 'text-red-600' : '')}>
                  ${overdueAmount.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-red-600">
                  {invoices.filter(i => i.status === 'overdue').length} facturas pendientes
                </p>
              </div>
              <AlertCircle className={cn('h-10 w-10', overdueAmount > 0 ? 'text-red-500' : 'text-gray-300')} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions">
        <TabsList>
          <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
          <TabsTrigger value="invoices">Facturas</TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por tenant..."
                    value={searchSubs}
                    onChange={e => setSearchSubs(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={planFilter}
                    onChange={e => setPlanFilter(e.target.value)}
                    className="rounded-md border px-3 py-2 text-sm"
                    aria-label="Filtrar por plan"
                  >
                    <option value="all">Todos los planes</option>
                    <option value="starter">Starter</option>
                    <option value="profesional">Profesional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="rounded-md border px-3 py-2 text-sm"
                    aria-label="Filtrar por estado"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="past_due">Pago Atrasado</option>
                    <option value="trial">Prueba</option>
                    <option value="canceled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tenant</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Plan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ciclo</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Auto-renovar</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Próx. Cobro</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubs.map(sub => {
                      const statusConfig = STATUS_CONFIG[sub.status] || STATUS_CONFIG.active;
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <tr key={sub.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{sub.tenantName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={PLAN_COLORS[sub.plan]}>
                              {sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={statusConfig.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {sub.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {sub.autoRenew ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            ${sub.priceMonthly.toLocaleString('en-US')}
                            <span className="text-xs text-gray-500">
                              /{sub.billingCycle === 'monthly' ? 'mes' : 'año'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(sub.nextBillingDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm">
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por tenant o número de factura..."
                    value={searchInvoices}
                    onChange={e => setSearchInvoices(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Factura</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tenant</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vencimiento</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map(inv => {
                      const statusConfig = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending;
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <tr key={inv.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="font-mono text-sm">{inv.id.slice(0, 12)}...</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{inv.tenantName}</td>
                          <td className="px-4 py-3 text-sm">{new Date(inv.issueDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm">{new Date(inv.dueDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-medium">
                            ${inv.amount.toLocaleString('en-US')} {inv.currency}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={statusConfig.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
