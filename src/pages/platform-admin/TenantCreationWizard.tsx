/**
 * Tenant Creation Wizard
 * Multi-step form for creating new tenants with validation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  CreditCard, 
  Palette, 
  UserPlus, 
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApiService } from '@/services/api.service';

// Types
interface TenantFormData {
  // Step 1: Basic Info
  name: string;
  slug: string;
  description: string;
  industry: string;
  website: string;
  
  // Step 2: Plan Selection
  plan: 'starter' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  
  // Step 3: Branding
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  
  // Step 4: Admin User
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPassword: string;
  sendWelcomeEmail: boolean;
}

interface PlanOption {
  id: 'starter' | 'professional' | 'enterprise';
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  maxUsers: number;
  maxCourses: number;
  highlighted?: boolean;
}

const PLANS: PlanOption[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para equipos pequeños comenzando',
    priceMonthly: 49,
    priceAnnual: 470,
    maxUsers: 50,
    maxCourses: 10,
    features: [
      'Hasta 50 usuarios',
      '10 cursos',
      'Soporte por email',
      'Reportes básicos',
      'Certificados personalizados',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Para empresas en crecimiento',
    priceMonthly: 149,
    priceAnnual: 1430,
    maxUsers: 250,
    maxCourses: 50,
    highlighted: true,
    features: [
      'Hasta 250 usuarios',
      '50 cursos',
      'Soporte prioritario',
      'Analytics avanzados',
      'API access',
      'SSO / SAML',
      'Branding personalizado',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes organizaciones',
    priceMonthly: 399,
    priceAnnual: 3830,
    maxUsers: -1, // Unlimited
    maxCourses: -1,
    features: [
      'Usuarios ilimitados',
      'Cursos ilimitados',
      'Soporte dedicado 24/7',
      'Analytics en tiempo real',
      'API completa',
      'SSO / SAML / SCIM',
      'Ambiente dedicado',
      'SLA garantizado',
    ],
  },
];

const INDUSTRIES = [
  'Tecnología',
  'Finanzas',
  'Salud',
  'Educación',
  'Retail',
  'Manufactura',
  'Gobierno',
  'Sin fines de lucro',
  'Otro',
];

const STEPS = [
  { id: 1, name: 'Información', icon: Building2 },
  { id: 2, name: 'Plan', icon: CreditCard },
  { id: 3, name: 'Branding', icon: Palette },
  { id: 4, name: 'Administrador', icon: UserPlus },
  { id: 5, name: 'Revisión', icon: CheckCircle2 },
];

export default function TenantCreationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    slug: '',
    description: '',
    industry: '',
    website: '',
    plan: 'professional',
    billingCycle: 'monthly',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    logoUrl: '',
    faviconUrl: '',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    adminPassword: '',
    sendWelcomeEmail: true,
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const updateField = (field: keyof TenantFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug when name changes
      if (field === 'name' && !prev.slug) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) errors.name = 'El nombre es requerido';
        if (!formData.slug.trim()) errors.slug = 'El slug es requerido';
        else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
          errors.slug = 'Solo letras minúsculas, números y guiones';
        }
        if (!formData.industry) errors.industry = 'Selecciona una industria';
        break;
      case 2:
        // Plan is always selected
        break;
      case 3:
        // Branding is optional
        break;
      case 4:
        if (!formData.adminEmail.trim()) errors.adminEmail = 'El email es requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
          errors.adminEmail = 'Email inválido';
        }
        if (!formData.adminFirstName.trim()) errors.adminFirstName = 'El nombre es requerido';
        if (!formData.adminLastName.trim()) errors.adminLastName = 'El apellido es requerido';
        if (!formData.adminPassword) errors.adminPassword = 'La contraseña es requerida';
        else if (formData.adminPassword.length < 8) {
          errors.adminPassword = 'Mínimo 8 caracteres';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Map form plan values to API expected values
      const planMap: Record<string, 'demo' | 'profesional' | 'enterprise'> = {
        'starter': 'demo',
        'professional': 'profesional',
        'enterprise': 'enterprise',
      };

      const tenantData = {
        name: formData.name,
        slug: formData.slug,
        contactEmail: formData.adminEmail, // Use admin email as contact email
        plan: planMap[formData.plan] || 'profesional',
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        logo: formData.logoUrl || undefined,
      };

      await ApiService.createPlatformTenant(tenantData);
      navigate('/platform-admin/tenants', { 
        state: { message: `Tenant "${formData.name}" creado exitosamente` } 
      });
    } catch (err: any) {
      setError(err.message || 'Error al crear el tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlan = PLANS.find(p => p.id === formData.plan)!;
  const price = formData.billingCycle === 'monthly' 
    ? selectedPlan.priceMonthly 
    : selectedPlan.priceAnnual;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Crear Nuevo Tenant
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configura una nueva organización en la plataforma
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/platform-admin/tenants')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
      </div>

      {/* Progress Steps */}
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <li key={step.id} className="relative flex-1">
                <div className="flex items-center">
                  <button
                    onClick={() => isCompleted && setCurrentStep(step.id)}
                    disabled={!isCompleted}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                      isActive && 'border-indigo-600 bg-indigo-600 text-white',
                      isCompleted && 'border-indigo-600 bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700',
                      !isActive && !isCompleted && 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </button>
                  {index < STEPS.length - 1 && (
                    <div 
                      className={cn(
                        'h-0.5 flex-1 mx-2',
                        isCompleted ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      )} 
                    />
                  )}
                </div>
                <span className={cn(
                  'absolute -bottom-6 left-0 text-xs font-medium',
                  isActive || isCompleted ? 'text-indigo-600' : 'text-gray-500'
                )}>
                  {step.name}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="mt-12">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Datos principales del tenant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Organización *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    placeholder="Acme Corporation"
                    className={validationErrors.name ? 'border-red-500' : ''}
                  />
                  {validationErrors.name && (
                    <p className="text-xs text-red-500">{validationErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">app.kainet.mx/</span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={e => updateField('slug', e.target.value.toLowerCase())}
                      placeholder="acme"
                      className={cn('flex-1', validationErrors.slug ? 'border-red-500' : '')}
                    />
                  </div>
                  {validationErrors.slug && (
                    <p className="text-xs text-red-500">{validationErrors.slug}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => updateField('description', e.target.value)}
                  placeholder="Breve descripción de la organización..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industria *</Label>
                  <select
                    id="industry"
                    value={formData.industry}
                    onChange={e => updateField('industry', e.target.value)}
                    className={cn(
                      'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800',
                      validationErrors.industry ? 'border-red-500' : ''
                    )}
                  >
                    <option value="">Seleccionar...</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                  {validationErrors.industry && (
                    <p className="text-xs text-red-500">{validationErrors.industry}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={e => updateField('website', e.target.value)}
                    placeholder="https://www.acme.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Plan Selection */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={cn(
                'text-sm font-medium',
                formData.billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'
              )}>
                Mensual
              </span>
              <button
                onClick={() => updateField('billingCycle', formData.billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  formData.billingCycle === 'annual' ? 'bg-indigo-600' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    formData.billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
              <span className={cn(
                'text-sm font-medium',
                formData.billingCycle === 'annual' ? 'text-gray-900 dark:text-white' : 'text-gray-500'
              )}>
                Anual
                <Badge className="ml-2 bg-green-100 text-green-800">Ahorra 20%</Badge>
              </span>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-3 gap-6">
              {PLANS.map(plan => {
                const isSelected = formData.plan === plan.id;
                const displayPrice = formData.billingCycle === 'monthly' 
                  ? plan.priceMonthly 
                  : Math.round(plan.priceAnnual / 12);
                
                return (
                  <Card 
                    key={plan.id}
                    className={cn(
                      'relative cursor-pointer transition-all hover:shadow-lg',
                      isSelected && 'ring-2 ring-indigo-600',
                      plan.highlighted && 'border-indigo-200 dark:border-indigo-800'
                    )}
                    onClick={() => updateField('plan', plan.id)}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-indigo-600">Más Popular</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {plan.name}
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <span className="text-3xl font-bold">${displayPrice}</span>
                        <span className="text-gray-500">/mes</span>
                        {formData.billingCycle === 'annual' && (
                          <p className="text-xs text-gray-500">
                            ${plan.priceAnnual} facturado anualmente
                          </p>
                        )}
                      </div>
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Branding */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Personalización de Marca</CardTitle>
              <CardDescription>
                Configura los colores y logos del tenant (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Colors */}
                <div className="space-y-4">
                  <h3 className="font-medium">Colores</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="primaryColor" className="w-32">Color Primario</Label>
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="color"
                          id="primaryColor"
                          value={formData.primaryColor}
                          onChange={e => updateField('primaryColor', e.target.value)}
                          className="h-10 w-20 cursor-pointer rounded border"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={e => updateField('primaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="secondaryColor" className="w-32">Color Secundario</Label>
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="color"
                          id="secondaryColor"
                          value={formData.secondaryColor}
                          onChange={e => updateField('secondaryColor', e.target.value)}
                          className="h-10 w-20 cursor-pointer rounded border"
                        />
                        <Input
                          value={formData.secondaryColor}
                          onChange={e => updateField('secondaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h3 className="font-medium">Vista Previa</h3>
                  <div 
                    className="rounded-lg p-6 text-white"
                    style={{ 
                      background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})` 
                    }}
                  >
                    <div className="font-bold text-lg">{formData.name || 'Nombre del Tenant'}</div>
                    <div className="text-sm opacity-80">Portal de Aprendizaje</div>
                    <div className="mt-4 flex gap-2">
                      <button 
                        className="rounded px-3 py-1 text-sm"
                        style={{ backgroundColor: formData.primaryColor }}
                      >
                        Botón Primario
                      </button>
                      <button 
                        className="rounded px-3 py-1 text-sm bg-white/20"
                      >
                        Botón Secundario
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
                      ) : (
                        <Upload className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <Input
                      placeholder="URL del logo..."
                      value={formData.logoUrl}
                      onChange={e => updateField('logoUrl', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                      {formData.faviconUrl ? (
                        <img src={formData.faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
                      ) : (
                        <Upload className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <Input
                      placeholder="URL del favicon..."
                      value={formData.faviconUrl}
                      onChange={e => updateField('faviconUrl', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Admin User */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Usuario Administrador</CardTitle>
              <CardDescription>
                Crea el primer usuario administrador del tenant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminFirstName">Nombre *</Label>
                  <Input
                    id="adminFirstName"
                    value={formData.adminFirstName}
                    onChange={e => updateField('adminFirstName', e.target.value)}
                    placeholder="Juan"
                    className={validationErrors.adminFirstName ? 'border-red-500' : ''}
                  />
                  {validationErrors.adminFirstName && (
                    <p className="text-xs text-red-500">{validationErrors.adminFirstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminLastName">Apellido *</Label>
                  <Input
                    id="adminLastName"
                    value={formData.adminLastName}
                    onChange={e => updateField('adminLastName', e.target.value)}
                    placeholder="García"
                    className={validationErrors.adminLastName ? 'border-red-500' : ''}
                  />
                  {validationErrors.adminLastName && (
                    <p className="text-xs text-red-500">{validationErrors.adminLastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={e => updateField('adminEmail', e.target.value)}
                  placeholder="admin@acme.com"
                  className={validationErrors.adminEmail ? 'border-red-500' : ''}
                />
                {validationErrors.adminEmail && (
                  <p className="text-xs text-red-500">{validationErrors.adminEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.adminPassword}
                    onChange={e => updateField('adminPassword', e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className={cn('pr-10', validationErrors.adminPassword ? 'border-red-500' : '')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.adminPassword && (
                  <p className="text-xs text-red-500">{validationErrors.adminPassword}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendWelcomeEmail"
                  checked={formData.sendWelcomeEmail}
                  onChange={e => updateField('sendWelcomeEmail', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="sendWelcomeEmail" className="font-normal">
                  Enviar email de bienvenida con credenciales
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Información del Tenant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nombre:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Slug:</span>
                  <span className="font-mono text-sm">{formData.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Industria:</span>
                  <span>{formData.industry}</span>
                </div>
                {formData.website && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Website:</span>
                    <span className="text-indigo-600">{formData.website}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Plan y Facturación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan:</span>
                  <Badge>{selectedPlan.name}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ciclo:</span>
                  <span>{formData.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio:</span>
                  <span className="font-bold text-lg">
                    ${price}
                    <span className="text-sm font-normal text-gray-500">
                      /{formData.billingCycle === 'monthly' ? 'mes' : 'año'}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Branding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div 
                    className="h-12 w-12 rounded-lg"
                    style={{ backgroundColor: formData.primaryColor }}
                  />
                  <div 
                    className="h-12 w-12 rounded-lg"
                    style={{ backgroundColor: formData.secondaryColor }}
                  />
                  <div className="text-sm">
                    <p>Primario: {formData.primaryColor}</p>
                    <p>Secundario: {formData.secondaryColor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Administrador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nombre:</span>
                  <span>{formData.adminFirstName} {formData.adminLastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-indigo-600">{formData.adminEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email de bienvenida:</span>
                  <span>{formData.sendWelcomeEmail ? 'Sí' : 'No'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        {currentStep < 5 ? (
          <Button onClick={nextStep}>
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Crear Tenant
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
