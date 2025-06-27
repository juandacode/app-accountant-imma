
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
      console.error('Error de Supabase:', error);
      toast({
        title: "Error de Conexión",
        description: `No se pudo conectar con el servidor: ${error.message}`,
        variant: "destructive",
        duration: 8000,
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-xl text-pink-600 font-semibold">Conectando con Beauty Blouse...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

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
