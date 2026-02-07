/**
 * Platform Settings
 * Global configuration panel for the platform
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Settings,
  Globe,
  Mail,
  Shield,
  Palette,
  Bell,
  Database,
  Key,
  Save,
  RefreshCcw,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Info,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  platformAdminApi, 
  PlatformSettings as ApiPlatformSettings 
} from '@/services/platform-admin.api';

// Types
interface LocalPlatformSettings {
  general: {
    platformName: string;
    supportEmail: string;
    defaultLanguage: string;
    timezone: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  security: {
    mfaRequired: boolean;
    sessionTimeout: number;
    passwordMinLength: number;
    passwordRequireSpecial: boolean;
    maxLoginAttempts: number;
    ipWhitelist: string[];
  };
  email: {
    provider: string;
    fromEmail: string;
    fromName: string;
    replyTo: string;
    enableNotifications: boolean;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    customCss: string;
  };
  features: {
    enableAnalytics: boolean;
    enableGamification: boolean;
    enableCertificates: boolean;
    enableMentorship: boolean;
    enableForums: boolean;
    enableMobileApp: boolean;
  };
  integrations: {
    applicationInsightsKey: string;
    googleAnalyticsId: string;
    azureAdTenantId: string;
    stripeApiKey: string;
  };
}

const DEFAULT_SETTINGS: LocalPlatformSettings = {
  general: {
    platformName: 'Kainet LMS',
    supportEmail: 'soporte@kainet.mx',
    defaultLanguage: 'es',
    timezone: 'America/Mexico_City',
    maintenanceMode: false,
    maintenanceMessage: 'El sistema está en mantenimiento. Volveremos pronto.',
  },
  security: {
    mfaRequired: false,
    sessionTimeout: 480,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    maxLoginAttempts: 5,
    ipWhitelist: [],
  },
  email: {
    provider: 'sendgrid',
    fromEmail: 'no-reply@kainet.mx',
    fromName: 'Kainet LMS',
    replyTo: 'soporte@kainet.mx',
    enableNotifications: true,
  },
  branding: {
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    logoUrl: '',
    faviconUrl: '',
    customCss: '',
  },
  features: {
    enableAnalytics: true,
    enableGamification: true,
    enableCertificates: true,
    enableMentorship: true,
    enableForums: false,
    enableMobileApp: false,
  },
  integrations: {
    applicationInsightsKey: '',
    googleAnalyticsId: '',
    azureAdTenantId: '',
    stripeApiKey: '',
  },
};

const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
];

const TIMEZONES = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
];

export default function PlatformSettings() {
  const [settings, setSettings] = useState<LocalPlatformSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      const apiSettings = await platformAdminApi.getSettings();
      // Map API settings to local format
      setSettings(prev => ({
        ...prev,
        general: {
          ...prev.general,
          platformName: apiSettings.platformName,
          supportEmail: apiSettings.supportEmail,
          defaultLanguage: apiSettings.defaultLanguage,
          maintenanceMode: apiSettings.maintenanceMode,
        },
        security: {
          ...prev.security,
          mfaRequired: apiSettings.security.requireMfa,
          sessionTimeout: apiSettings.security.sessionTimeout,
          passwordMinLength: apiSettings.security.passwordMinLength,
          maxLoginAttempts: apiSettings.security.maxLoginAttempts,
        },
        email: {
          ...prev.email,
          provider: apiSettings.email.provider,
          fromEmail: apiSettings.email.fromEmail,
          fromName: apiSettings.email.fromName,
        },
        branding: {
          ...prev.branding,
          primaryColor: apiSettings.branding.primaryColor,
          secondaryColor: apiSettings.branding.secondaryColor,
          logoUrl: apiSettings.branding.logoUrl || '',
        },
        features: {
          ...prev.features,
          enableAnalytics: apiSettings.features.analytics,
          enableGamification: apiSettings.features.gamification,
          enableCertificates: apiSettings.features.certificates,
          enableMentorship: apiSettings.features.mentorship,
          enableForums: apiSettings.features.forums,
        },
      }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = <K extends keyof LocalPlatformSettings>(
    section: K,
    field: keyof LocalPlatformSettings[K],
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Map local settings to API format
      const apiSettings: Partial<ApiPlatformSettings> = {
        platformName: settings.general.platformName,
        supportEmail: settings.general.supportEmail,
        maintenanceMode: settings.general.maintenanceMode,
        defaultLanguage: settings.general.defaultLanguage,
        security: {
          requireMfa: settings.security.mfaRequired,
          sessionTimeout: settings.security.sessionTimeout,
          maxLoginAttempts: settings.security.maxLoginAttempts,
          passwordMinLength: settings.security.passwordMinLength,
        },
        email: {
          provider: settings.email.provider,
          fromEmail: settings.email.fromEmail,
          fromName: settings.email.fromName,
        },
        branding: {
          primaryColor: settings.branding.primaryColor,
          secondaryColor: settings.branding.secondaryColor,
          logoUrl: settings.branding.logoUrl || undefined,
        },
        features: {
          gamification: settings.features.enableGamification,
          mentorship: settings.features.enableMentorship,
          certificates: settings.features.enableCertificates,
          forums: settings.features.enableForums,
          analytics: settings.features.enableAnalytics,
        },
      };
      await platformAdminApi.updateSettings(apiSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-96" />
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
            <Settings className="h-7 w-7 text-indigo-500" />
            Configuración de Plataforma
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Ajustes globales que afectan a toda la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Guardado
            </Badge>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Maintenance Mode Alert */}
      {settings.general.maintenanceMode && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Modo mantenimiento activo.</strong> Los usuarios no podrán acceder a la plataforma.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Integraciones
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Información básica y configuración regional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de la Plataforma</Label>
                  <Input
                    value={settings.general.platformName}
                    onChange={e => updateSettings('general', 'platformName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email de Soporte</Label>
                  <Input
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={e => updateSettings('general', 'supportEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Idioma por Defecto</Label>
                  <select
                    value={settings.general.defaultLanguage}
                    onChange={e => updateSettings('general', 'defaultLanguage', e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Zona Horaria</Label>
                  <select
                    value={settings.general.timezone}
                    onChange={e => updateSettings('general', 'timezone', e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Modo Mantenimiento</Label>
                    <p className="text-sm text-gray-500">
                      Bloquea el acceso a usuarios mientras realizas actualizaciones
                    </p>
                  </div>
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onCheckedChange={checked => updateSettings('general', 'maintenanceMode', checked)}
                  />
                </div>
                {settings.general.maintenanceMode && (
                  <div className="mt-4 space-y-2">
                    <Label>Mensaje de Mantenimiento</Label>
                    <Textarea
                      value={settings.general.maintenanceMessage}
                      onChange={e => updateSettings('general', 'maintenanceMessage', e.target.value)}
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>
                Políticas de autenticación y acceso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Autenticación de Dos Factores</Label>
                  <p className="text-sm text-gray-500">
                    Requiere MFA para todos los administradores
                  </p>
                </div>
                <Switch
                  checked={settings.security.mfaRequired}
                  onCheckedChange={checked => updateSettings('security', 'mfaRequired', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tiempo de Sesión (minutos)</Label>
                  <Input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={e => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Intentos de Login Máximos</Label>
                  <Input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={e => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitud Mínima de Contraseña</Label>
                  <Input
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={e => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between pt-6">
                  <Label>Requerir Caracteres Especiales</Label>
                  <Switch
                    checked={settings.security.passwordRequireSpecial}
                    onCheckedChange={checked => updateSettings('security', 'passwordRequireSpecial', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Email</CardTitle>
              <CardDescription>
                Proveedor y opciones de correo electrónico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Proveedor</Label>
                  <select
                    value={settings.email.provider}
                    onChange={e => updateSettings('email', 'provider', e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                  >
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="ses">Amazon SES</option>
                    <option value="smtp">SMTP</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Email de Envío</Label>
                  <Input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={e => updateSettings('email', 'fromEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nombre de Envío</Label>
                  <Input
                    value={settings.email.fromName}
                    onChange={e => updateSettings('email', 'fromName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reply-To</Label>
                  <Input
                    type="email"
                    value={settings.email.replyTo}
                    onChange={e => updateSettings('email', 'replyTo', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Notificaciones por Email</Label>
                  <p className="text-sm text-gray-500">
                    Enviar emails de notificación a usuarios
                  </p>
                </div>
                <Switch
                  checked={settings.email.enableNotifications}
                  onCheckedChange={checked => updateSettings('email', 'enableNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Personalización de Marca</CardTitle>
              <CardDescription>
                Colores y logos por defecto de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label className="w-32">Color Primario</Label>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="color"
                        value={settings.branding.primaryColor}
                        onChange={e => updateSettings('branding', 'primaryColor', e.target.value)}
                        className="h-10 w-20 cursor-pointer rounded border"
                      />
                      <Input
                        value={settings.branding.primaryColor}
                        onChange={e => updateSettings('branding', 'primaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Label className="w-32">Color Secundario</Label>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="color"
                        value={settings.branding.secondaryColor}
                        onChange={e => updateSettings('branding', 'secondaryColor', e.target.value)}
                        className="h-10 w-20 cursor-pointer rounded border"
                      />
                      <Input
                        value={settings.branding.secondaryColor}
                        onChange={e => updateSettings('branding', 'secondaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div 
                  className="rounded-lg p-6 text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${settings.branding.primaryColor}, ${settings.branding.secondaryColor})` 
                  }}
                >
                  <p className="font-bold text-lg">{settings.general.platformName}</p>
                  <p className="text-sm opacity-80">Vista previa de colores</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL del Logo</Label>
                  <Input
                    value={settings.branding.logoUrl}
                    onChange={e => updateSettings('branding', 'logoUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL del Favicon</Label>
                  <Input
                    value={settings.branding.faviconUrl}
                    onChange={e => updateSettings('branding', 'faviconUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>CSS Personalizado</Label>
                <Textarea
                  value={settings.branding.customCss}
                  onChange={e => updateSettings('branding', 'customCss', e.target.value)}
                  placeholder="/* CSS personalizado para la plataforma */"
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades</CardTitle>
              <CardDescription>
                Habilita o deshabilita módulos de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: 'enableAnalytics', label: 'Analytics', desc: 'Métricas y reportes de uso' },
                  { key: 'enableGamification', label: 'Gamificación', desc: 'Puntos, insignias y rankings' },
                  { key: 'enableCertificates', label: 'Certificados', desc: 'Emisión de certificados de completación' },
                  { key: 'enableMentorship', label: 'Mentoría', desc: 'Sistema de mentores y sesiones' },
                  { key: 'enableForums', label: 'Foros', desc: 'Foros de discusión por curso' },
                  { key: 'enableMobileApp', label: 'App Móvil', desc: 'Acceso desde aplicación móvil' },
                ].map(feature => (
                  <div key={feature.key} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <Label className="text-base">{feature.label}</Label>
                      <p className="text-sm text-gray-500">{feature.desc}</p>
                    </div>
                    <Switch
                      checked={(settings.features as any)[feature.key]}
                      onCheckedChange={checked => updateSettings('features', feature.key as any, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integraciones</CardTitle>
              <CardDescription>
                Claves de API y conexiones externas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Las claves de API se almacenan de forma segura y solo se muestran parcialmente.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Application Insights Key</Label>
                    <a href="https://portal.azure.com" target="_blank" className="text-xs text-indigo-600 flex items-center gap-1">
                      Configurar en Azure <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <Input
                    type="password"
                    value={settings.integrations.applicationInsightsKey}
                    onChange={e => updateSettings('integrations', 'applicationInsightsKey', e.target.value)}
                    placeholder="InstrumentationKey=..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Google Analytics ID</Label>
                  <Input
                    value={settings.integrations.googleAnalyticsId}
                    onChange={e => updateSettings('integrations', 'googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Azure AD Tenant ID</Label>
                    <a href="https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview" target="_blank" className="text-xs text-indigo-600 flex items-center gap-1">
                      Ver en Azure AD <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <Input
                    value={settings.integrations.azureAdTenantId}
                    onChange={e => updateSettings('integrations', 'azureAdTenantId', e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Stripe API Key</Label>
                    <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="text-xs text-indigo-600 flex items-center gap-1">
                      Dashboard de Stripe <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <Input
                    type="password"
                    value={settings.integrations.stripeApiKey}
                    onChange={e => updateSettings('integrations', 'stripeApiKey', e.target.value)}
                    placeholder="sk_live_..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
