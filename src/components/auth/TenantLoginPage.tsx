import { useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeSlash, CheckCircle } from '@phosphor-icons/react';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTenant) {
      alert('Error: No se ha seleccionado un tenant');
      return;
    }

    setIsLoading(true);

    try {
      const { ApiService } = await import('@/services/api.service');
      const result = await ApiService.login(email, password, currentTenant.id);

      if (result.success && result.user && result.token) {
        // Guardar sesión en localStorage
        localStorage.setItem('auth-token', result.token);
        localStorage.setItem('current-user', JSON.stringify(result.user));
        
        console.log('[Login] Éxito:', result.user);
        
        // Recargar página para que App.tsx detecte la sesión
        window.location.reload();
      } else {
        alert(result.error || 'Error al iniciar sesión');
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('[Login] Error:', error);
      alert('Error al conectar con el servidor. Intenta de nuevo.');
      setIsLoading(false);
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

            {/* Login Form */}
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

            {/* Footer */}
            <div className="text-center text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <button
                className="text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => alert('🚧 Registro en desarrollo')}
              >
                Solicita acceso
              </button>
            </div>

            {/* Dev Info */}
            {import.meta.env.DEV && (
              <div className="border-t pt-4 mt-4">
                <p className="text-xs text-gray-500 text-center">
                  🔧 <strong>Modo desarrollo</strong>
                </p>
                <p className="text-xs text-gray-400 text-center mt-1">
                  Tenant ID: <code className="bg-gray-100 px-1 rounded">{currentTenant?.id}</code>
                </p>
              </div>
            )}
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
