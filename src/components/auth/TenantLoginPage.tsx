import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Eye, EyeSlash, CheckCircle, UserPlus, SignIn } from '@phosphor-icons/react';
import { ApiService } from '@/services/api.service';
import { toast } from 'sonner';
import { TenantLogo } from '@/components/branding/TenantLogo';

/**
 * TenantLoginPage: Página de login con branding del tenant
 * 
 * Muestra:
 * - Logo y colores de la empresa/tenant
 * - Formulario de login en español
 * - Información del tenant detectado
 */
export function TenantLoginPage() {
  const { t } = useTranslation('auth');
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
      setError(t('login.noTenantError'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password, currentTenant.id);
      // El AuthContext maneja el resto (guardar en localStorage y actualizar estado)
    } catch (error: any) {
      console.error('[Login] Error:', error);
      setError(error.message || t('login.error'));
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
      newErrors.firstName = t('register.firstNameRequired');
    }

    if (!registerData.lastName.trim()) {
      newErrors.lastName = t('register.lastNameRequired');
    }

    if (!registerData.email.trim()) {
      newErrors.email = t('register.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      newErrors.email = t('register.emailInvalid');
    }

    if (!registerData.password) {
      newErrors.password = t('register.passwordRequired');
    } else if (registerData.password.length < 8) {
      newErrors.password = t('register.passwordMinLength');
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = t('register.confirmPasswordRequired');
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = t('register.passwordsMismatch');
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

      toast.success(t('register.success'), {
        description: t('register.successDescription'),
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
        toast.error(t('register.emailAlreadyRegistered'), {
          description: t('register.emailAlreadyRegisteredDescription'),
        });
        setActiveTab('login');
        setEmail(registerData.email);
      } else {
        toast.error(t('register.error'), {
          description: error.message || t('register.tryAgain'),
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
          <div className="mb-6">
            <TenantLogo 
              size="xl" 
              className="mb-4"
              fallbackIcon={<Shield className="w-12 h-12" weight="fill" />}
            />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {currentTenant?.name || 'Kaido'}
          </h1>
          <p className="text-lg opacity-90">
            {t('login.platformSubtitle')}
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0" weight="fill" />
            <div>
              <h3 className="font-semibold mb-1">{t('login.feature1Title')}</h3>
              <p className="text-sm opacity-90">
                {t('login.feature1Description')}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0" weight="fill" />
            <div>
              <h3 className="font-semibold mb-1">{t('login.feature2Title')}</h3>
              <p className="text-sm opacity-90">
                {t('login.feature2Description')}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0" weight="fill" />
            <div>
              <h3 className="font-semibold mb-1">{t('login.feature3Title')}</h3>
              <p className="text-sm opacity-90">
                {t('login.feature3Description')}
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm opacity-75">
          © {new Date().getFullYear()} {currentTenant?.name || 'Kaido'}. {t('login.allRightsReserved')}
        </div>
      </div>

      {/* Panel derecho - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6 border border-border">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <TenantLogo 
                  size="lg" 
                  className="rounded-full"
                  fallbackIcon={
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Shield className="w-8 h-8" weight="fill" style={{ color: primaryColor }} />
                    </div>
                  }
                />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {t('login.welcomeTo', { name: currentTenant?.name })}
              </h2>
              <p className="text-muted-foreground">
                {t('login.enterCredentials')}
              </p>
            </div>

            {/* Tenant Info Badge */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                🏢 {t('login.accessingTo')}: <strong>{currentTenant?.name}</strong>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                {t('login.plan')}: {currentTenant?.plan || t('login.planBasic')}
              </p>
            </div>

            {/* Error Message */}
            {error && activeTab === 'login' && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Tabs for Login/Register */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="gap-2">
                  <SignIn className="w-4 h-4" />
                  {t('login.signInTab')}
                </TabsTrigger>
                <TabsTrigger value="register" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  {t('login.registerTab')}
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('login.emailLabel')}</Label>
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
                      <Label htmlFor="password">{t('login.passwordLabel')}</Label>
                      <button
                        type="button"
                        className="text-sm text-primary hover:text-primary/80"
                        onClick={() => alert(t('login.passwordRecoveryWIP'))}
                      >
                        {t('login.forgotPassword')}
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                    {isLoading ? t('login.signingIn') : t('login.signIn')}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4 mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('register.firstName')}</Label>
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
                      <Label htmlFor="lastName">{t('register.lastName')}</Label>
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
                    <Label htmlFor="registerEmail">{t('register.emailLabel')}</Label>
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
                    <Label htmlFor="registerPassword">{t('register.passwordLabel')}</Label>
                    <div className="relative">
                      <Input
                        id="registerPassword"
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder={t('register.passwordPlaceholder')}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        disabled={isRegistering}
                        className={registerErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                    <Label htmlFor="confirmPassword">{t('register.confirmPasswordLabel')}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder={t('register.confirmPasswordPlaceholder')}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        disabled={isRegistering}
                        className={registerErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                        {t('register.creatingAccount')}
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t('register.createAccount')}
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Mobile branding */}
          <div className="lg:hidden mt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {currentTenant?.name || 'Kaido'}
          </div>
        </div>
      </div>
    </div>
  );
}
