
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Handle hash fragments for email verification redirects
    const hash = window.location.hash;
    if (hash === '#signin') {
      setActiveTab('signin');
      // Clear the hash
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    console.log('👤 Auth page - loading:', loading, 'user:', user?.id);
    
    if (user && !loading) {
      console.log('🎯 User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (isSignUp: boolean = false) => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (isSignUp && formData.password.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }
    
    if (isSignUp) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'Vorname ist erforderlich';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Nachname ist erforderlich';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwort bestätigen ist erforderlich';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(false)) {
      return;
    }
    
    console.log('📝 Form submitted for sign in');
    setIsLoading(true);
    try {
      await signIn(formData.email, formData.password);
      console.log('✅ Sign in completed successfully');
    } catch (error) {
      console.error('❌ Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(true)) {
      return;
    }
    
    setIsLoading(true);
    try {
      await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
      });
      
      // Switch to sign in tab after successful registration
      setActiveTab('signin');
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
      }));
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setErrors({ email: 'Bitte geben Sie Ihre E-Mail-Adresse ein' });
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(formData.email);
      setShowForgotPassword(false);
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 flex items-center space-x-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            <span className="text-white">Lädt...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 scroll-fade-in">
          <img
            src="http://mutuus-app.de/assets/logopng.png"
            alt="Mutuus"
            className="h-16 w-auto mx-auto mb-4 floating glow-blue"
          />
          <h1 className="text-3xl font-bold text-white text-glow">Willkommen bei Mutuus</h1>
          <p className="text-gray-400 mt-2">Die Community für gegenseitige Hilfe</p>
        </div>

        <Card className="bg-gray-800 border-gray-700 card-futuristic glow-blue scroll-scale-in">
          <CardHeader>
            <CardTitle className="text-center text-white">
              Anmelden oder Registrieren
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Passwort zurücksetzen</h3>
                  <p className="text-gray-400 text-sm">Geben Sie Ihre E-Mail-Adresse ein, um einen Reset-Link zu erhalten.</p>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-white">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reset-email"
                        name="email"
                        type="email"
                        placeholder="ihre@email.de"
                        className={`pl-10 bg-gray-700 border-gray-600 text-white ${
                          errors.email ? 'border-red-500' : ''
                        }`}
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-sm">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button 
                      type="submit" 
                      className="w-full btn-futuristic glow-blue hover-lift"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Wird gesendet...
                        </>
                      ) : (
                        'Reset-Link senden'
                      )}
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost"
                      className="w-full text-gray-400 hover:text-white"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Zurück zur Anmeldung
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                  <TabsTrigger value="signin" className="text-white">Anmelden</TabsTrigger>
                  <TabsTrigger value="signup" className="text-white">Registrieren</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">E-Mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="ihre@email.de"
                          className={`pl-10 bg-gray-700 border-gray-600 text-white ${
                            errors.email ? 'border-red-500' : ''
                          }`}
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-sm">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">Passwort</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Ihr Passwort"
                          className={`pl-10 pr-10 bg-gray-700 border-gray-600 text-white ${
                            errors.password ? 'border-red-500' : ''
                          }`}
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-400 text-sm">{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Button 
                        type="submit" 
                        className="w-full btn-futuristic glow-blue hover-lift"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Wird angemeldet...
                          </>
                        ) : (
                          'Anmelden'
                        )}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="w-full text-sm text-gray-400 hover:text-white underline"
                      >
                        Passwort vergessen?
                      </button>
                    </div>
                  </form>
                </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">Vorname</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="Max"
                          className={`pl-10 bg-gray-700 border-gray-600 text-white ${
                            errors.firstName ? 'border-red-500' : ''
                          }`}
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-red-400 text-sm">{errors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">Nachname</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Mustermann"
                        className={`bg-gray-700 border-gray-600 text-white ${
                          errors.lastName ? 'border-red-500' : ''
                        }`}
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.lastName && (
                        <p className="text-red-400 text-sm">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="ihre@email.de"
                        className={`pl-10 bg-gray-700 border-gray-600 text-white ${
                          errors.email ? 'border-red-500' : ''
                        }`}
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-sm">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mindestens 6 Zeichen"
                        className={`pl-10 pr-10 bg-gray-700 border-gray-600 text-white ${
                          errors.password ? 'border-red-500' : ''
                        }`}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-sm">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Passwort bestätigen</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Passwort wiederholen"
                        className={`pl-10 pr-10 bg-gray-700 border-gray-600 text-white ${
                          errors.confirmPassword ? 'border-red-500' : ''
                        }`}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-futuristic glow-green hover-lift"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Wird registriert...
                      </>
                    ) : (
                      'Registrieren'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-gray-400 text-sm mt-6 scroll-fade-in delay-300">
          Mit der Registrierung stimmen Sie unseren Nutzungsbedingungen zu.
        </p>
      </div>
    </div>
  );
};

export default Auth;
