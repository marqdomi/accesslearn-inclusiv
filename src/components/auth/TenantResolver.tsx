import { useEffect, useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { ApiService } from '@/services/api.service';
import { Loader2, Building2, AlertCircle } from '@phosphor-icons/react';
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
  const { currentTenant, setCurrentTenant, isLoading: tenantLoading } = useTenant();
  const [resolving, setResolving] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Array<{
    id: string;
    name: string;
    slug: string;
  }>>([]);
  const [showSelector, setShowSelector] = useState(false);

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

      // 1. Intentar desde subdomain (producción)
      const subdomain = getSubdomain();
      if (subdomain) {
        console.log('[TenantResolver] Detectado subdomain:', subdomain);
        await loadTenantBySlug(subdomain);
        return;
      }

      // 2. Intentar desde query param (desarrollo)
      const queryTenant = getQueryParam('tenant');
      if (queryTenant) {
        console.log('[TenantResolver] Detectado query param tenant:', queryTenant);
        await loadTenantBySlug(queryTenant);
        return;
      }

      // 3. Intentar desde localStorage
      const savedTenantId = localStorage.getItem('current-tenant-id');
      if (savedTenantId && currentTenant?.id === savedTenantId) {
        console.log('[TenantResolver] Usando tenant de localStorage:', savedTenantId);
        setResolving(false);
        return;
      }

      // 4. No se pudo resolver automáticamente → mostrar selector
      console.log('[TenantResolver] No se detectó tenant, mostrando selector...');
      await loadAvailableTenants();
      setShowSelector(true);
      setResolving(false);
    } catch (err) {
      console.error('[TenantResolver] Error:', err);
      setError('Error al cargar la configuración. Por favor, intenta de nuevo.');
      setResolving(false);
    }
  };

  /**
   * Extrae subdomain del hostname
   * Ejemplos:
   * - kainet.lms.kainet.mx → "kainet"
   * - demo.lms.kainet.mx → "demo"
   * - localhost → null
   */
  const getSubdomain = (): string | null => {
    const hostname = window.location.hostname;
    
    // Desarrollo local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return null;
    }

    // Producción: extraer primer segmento
    // kainet.lms.kainet.mx → ["kainet", "lms", "kainet", "mx"]
    const parts = hostname.split('.');
    
    // Si tiene al menos 3 partes (subdomain.domain.tld)
    if (parts.length >= 3) {
      return parts[0];
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
   */
  const loadTenantBySlug = async (slug: string) => {
    try {
      const tenant = await ApiService.getTenantBySlug(slug);
      
      if (!tenant) {
        setError(`No se encontró la organización "${slug}". Verifica la URL.`);
        await loadAvailableTenants();
        setShowSelector(true);
        setResolving(false);
        return;
      }

      console.log('[TenantResolver] Tenant encontrado:', tenant);
      setCurrentTenant(tenant);
      setResolving(false);
    } catch (err) {
      console.error('[TenantResolver] Error cargando tenant:', err);
      setError(`No se pudo cargar la organización "${slug}".`);
      await loadAvailableTenants();
      setShowSelector(true);
      setResolving(false);
    }
  };

  /**
   * Carga lista de tenants disponibles para el selector
   */
  const loadAvailableTenants = async () => {
    try {
      const tenants = await ApiService.listTenants();
      setAvailableTenants(tenants.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
      })));
    } catch (err) {
      console.error('[TenantResolver] Error cargando tenants:', err);
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
    const selected = availableTenants.find(t => t.id === tenantId);
    if (!selected) return;

    try {
      setResolving(true);
      setError(null);
      await loadTenantBySlug(selected.slug);
    } catch (err) {
      setError('Error al cargar la organización seleccionada.');
      setResolving(false);
    }
  };

  // Loading state
  if (resolving || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
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
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <Building2 className="w-16 h-16 text-blue-600 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">
              Selecciona tu Organización
            </h2>
            <p className="text-gray-600">
              Elige la empresa u organización a la que quieres acceder
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Select onValueChange={handleTenantSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una organización" />
              </SelectTrigger>
              <SelectContent>
                {availableTenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                💡 <strong>Tip de desarrollo:</strong> Usa{' '}
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  ?tenant=kainet
                </code>{' '}
                en la URL
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tenant resuelto → renderizar app
  return <>{children}</>;
}
