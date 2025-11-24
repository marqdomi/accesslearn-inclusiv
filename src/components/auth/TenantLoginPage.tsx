import { useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Eye, EyeSlash, CheckCircle, UserPlus, SignIn } from '@phosphor-icons/react';
import { ApiService } from '@/services/api.service';
import { toast } from 'sonner';

/**
 * TenantLoginPage: Página de login con branding del tenant
 * 
 * Muestra:
 * - Logo y colores de la empresa/tenant
 * - Formulario de login en español
 * - Información del tenant detectado
 */
export function TenantLoginPage() {
  const { currentTenant } = useTenant();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Register state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerErrors, setRegisterErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTenant) {
      setError('Error: No se ha seleccionado un tenant');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password, currentTenant.id);
      // El AuthContext maneja el resto (guardar en localStorage y actualizar estado)
    } catch (error: any) {
      console.error('[Login] Error:', error);
      setError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      setIsLoading(false);
    }
  };

  const validateRegisterForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!registerData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!registerData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!registerData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!registerData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (registerData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar tu contraseña';
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setRegisterErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentTenant || !validateRegisterForm()) return;

    try {
      setIsRegistering(true);

      const result = await ApiService.registerUser({
        tenantSlug: currentTenant.slug || currentTenant.id,
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        password: registerData.password,
        role: 'student',
      });

      toast.success('¡Registro exitoso!', {
        description: 'Tu cuenta ha sido creada. Ya puedes iniciar sesión.',
      });

      // Cambiar a tab de login y limpiar formulario
      setActiveTab('login');
      setRegisterData({
        firstName: '',
        lastName: '',
        email: registerData.email, // Mantener el email para facilitar el login
        password: '',
        confirmPassword: '',
      });
      setEmail(registerData.email); // Pre-llenar email en login
    } catch (error: any) {
      console.error('Error registering user:', error);
      
      if (error.message?.includes('ya está registrado')) {
        toast.error('Email ya registrado', {
          description: 'Este email ya está registrado. Intenta iniciar sesión.',
        });
        setActiveTab('login');
        setEmail(registerData.email);
      } else {
        toast.error('Error al registrar', {
          description: error.message || 'Por favor intenta nuevamente',
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const primaryColor = currentTenant?.primaryColor || '#4F46E5';
  const secondaryColor = currentTenant?.secondaryColor || '#10B981';

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between text-white"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        }}
      >
        <div>
          <Shield className="w-12 h-12 mb-4" weight="fill" />
          <h1 className="text-4xl font-bold mb-2">
            {currentTenant?.name || 'AccessLearn'}
          </h1>
          <p className="text-lg opacity-90">
            Plataforma de Aprendizaje Inclusivo
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0" weight="fill" />
            <div>
              <h3 className="font-semibold mb-1">Contenido Accesible</h3>
              <p className="text-sm opacity-90">
                Cursos diseñados para todos los estilos de aprendizaje
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0" weight="fill" />
            <div>
              <h3 className="font-semibold mb-1">Seguimiento Personalizado</h3>
              <p className="text-sm opacity-90">
                Monitorea tu progreso y logros en tiempo real
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0" weight="fill" />
            <div>
              <h3 className="font-semibold mb-1">Certificación Profesional</h3>
              <p className="text-sm opacity-90">
                Obtén certificados verificables al completar cursos
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm opacity-75">
          © {new Date().getFullYear()} {currentTenant?.name || 'AccessLearn'}. Todos los derechos reservados.
        </div>
      </div>

      {/* Panel derecho - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Shield className="w-8 h-8" weight="fill" style={{ color: primaryColor }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Bienvenido a {currentTenant?.name}
              </h2>
              <p className="text-gray-600">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Tenant Info Badge */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-800">
                🏢 Accediendo a: <strong>{currentTenant?.name}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Plan: {currentTenant?.plan || 'Básico'}
              </p>
            </div>

            {/* Error Message */}
            {error && activeTab === 'login' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Tabs for Login/Register */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="gap-2">
                  <SignIn className="w-4 h-4" />
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger value="register" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-700"
                        onClick={() => alert('🚧 Recuperación de contraseña en desarrollo')}
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeSlash className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4 mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Juan"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        disabled={isRegistering}
                        className={registerErrors.firstName ? 'border-red-500' : ''}
                      />
                      {registerErrors.firstName && (
                        <p className="text-xs text-red-600">{registerErrors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Pérez"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        disabled={isRegistering}
                        className={registerErrors.lastName ? 'border-red-500' : ''}
                      />
                      {registerErrors.lastName && (
                        <p className="text-xs text-red-600">{registerErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Correo Electrónico</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="juan@ejemplo.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      disabled={isRegistering}
                      className={registerErrors.email ? 'border-red-500' : ''}
                    />
                    {registerErrors.email && (
                      <p className="text-xs text-red-600">{registerErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="registerPassword"
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        disabled={isRegistering}
                        className={registerErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isRegistering}
                      >
                        {showRegisterPassword ? (
                          <EyeSlash className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {registerErrors.password && (
                      <p className="text-xs text-red-600">{registerErrors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirma tu contraseña"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        disabled={isRegistering}
                        className={registerErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isRegistering}
                      >
                        {showConfirmPassword ? (
                          <EyeSlash className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {registerErrors.confirmPassword && (
                      <p className="text-xs text-red-600">{registerErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isRegistering}
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isRegistering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Crear Cuenta
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Mobile branding */}
          <div className="lg:hidden mt-6 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} {currentTenant?.name || 'AccessLearn'}
          </div>
        </div>
      </div>
    </div>
  );
}
