
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, KeyRound } from 'lucide-react';

const AuthPage = () => {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState('admin@beautyblouse.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!supabase) {
      toast({
        title: 'Error de Conexión',
        description: 'No se pudo conectar con el servidor. Intenta recargar la página.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log("Intentando iniciar sesión con:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      if (error) {
        console.error('Error de login:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Credenciales Incorrectas',
            description: 'El email o contraseña son incorrectas. Verifica tus datos.',
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
        console.log("Login exitoso:", data.user);
        toast({
          title: 'Bienvenido',
          description: 'Has iniciado sesión correctamente.',
        });
      }
    } catch (error) {
      console.error('Error inesperado durante login:', error);
      toast({
        title: 'Error de Conexión',
        description: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
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
              Bienvenido a Beauty Blouse
            </CardTitle>
            <CardDescription>
              Inicia sesión para acceder a tu sistema contable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
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
                {loading ? 'Ingresando...' : (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <strong>Credenciales de prueba:</strong><br />
              Email: admin@beautyblouse.com<br />
              Contraseña: admin123
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;
