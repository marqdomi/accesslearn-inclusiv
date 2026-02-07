/**
 * Platform Alerts Center
 * Notifications and alert management
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Clock,
  Building2,
  Server,
  CreditCard,
  Users,
  Shield,
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
  PlatformAlert as ApiPlatformAlert 
} from '@/services/platform-admin.api';

// Local alert type with Date objects
interface LocalAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'system' | 'billing' | 'security' | 'tenant' | 'user';
  title: string;
  message: string;
  tenantId?: string;
  tenantName?: string;
  read: boolean;
  createdAt: Date;
}

// Transform API alert to local format
function transformAlert(apiAlert: ApiPlatformAlert): LocalAlert {
  return {
    id: apiAlert.id,
    type: apiAlert.type as LocalAlert['type'],
    category: apiAlert.category as LocalAlert['category'],
    title: apiAlert.title,
    message: apiAlert.message,
    tenantId: apiAlert.tenantId,
    tenantName: apiAlert.tenantName,
    read: apiAlert.isRead,
    createdAt: new Date(apiAlert.createdAt),
  };
}

const TYPE_CONFIG: Record<string, { color: string; icon: any; iconColor: string; bgColor: string }> = {
  critical: { 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: XCircle,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50 border-l-red-500'
  },
  warning: { 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    bgColor: 'bg-yellow-50 border-l-yellow-500'
  },
  info: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Info,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50 border-l-blue-500'
  },
  success: { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50 border-l-green-500'
  },
};

const CATEGORY_CONFIG: Record<string, { icon: any; label: string }> = {
  system: { icon: Server, label: 'Sistema' },
  billing: { icon: CreditCard, label: 'Facturación' },
  security: { icon: Shield, label: 'Seguridad' },
  tenant: { icon: Building2, label: 'Tenant' },
  user: { icon: Users, label: 'Usuario' },
};

export default function PlatformAlertsCenter() {
  const [alerts, setAlerts] = useState<LocalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Fetch alerts from API
  const fetchAlerts = useCallback(async () => {
    try {
      const apiAlerts = await platformAdminApi.getAlerts(true); // Include read alerts
      const localAlerts = apiAlerts.map(transformAlert);
      setAlerts(localAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = !search || 
        alert.title.toLowerCase().includes(search.toLowerCase()) ||
        alert.message.toLowerCase().includes(search.toLowerCase()) ||
        (alert.tenantName && alert.tenantName.toLowerCase().includes(search.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || alert.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || alert.category === categoryFilter;
      const matchesUnread = !showUnreadOnly || !alert.read;
      
      return matchesSearch && matchesType && matchesCategory && matchesUnread;
    });
  }, [alerts, search, typeFilter, categoryFilter, showUnreadOnly]);

  // Stats
  const unreadCount = alerts.filter(a => !a.read).length;
  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.read).length;
  const warningCount = alerts.filter(a => a.type === 'warning' && !a.read).length;

  // Actions
  const markAsRead = async (id: string, category: string) => {
    try {
      await platformAdminApi.markAlertAsRead(id, category);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    // Mark all unread alerts as read one by one
    const unreadAlerts = alerts.filter(a => !a.read);
    for (const alert of unreadAlerts) {
      try {
        await platformAdminApi.markAlertAsRead(alert.id, alert.category);
      } catch (error) {
        console.error('Error marking alert as read:', error);
      }
    }
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const deleteAlert = async (id: string, category: string) => {
    try {
      await platformAdminApi.deleteAlert(id, category);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 60) return `Hace ${minutes} minutos`;
    if (hours < 24) return `Hace ${hours} horas`;
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16" />
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
            <Bell className="h-7 w-7 text-indigo-500" />
            Centro de Alertas
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Notificaciones y alertas de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Marcar todas como leídas
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Alertas</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sin Leer</p>
                <p className="text-2xl font-bold text-indigo-600">{unreadCount}</p>
              </div>
              <EyeOff className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={criticalCount > 0 ? 'border-red-200' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Críticas</p>
                <p className={cn('text-2xl font-bold', criticalCount > 0 ? 'text-red-600' : '')}>
                  {criticalCount}
                </p>
              </div>
              <XCircle className={cn('h-8 w-8', criticalCount > 0 ? 'text-red-500' : 'text-gray-300')} />
            </div>
          </CardContent>
        </Card>
        <Card className={warningCount > 0 ? 'border-yellow-200' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Advertencias</p>
                <p className={cn('text-2xl font-bold', warningCount > 0 ? 'text-yellow-600' : '')}>
                  {warningCount}
                </p>
              </div>
              <AlertTriangle className={cn('h-8 w-8', warningCount > 0 ? 'text-yellow-500' : 'text-gray-300')} />
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
                placeholder="Buscar alertas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Filtrar por tipo"
              >
                <option value="all">Todos los tipos</option>
                <option value="critical">Críticas</option>
                <option value="warning">Advertencias</option>
                <option value="info">Información</option>
                <option value="success">Éxito</option>
              </select>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Filtrar por categoría"
              >
                <option value="all">Todas las categorías</option>
                <option value="system">Sistema</option>
                <option value="billing">Facturación</option>
                <option value="security">Seguridad</option>
                <option value="tenant">Tenant</option>
                <option value="user">Usuario</option>
              </select>
              <Button
                variant={showUnreadOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                Solo sin leer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardContent className="pt-6">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay alertas que coincidan con los filtros</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map(alert => {
                const typeConfig = TYPE_CONFIG[alert.type];
                const categoryConfig = CATEGORY_CONFIG[alert.category];
                const TypeIcon = typeConfig.icon;
                const CategoryIcon = categoryConfig.icon;
                
                return (
                  <div 
                    key={alert.id}
                    className={cn(
                      'relative p-4 rounded-lg border-l-4 transition-colors',
                      typeConfig.bgColor,
                      !alert.read && 'ring-1 ring-indigo-200'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn('mt-0.5', typeConfig.iconColor)}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={cn(
                            'font-medium',
                            !alert.read && 'font-semibold'
                          )}>
                            {alert.title}
                          </h3>
                          {!alert.read && (
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <CategoryIcon className="h-3 w-3" />
                            {categoryConfig.label}
                          </span>
                          {alert.tenantName && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {alert.tenantName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(alert.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!alert.read && (
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => markAsRead(alert.id, alert.category)}
                            title="Marcar como leída"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => deleteAlert(alert.id, alert.category)}
                          className="text-gray-400 hover:text-red-500"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
