/**
 * Platform Health Monitor
 * Real-time monitoring of platform services and resources
 */

import { useState, useEffect } from 'react';
import { 
  Activity,
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Types
interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: number;
  lastCheck: Date;
  region: string;
}

interface ResourceMetric {
  name: string;
  current: number;
  max: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  history: number[];
}

interface Incident {
  id: string;
  title: string;
  service: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  startedAt: Date;
  updatedAt: Date;
}

// Mock data
const SERVICES: ServiceStatus[] = [
  { name: 'API Gateway', status: 'healthy', latency: 45, uptime: 99.99, lastCheck: new Date(), region: 'East US' },
  { name: 'Authentication', status: 'healthy', latency: 32, uptime: 99.98, lastCheck: new Date(), region: 'East US' },
  { name: 'Database (Cosmos DB)', status: 'healthy', latency: 12, uptime: 99.99, lastCheck: new Date(), region: 'East US' },
  { name: 'Blob Storage', status: 'healthy', latency: 28, uptime: 99.95, lastCheck: new Date(), region: 'East US' },
  { name: 'CDN', status: 'degraded', latency: 156, uptime: 99.80, lastCheck: new Date(), region: 'Global' },
  { name: 'Email Service', status: 'healthy', latency: 89, uptime: 99.90, lastCheck: new Date(), region: 'East US' },
  { name: 'Search Index', status: 'healthy', latency: 67, uptime: 99.92, lastCheck: new Date(), region: 'East US' },
  { name: 'Analytics Pipeline', status: 'healthy', latency: 234, uptime: 99.85, lastCheck: new Date(), region: 'East US' },
];

const RESOURCES: ResourceMetric[] = [
  { name: 'CPU Usage', current: 42, max: 100, unit: '%', trend: 'stable', history: [38, 40, 45, 42, 41, 42] },
  { name: 'Memory', current: 6.2, max: 16, unit: 'GB', trend: 'up', history: [5.8, 5.9, 6.0, 6.1, 6.2, 6.2] },
  { name: 'Storage', current: 245, max: 500, unit: 'GB', trend: 'up', history: [230, 235, 238, 241, 244, 245] },
  { name: 'Bandwidth', current: 78, max: 100, unit: 'Mbps', trend: 'down', history: [85, 82, 80, 79, 78, 78] },
  { name: 'Request/min', current: 1250, max: 5000, unit: '', trend: 'up', history: [1100, 1150, 1200, 1220, 1240, 1250] },
  { name: 'Active Connections', current: 324, max: 1000, unit: '', trend: 'stable', history: [320, 318, 325, 322, 324, 324] },
];

const INCIDENTS: Incident[] = [
  {
    id: '1',
    title: 'Elevated latency on CDN',
    service: 'CDN',
    severity: 'warning',
    status: 'monitoring',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
];

// Helper Components
const StatusIcon = ({ status }: { status: 'healthy' | 'degraded' | 'down' }) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'degraded':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'down':
      return <XCircle className="h-5 w-5 text-red-500" />;
  }
};

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    case 'stable':
      return <Minus className="h-4 w-4 text-gray-400" />;
  }
};

const MiniChart = ({ data, color = 'indigo' }: { data: number[]; color?: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((value, idx) => (
        <div
          key={idx}
          className={cn(
            'w-1.5 rounded-t',
            color === 'indigo' ? 'bg-indigo-500' : 'bg-green-500'
          )}
          style={{ 
            height: `${Math.max(((value - min) / range) * 100, 10)}%`,
            opacity: 0.4 + (idx / data.length) * 0.6
          }}
        />
      ))}
    </div>
  );
};

