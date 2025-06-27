
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, KeyRound, UserPlus } from 'lucide-react';

const AuthPage = () => {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState('admin@beautyblouse.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      if (error) {
        console.error('Login error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Credenciales Incorrectas',
            description: 'El email o contraseña son incorrectas. Intenta con: admin@beautyblouse.com / admin123',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error de inicio de sesión',
            description: error.message,
            variant: 'destructive',
          });
        }
        return;
      }

      if (data.user) {
        toast({
          title: 'Bienvenido',
          description: 'Has iniciado sesión correctamente.',
        });
      }
    } catch (error) {
      console.error('Login catch error:', error);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un problema durante el inicio de sesión.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('SignUp error:', error);
        toast({
          title: 'Error de registro',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data.user) {
        toast({
          title: 'Usuario creado',
          description: 'Se ha creado tu cuenta exitosamente. Puedes iniciar sesión ahora.',
        });
        setIsSignUp(false);
      }
    } catch (error) {
      console.error('SignUp catch error:', error);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un problema durante el registro.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full inline-block mb-4">
                <Building2 className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold mt-4">
              {isSignUp ? 'Crear Cuenta' : 'Bienvenido a Beauty Blouse'}
            </CardTitle>
            <CardDescription>
              {isSignUp ? 'Registra tu nueva cuenta' : 'Inicia sesión para acceder a tu sistema contable'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                disabled={loading}
              >
                {loading ? (isSignUp ? 'Registrando...' : 'Ingresando...') : (
                  <>
                    {isSignUp ? <UserPlus className="h-4 w-4 mr-2" /> : <KeyRound className="h-4 w-4 mr-2" />}
                    {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                  </>
                )}
              </Button>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  disabled={loading}
                >
                  {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </Button>
              </div>
            </form>
            
            {!isSignUp && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <strong>Credenciales de prueba:</strong><br />
                Email: admin@beautyblouse.com<br />
                Contraseña: admin123
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;
