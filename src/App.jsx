import React, { useState, useEffect, Suspense, lazy } from 'react';
import Layout from '@/components/Layout';
import AuthPage from '@/pages/AuthPage';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseProvider, useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import ConfirmationDialogProvider from '@/components/providers/ConfirmationDialogProvider';

// Lazy load modules
const Inventory = lazy(() => import('@/components/modules/Inventory/Inventory'));
const Receivables = lazy(() => import('@/components/modules/Receivables/Receivables'));
const Payables = lazy(() => import('@/components/modules/Payables/Payables'));
const Expenses = lazy(() => import('@/components/modules/Expenses'));
const Reports = lazy(() => import('@/components/modules/Reports'));
const SocialContributions = lazy(() => import('@/components/modules/SocialContributions/SocialContributions'));
const AccountStatement = lazy(() => import('@/components/modules/AccountStatement/AccountStatement'));
const FabricCutting = lazy(() => import('@/components/modules/FabricCutting/FabricCutting')); 
const PrintInvoices = lazy(() => import('@/components/modules/PrintInvoices/PrintInvoices'));

const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-100">
    <p className="text-2xl text-pink-600 animate-pulse font-semibold">Cargando módulo...</p>
  </div>
);

const AppContent = () => {
  const [activeModule, setActiveModule] = useState('reports');
  const { supabase, loading, error, session } = useSupabase();

  useEffect(() => {
    if (!loading && error) {
      toast({
        title: "Error de Configuración/Conexión Supabase",
        description: `Detalle: ${error.message}. Por favor, revisa la consola para más información.`,
        variant: "destructive",
        duration: Infinity, 
      });
    } else if (!loading && !supabase && !error) {
      toast({
        title: "Supabase no disponible",
        description: "El cliente de Supabase no pudo inicializarse. La funcionalidad de la base de datos estará limitada. Verifica las credenciales y la conexión.",
        variant: "destructive",
        duration: Infinity,
      });
    }
  }, [supabase, loading, error]);

  const renderModule = () => {
    switch (activeModule) {
      case 'inventory':
        return <Inventory />;
      case 'receivables':
        return <Receivables />;
      case 'payables':
        return <Payables />;
      case 'expenses':
        return <Expenses />;
      case 'reports':
        return <Reports setActiveModule={setActiveModule} />;
      case 'social_contributions':
        return <SocialContributions />;
      case 'account_statement':
        return <AccountStatement />;
      case 'fabric_cutting':
        return <FabricCutting />;
      case 'print_invoices':
        return <PrintInvoices />;
      default:
        return <Reports setActiveModule={setActiveModule}/>;
    }
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-100">
              <p className="text-2xl text-pink-600 animate-pulse font-semibold">Conectando con los servicios...</p>
          </div>
      );
  }
  
  if (error && !loading) { // Mostrar error si existe, incluso si supabase no es null (podría haber un error de sesión)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-red-50 p-8 text-center">
        <h1 className="text-3xl font-bold text-red-700 mb-4">¡Ups! Error de Conexión</h1>
        <p className="text-red-600 mb-2">No pudimos conectar con nuestros servicios o hubo un problema al cargar la configuración.</p>
        <p className="text-gray-600">Por favor, intenta recargar la página. Si el problema persiste, revisa tu conexión a internet y las credenciales de Supabase.</p>
        <pre className="mt-4 text-xs text-left bg-red-100 p-2 rounded overflow-auto max-w-md">{error.message}</pre>
      </div>
    );
  }

  if (!session && !loading && !error) { // Solo mostrar AuthPage si no hay sesión Y no hay error Y no está cargando
      return <AuthPage />;
  }
  
  // Si hay sesión y no hay error y no está cargando, renderizar la aplicación.
  // También cubre el caso donde supabase puede ser null pero hay un error que ya se mostró.
  if (session && !loading && !error) {
    return (
      <div className="min-h-screen">
        <Layout activeModule={activeModule} setActiveModule={setActiveModule}>
          <Suspense fallback={<LoadingFallback />}>
            {renderModule()}
          </Suspense>
        </Layout>
        <Toaster />
      </div>
    );
  }

  // Fallback por si alguna condición no se cumple, aunque no debería llegar aquí con la lógica anterior.
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <p className="text-xl text-gray-700">Inicializando aplicación...</p>
    </div>
  );
}

function App() {
  return (
    <SupabaseProvider>
      <ConfirmationDialogProvider>
        <AppContent />
      </ConfirmationDialogProvider>
    </SupabaseProvider>
  );
}

export default App;