export default function PlatformHealthMonitor() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const healthyCount = SERVICES.filter(s => s.status === 'healthy').length;
  const degradedCount = SERVICES.filter(s => s.status === 'degraded').length;
  const downCount = SERVICES.filter(s => s.status === 'down').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-7 w-7 text-indigo-500" />
            Platform Health
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitoreo en tiempo real de servicios y recursos
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Última actualización: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-4 gap-4">
        <Card className={cn(
          'border-l-4',
          healthyCount === SERVICES.length ? 'border-l-green-500' : 'border-l-yellow-500'
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Estado General</p>
                <p className="text-2xl font-bold">
                  {healthyCount === SERVICES.length ? 'Operacional' : 
                   downCount > 0 ? 'Incidente' : 'Degradado'}
                </p>
              </div>
              {healthyCount === SERVICES.length ? (
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              ) : downCount > 0 ? (
                <XCircle className="h-10 w-10 text-red-500" />
              ) : (
                <AlertTriangle className="h-10 w-10 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Servicios Activos</p>
                <p className="text-2xl font-bold text-green-600">{healthyCount}/{SERVICES.length}</p>
              </div>
              <Server className="h-10 w-10 text-gray-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Uptime Promedio</p>
                <p className="text-2xl font-bold">
                  {(SERVICES.reduce((sum, s) => sum + s.uptime, 0) / SERVICES.length).toFixed(2)}%
                </p>
              </div>
              <Clock className="h-10 w-10 text-gray-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Latencia Promedio</p>
                <p className="text-2xl font-bold">
                  {Math.round(SERVICES.reduce((sum, s) => sum + s.latency, 0) / SERVICES.length)}ms
                </p>
              </div>
              <Globe className="h-10 w-10 text-gray-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Services Status */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Estado de Servicios
            </CardTitle>
            <CardDescription>
              Monitoreo de todos los servicios de la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SERVICES.map(service => (
                <div 
                  key={service.name}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    service.status === 'healthy' && 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
                    service.status === 'degraded' && 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
                    service.status === 'down' && 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon status={service.status} />
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-gray-500">{service.region}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-gray-500">Latencia</p>
                      <p className={cn(
                        'font-medium',
                        service.latency < 100 ? 'text-green-600' : 
                        service.latency < 200 ? 'text-yellow-600' : 'text-red-600'
                      )}>
                        {service.latency}ms
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Uptime</p>
                      <p className="font-medium">{service.uptime}%</p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={cn(
                        service.status === 'healthy' && 'border-green-500 text-green-700',
                        service.status === 'degraded' && 'border-yellow-500 text-yellow-700',
                        service.status === 'down' && 'border-red-500 text-red-700'
                      )}
                    >
                      {service.status === 'healthy' ? 'Operacional' :
                       service.status === 'degraded' ? 'Degradado' : 'Caído'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Incidentes Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {INCIDENTS.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">No hay incidentes activos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {INCIDENTS.map(incident => (
                  <div 
                    key={incident.id}
                    className={cn(
                      'p-4 rounded-lg border-l-4',
                      incident.severity === 'critical' && 'bg-red-50 border-l-red-500 dark:bg-red-900/20',
                      incident.severity === 'warning' && 'bg-yellow-50 border-l-yellow-500 dark:bg-yellow-900/20',
                      incident.severity === 'info' && 'bg-blue-50 border-l-blue-500 dark:bg-blue-900/20'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{incident.title}</p>
                        <p className="text-sm text-gray-500">{incident.service}</p>
                      </div>
                      <Badge 
                        variant="outline"
                        className={cn(
                          incident.status === 'investigating' && 'border-red-500 text-red-700',
                          incident.status === 'identified' && 'border-yellow-500 text-yellow-700',
                          incident.status === 'monitoring' && 'border-blue-500 text-blue-700',
                          incident.status === 'resolved' && 'border-green-500 text-green-700'
                        )}
                      >
                        {incident.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Inicio: {incident.startedAt.toLocaleString()}</p>
                      <p>Actualizado: {incident.updatedAt.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resource Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Recursos del Sistema
          </CardTitle>
          <CardDescription>
            Uso actual de recursos de la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {RESOURCES.map(resource => {
              const percentage = (resource.current / resource.max) * 100;
              const isHigh = percentage > 80;
              const isMedium = percentage > 60;
              
              return (
                <div key={resource.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {resource.name === 'CPU Usage' && <Cpu className="h-4 w-4 text-gray-500" />}
                      {resource.name === 'Memory' && <MemoryStick className="h-4 w-4 text-gray-500" />}
                      {resource.name === 'Storage' && <HardDrive className="h-4 w-4 text-gray-500" />}
                      {resource.name === 'Bandwidth' && <Globe className="h-4 w-4 text-gray-500" />}
                      {resource.name === 'Request/min' && <Activity className="h-4 w-4 text-gray-500" />}
                      {resource.name === 'Active Connections' && <Database className="h-4 w-4 text-gray-500" />}
                      <span className="font-medium">{resource.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendIcon trend={resource.trend} />
                      <span className={cn(
                        'text-sm font-medium',
                        isHigh ? 'text-red-600' : isMedium ? 'text-yellow-600' : 'text-green-600'
                      )}>
                        {resource.current}{resource.unit}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={cn(
                      'h-2',
                      isHigh ? '[&>div]:bg-red-500' : isMedium ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                    )}
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{resource.current} / {resource.max} {resource.unit}</span>
                    <MiniChart data={resource.history} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
