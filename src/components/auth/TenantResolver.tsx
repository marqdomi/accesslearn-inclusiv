import { useEffect, useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
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

interface TenantResolverProps {
  children: React.ReactNode;
}

/**
 * TenantResolver: Detecta y resuelve el tenant actual
 * 
 * Estrategia de resolución:
 * 1. Subdomain (producción): kainet.lms.kainet.mx → tenant: kainet
 * 2. Query param (desarrollo): localhost:5001?tenant=kainet → tenant: kainet
 * 3. localStorage: Última selección del usuario
 * 4. Selector manual: Usuario elige de lista
 * 
 * Solo renderiza children cuando el tenant está confirmado.
 */
export function TenantResolver({ children }: TenantResolverProps) {
  const { currentTenant, setCurrentTenant, clearTenant, isLoading: tenantLoading } = useTenant();
  const [resolving, setResolving] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Array<{
    id: string;
    name: string;
    slug: string;
  }>>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [savedTenantId, setSavedTenantId] = useState<string | null>(null);

  useEffect(() => {
    resolveTenant();
  }, []);

  /**
   * Intenta resolver el tenant automáticamente
   */
  const resolveTenant = async () => {
    try {
      setResolving(true);
      setError(null);

      // 1. Intentar desde query param PRIMERO (tiene prioridad sobre subdomain)
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

      // 2. Intentar desde subdomain (producción)
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

      // 3. Intentar desde localStorage
      const savedTenantId = localStorage.getItem('current-tenant-id');
      if (savedTenantId && currentTenant?.id === savedTenantId) {
        console.log('[TenantResolver] Usando tenant de localStorage:', savedTenantId);
        setResolving(false);
        return;
      }

      // 4. Si hay tenant guardado pero no está cargado, guardarlo para mostrar opción
      if (savedTenantId) {
        console.log('[TenantResolver] Tenant guardado encontrado:', savedTenantId);
        setSavedTenantId(savedTenantId);
      }

      // 5. No se pudo resolver automáticamente → mostrar selector
      console.log('[TenantResolver] No se detectó tenant, mostrando selector...');
      await loadAvailableTenants();
      setShowSelector(true);
      setResolving(false);
    } catch (err) {
      console.error('[TenantResolver] Error:', err);
      setError('Error al cargar la configuración. Por favor, intenta de nuevo.');
      await loadAvailableTenants();
      setShowSelector(true);
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

  // Loading state
  if (resolving || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <CircleNotch className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <p className="text-lg text-gray-700">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !showSelector) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center space-y-4">
          <WarningCircle className="w-16 h-16 text-red-600 mx-auto" weight="fill" />
          <h2 className="text-2xl font-bold text-gray-900">Error de Configuración</h2>
          <p className="text-gray-600">{error}</p>
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

        <div className="relative bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full mx-4 space-y-8">
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
              className="gap-2 text-gray-600 hover:text-gray-900"
            >
              <SignOut size={18} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>

          {/* Logo y header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <span className="text-4xl">📚</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                AccessLearn
              </h1>
              <p className="text-sm text-blue-600 font-medium">
                Plataforma de Capacitación y Desarrollo
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Selecciona tu organización</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <WarningCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" weight="fill" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Continue with saved tenant option */}
            {savedTenantId && availableTenants.find(t => t.id === savedTenantId) && (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong className="font-semibold">Última organización utilizada:</strong>
                    <br />
                    {availableTenants.find(t => t.id === savedTenantId)?.name}
                  </p>
                </div>
                <Button
                  onClick={() => handleTenantSelect(savedTenantId)}
                  className="w-full h-12"
                  variant="default"
                >
                  Continuar con {availableTenants.find(t => t.id === savedTenantId)?.name}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">o selecciona otra organización</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Organización
              </label>
              <Select
                value={availableTenants.find(t => t.id === localStorage.getItem('current-tenant-id'))?.id || ''}
                onValueChange={(value) => {
                  console.log('[TenantResolver] Select onValueChange triggered with value:', value);
                  handleTenantSelect(value);
                }}
              >
                <SelectTrigger className="w-full h-12 border-gray-300 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Selecciona tu organización..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTenants.length > 0 ? (
                    availableTenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id} className="py-3">
                        <div className="flex items-center space-x-3">
                          <Buildings className="w-5 h-5 text-gray-400" />
                          <span className="font-medium">{tenant.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center space-x-3">
                        <CircleNotch className="w-5 h-5 text-gray-400 animate-spin" />
                        <span className="font-medium">Cargando organizaciones...</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Help text */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <strong className="font-semibold">💡 ¿No encuentras tu organización?</strong>
                <br />
                Contacta a tu administrador para obtener acceso.
              </p>
            </div>
          </div>

          {/* Footer - Kainet branding */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <span className="text-sm">Desarrollado por</span>
              <span className="text-sm font-semibold text-blue-600">Kainet</span>
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
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
