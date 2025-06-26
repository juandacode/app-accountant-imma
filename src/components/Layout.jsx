import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Users, 
  CreditCard, 
  Receipt, 
  BarChart3,
  HeartHandshake,
  BookUser,
  Scissors,
  LogOut,
  Printer
} from 'lucide-react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { useConfirmationDialog } from '@/components/providers/ConfirmationDialogProvider';

const Layout = ({ children, activeModule, setActiveModule }) => {
  const { supabase, session } = useSupabase();
  const { confirm } = useConfirmationDialog();

  const handleLogout = async () => {
    const confirmed = await confirm({
        title: 'Confirmar Cierre de Sesión',
        description: '¿Estás seguro de que quieres cerrar sesión?',
        confirmText: 'Cerrar Sesión',
        cancelText: 'Cancelar'
    });
    if (confirmed) {
        await supabase.auth.signOut();
    }
  };

  const modules = [
    { id: 'reports', name: 'Informes', icon: BarChart3 },
    { id: 'account_statement', name: 'Estado de Cuenta', icon: BookUser },
    { id: 'fabric_cutting', name: 'Telas y Corte', icon: Scissors },
    { id: 'inventory', name: 'Inventario Prod.', icon: Package },
    { id: 'receivables', name: 'Cuentas por Cobrar', icon: Users },
    { id: 'payables', name: 'Cuentas por Pagar', icon: CreditCard },
    { id: 'expenses', name: 'Gastos', icon: Receipt },
    { id: 'social_contributions', name: 'Aportes Sociales', icon: HeartHandshake },
    { id: 'print_invoices', name: 'Imprimir Facturas', icon: Printer },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-100">
      <header className="bg-white shadow-lg border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
                {/* Usar img-replace para el logo */}
                <img  class="h-8 w-auto" alt="Logo de la empresa" src="https://images.unsplash.com/photo-1585065799297-ce07d1855c01" />
              </div>
              {/* Se elimina el texto "ContaFácil" y "Sistema de Gestión Contable" */}
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{session?.user?.email}</p>
                    <p className="text-xs text-gray-500">En línea</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar Sesión">
                    <LogOut className="h-5 w-5 text-red-500" />
                </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64">
            <nav className="space-y-2">
              {modules.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;
                
                return (
                  <motion.button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-700 shadow-sm'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{module.name}</span>
                  </motion.button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="animate-fade-in"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;