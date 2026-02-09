import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api.service';
import { CircleNotch, Buildings, WarningCircle, SignOut } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TenantLogo } from '@/components/branding/TenantLogo';

interface TenantResolverProps {
  children: React.ReactNode;
}

/**
 * Rutas públicas que no requieren tenant para funcionar
 */
const PUBLIC_ROUTES = ['/accept-invitation', '/register', '/login'];

/**
 * TenantResolver: Detecta y resuelve el tenant actual
 * 
 * Estrategia de resolución (en orden de prioridad):
 * 1. Usuario autenticado: usa tenantId del JWT
 * 2. Query param: ?tenant=kainet
 * 3. URL path: /t/kainet → tenant: kainet (path-based routing)
 * 4. Subdomain (producción): kainet.kaido.kainet.mx → tenant: kainet
 * 5. localStorage: Última selección del usuario
 * 6. Selector manual: Usuario elige de lista
 * 
 * Solo renderiza children cuando el tenant está confirmado O en rutas públicas.
 */
export function TenantResolver({ children }: TenantResolverProps) {
  const location = useLocation();
  const { currentTenant, setCurrentTenant, clearTenant, isLoading: tenantLoading } = useTenant();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [resolving, setResolving] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Array<{
    id: string;
    name: string;
    slug: string;
  }>>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [savedTenantId, setSavedTenantId] = useState<string | null>(null);

  // Check if current route is public (doesn't require tenant)
  const isPublicRoute = PUBLIC_ROUTES.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    // Si es una ruta pública, renderizar children sin resolver tenant
    if (isPublicRoute) {
      console.log('[TenantResolver] Ruta pública detectada:', location.pathname);
      setResolving(false);
      return;
    }
    
    // Esperar a que auth termine de cargar antes de resolver tenant
    if (authLoading) {
      return;
    }
    
    resolveTenant();
  }, [location.pathname, isPublicRoute, authLoading, isAuthenticated, user]);

  /**
   * Intenta resolver el tenant automáticamente
   */
  const resolveTenant = async () => {
    try {
      setResolving(true);
      setError(null);

      // PRIORIDAD 1: Si el usuario está autenticado, usar su tenantId
      if (isAuthenticated && user?.tenantId) {
        console.log('[TenantResolver] Usuario autenticado detectado, usando tenantId del usuario:', user.tenantId);
        
        // Si el tenant actual ya es el del usuario, no hacer nada
        if (currentTenant?.id === user.tenantId) {
          console.log('[TenantResolver] Tenant del usuario ya está cargado');
          setResolving(false);
          return;
        }
        
        // Cargar tenant del usuario
        const slug = user.tenantId.replace('tenant-', '');
        const loaded = await loadTenantBySlug(slug);
        if (loaded) {
          // Guardar en localStorage para persistencia
          localStorage.setItem('current-tenant-id', user.tenantId);
          console.log('[TenantResolver] Tenant del usuario cargado y guardado en localStorage');
          return;
        }
        // Si falla, continuar con otros métodos
        console.warn('[TenantResolver] No se pudo cargar tenant del usuario, continuando...');
      }

      // PRIORIDAD 2: Intentar desde query param (tiene prioridad sobre subdomain)
      // Esto permite usar ?tenant=xxx incluso en app.kainet.mx
      const queryTenant = getQueryParam('tenant');
      if (queryTenant) {
        console.log('[TenantResolver] Detectado query param tenant:', queryTenant);
        const loaded = await loadTenantBySlug(queryTenant);
        if (loaded) {
          return; // Tenant cargado exitosamente
        }
        // Si falla, continuar con otros métodos
        console.warn('[TenantResolver] No se pudo cargar tenant del query param, continuando...');
      }

      // PRIORIDAD 3: Intentar desde subdomain (producción)
      // IMPORTANTE: getSubdomain() ya filtra subdomains de infraestructura (app, api, etc.)
      const subdomain = getSubdomain();
      if (subdomain) {
        console.log('[TenantResolver] Detectado subdomain:', subdomain);
        const loaded = await loadTenantBySlug(subdomain);
        if (loaded) {
          return; // Tenant cargado exitosamente
        }
        // Si falla, continuar con otros métodos
        console.warn('[TenantResolver] No se pudo cargar tenant del subdomain, continuando...');
      } else {
        // Si getSubdomain() retorna null, no intentar cargar tenant (subdomain es de infraestructura)
        console.log('[TenantResolver] Subdomain ignorado (infraestructura) o no detectado');
      }

      // PRIORIDAD 4: Intentar desde localStorage
      const savedTenantId = localStorage.getItem('current-tenant-id');
      if (savedTenantId && currentTenant?.id === savedTenantId) {
        console.log('[TenantResolver] Usando tenant de localStorage:', savedTenantId);
        setResolving(false);
        return;
      }

      // PRIORIDAD 5: Si hay tenant guardado pero no está cargado, guardarlo para mostrar opción
      if (savedTenantId) {
        console.log('[TenantResolver] Tenant guardado encontrado:', savedTenantId);
        setSavedTenantId(savedTenantId);
      }

      // PRIORIDAD 6: No se pudo resolver automáticamente → mostrar selector
      // Solo mostrar selector si el usuario NO está autenticado
      if (!isAuthenticated) {
        console.log('[TenantResolver] Usuario no autenticado y no se detectó tenant, mostrando selector...');
        await loadAvailableTenants();
        setShowSelector(true);
        setResolving(false);
      } else {
        // Si está autenticado pero no se pudo cargar el tenant, hay un error
        console.error('[TenantResolver] Usuario autenticado pero no se pudo cargar tenant');
        setError('No se pudo cargar la organización. Por favor, intenta de nuevo.');
        setResolving(false);
      }
    } catch (err) {
      console.error('[TenantResolver] Error:', err);
      setError('Error al cargar la configuración. Por favor, intenta de nuevo.');
      if (!isAuthenticated) {
        await loadAvailableTenants();
        setShowSelector(true);
      }
      setResolving(false);
    }
  };

  /**
   * Extrae subdomain del hostname
   * Ejemplos:
   * - kainet.lms.kainet.mx → "kainet"
   * - demo.lms.kainet.mx → "demo"
   * - localhost → null
   * - app.kainet.mx → null (dominio de la aplicación, no tenant)
   * - api.kainet.mx → null (dominio de la API, no tenant)
   * - Azure Container Apps → null (ca-accesslearn-frontend-prod.gentlerock...azurecontainerapps.io)
   */
  const getSubdomain = (): string | null => {
    const hostname = window.location.hostname;

    // Desarrollo local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return null;
    }

    // Azure Container Apps (ignorar estos hostnames)
    if (hostname.includes('azurecontainerapps.io') || hostname.includes('gentlerock')) {
      return null;
    }

    // Producción: extraer primer segmento
    // kainet.lms.kainet.mx → ["kainet", "lms", "kainet", "mx"]
    const parts = hostname.split('.');

    // Si tiene al menos 3 partes (subdomain.domain.tld) y no es Azure
    if (parts.length >= 3 && !parts[0].startsWith('ca-')) {
      const subdomain = parts[0];

      // Ignorar subdominios de infraestructura/aplicación (no son tenants)
      const infrastructureSubdomains = ['app', 'api', 'www', 'admin', 'dashboard', 'portal'];
      if (infrastructureSubdomains.includes(subdomain.toLowerCase())) {
        return null;
      }

      return subdomain;
    }

    return null;
  };

  /**
   * Obtiene parámetro de query string
   */
  const getQueryParam = (param: string): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  /**
   * Carga tenant por slug y lo establece como actual
   * Retorna true si se cargó exitosamente, false si falló
   */
  const loadTenantBySlug = async (slug: string): Promise<boolean> => {
    try {
      const tenant = await ApiService.getTenantBySlug(slug);

      if (!tenant) {
        console.warn(`[TenantResolver] Tenant "${slug}" no encontrado`);
        return false;
      }

      console.log('[TenantResolver] Tenant encontrado:', tenant);
      setCurrentTenant(tenant);
      setResolving(false);
      return true;
    } catch (err) {
      console.error('[TenantResolver] Error cargando tenant:', err);
      return false;
    }
  };

  /**
   * Carga lista de tenants disponibles para el selector
   */
  const loadAvailableTenants = async () => {
    try {
      console.log('[TenantResolver] Cargando lista de tenants disponibles...');
      const tenants = await ApiService.listTenants();
      console.log('[TenantResolver] Tenants obtenidos del API:', tenants);

      const mappedTenants = tenants.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
      }));

      console.log('[TenantResolver] Tenants mapeados:', mappedTenants);
      setAvailableTenants(mappedTenants);

      if (mappedTenants.length === 0) {
        console.warn('[TenantResolver] No se encontraron tenants, usando fallback');
        // Fallback a tenants hardcoded para desarrollo
        setAvailableTenants([
          { id: 'tenant-demo', name: 'Empresa Demo', slug: 'demo' },
          { id: 'tenant-kainet', name: 'Kainet', slug: 'kainet' },
          { id: 'tenant-socia', name: 'Socia Partner', slug: 'socia' },
        ]);
      }
    } catch (err: any) {
      console.error('[TenantResolver] Error cargando tenants:', err);
      console.error('[TenantResolver] Error details:', err.message, err.stack);
      // Fallback a tenants hardcoded para desarrollo
      setAvailableTenants([
        { id: 'tenant-demo', name: 'Empresa Demo', slug: 'demo' },
        { id: 'tenant-kainet', name: 'Kainet', slug: 'kainet' },
        { id: 'tenant-socia', name: 'Socia Partner', slug: 'socia' },
      ]);
    }
  };

  /**
   * Maneja selección manual de tenant
   */
  const handleTenantSelect = async (tenantId: string) => {
    console.log('[TenantResolver] handleTenantSelect llamado con tenantId:', tenantId);

    const selected = availableTenants.find(t => t.id === tenantId);
    if (!selected) {
      console.error('[TenantResolver] Tenant no encontrado en availableTenants:', tenantId);
      console.log('[TenantResolver] Available tenants:', availableTenants);
      setError(`Organización "${tenantId}" no encontrada. Por favor, intenta de nuevo.`);
      return;
    }

    console.log('[TenantResolver] Tenant seleccionado:', selected);

    try {
      setResolving(true);
      setError(null);

      // Intentar cargar el tenant directamente primero
      console.log('[TenantResolver] Intentando cargar tenant por slug:', selected.slug);
      const loaded = await loadTenantBySlug(selected.slug);

      if (loaded) {
        console.log('[TenantResolver] Tenant cargado exitosamente');
        // Si se carga exitosamente, guardar en localStorage para futuras visitas
        localStorage.setItem('current-tenant-id', selected.id);
        // Asegurar que showSelector se oculte
        setShowSelector(false);
      } else {
        console.warn('[TenantResolver] No se pudo cargar tenant, usando redirección con query param');
        // Si falla, redirigir con query param como fallback
        window.location.href = `${window.location.origin}/?tenant=${selected.slug}`;
      }
    } catch (err: any) {
      console.error('[TenantResolver] Error en handleTenantSelect:', err);
      setError(err.message || 'Error al cargar la organización. Por favor, intenta de nuevo.');
      setResolving(false);
      // Intentar redirigir con query param como último recurso
      setTimeout(() => {
        window.location.href = `${window.location.origin}/?tenant=${selected.slug}`;
      }, 2000);
    }
  };

  // Si es una ruta pública, renderizar children sin requerir tenant
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Loading state
  if (resolving || tenantLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50">
        <div className="text-center space-y-4">
          <CircleNotch className="w-12 h-12 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
          <p className="text-lg text-foreground">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !showSelector) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50">
        <div className="bg-card rounded-xl shadow-xl p-8 max-w-md text-center space-y-4 border border-border">
          <WarningCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto" weight="fill" />
          <h2 className="text-2xl font-bold text-foreground">Error de Configuración</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={resolveTenant} className="w-full">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Selector manual
  if (showSelector) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCA0YzEuMTA1IDAgMiAuODk1IDIgMnMtLjg5NSAyLTIgMi0yLS44OTUtMi0yIC44OTUtMiAyLTJ6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>

        <div className="relative bg-card rounded-2xl shadow-2xl p-10 max-w-lg w-full mx-4 space-y-8 border border-border">
          {/* Logout button in top-right */}
          <div className="absolute top-4 right-4">
            <Button
              onClick={() => {
                // Limpiar todo y redirigir
                localStorage.clear();
                window.location.href = '/';
              }}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <SignOut size={18} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>

          {/* Logo y header - Diseño moderno */}
          <div className="text-center space-y-6 mb-8">
            {/* Logo único - siempre mostrar Kaido en selector */}
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src="/logos/kaido-logo.png" 
                  alt="Kaido" 
                  className="h-24 w-auto object-contain drop-shadow-lg"
                  onError={(e) => {
                    // Si falla, ocultar y mostrar fallback
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium tracking-wide">
                Plataforma de Capacitación y Desarrollo
              </p>
            </div>
          </div>

          {/* Divider moderno */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-card/95 text-sm font-medium text-muted-foreground tracking-wide">Selecciona tu organización</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start space-x-3">
              <WarningCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" weight="fill" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Continue with saved tenant option - diseño moderno */}
            {savedTenantId && availableTenants.find(t => t.id === savedTenantId) && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong className="font-semibold">Última organización utilizada:</strong>
                    <br />
                    <span className="text-blue-700 dark:text-blue-300 font-medium">{availableTenants.find(t => t.id === savedTenantId)?.name}</span>
                  </p>
                </div>
                <Button
                  onClick={() => handleTenantSelect(savedTenantId)}
                  className="w-full h-14 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600"
                  variant="default"
                >
                  Continuar con {availableTenants.find(t => t.id === savedTenantId)?.name}
                </Button>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-card/95 text-xs font-medium text-muted-foreground">o selecciona otra organización</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Organización
              </label>
              <Select
                value={availableTenants.find(t => t.id === localStorage.getItem('current-tenant-id'))?.id || ''}
                onValueChange={(value) => {
                  console.log('[TenantResolver] Select onValueChange triggered with value:', value);
                  handleTenantSelect(value);
                }}
              >
                <SelectTrigger className="w-full h-12 border-border focus:ring-2 focus:ring-primary">
                  <SelectValue placeholder="Selecciona tu organización..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTenants.length > 0 ? (
                    availableTenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id} className="py-3">
                        <div className="flex items-center space-x-3">
                          <Buildings className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{tenant.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center space-x-3">
                        <CircleNotch className="w-5 h-5 text-muted-foreground animate-spin" />
                        <span className="font-medium">Cargando organizaciones...</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong className="font-semibold">¿No encuentras tu organización?</strong>
                <br />
                Contacta a tu administrador para obtener acceso.
              </p>
            </div>
          </div>

          {/* Footer - Kainet branding */}
          <div className="pt-6 border-t border-border">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <span className="text-sm">Desarrollado por</span>
              <img 
                src="/logos/kainet-logo.png" 
                alt="Kainet" 
                className="h-4 w-auto object-contain"
                onError={(e) => {
                  // Si no existe la imagen, mostrar texto
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'inline';
                }}
              />
              <span className="text-sm font-semibold text-primary hidden">Kainet</span>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              © {new Date().getFullYear()} Kainet. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tenant resuelto → renderizar app
  return <>{children}</>;
}
