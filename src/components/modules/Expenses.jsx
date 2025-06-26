import React, { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import ExpenseForm from '@/components/modules/Expenses/ExpenseForm';
import ExpenseStats from '@/components/modules/Expenses/ExpenseStats';
import ExpenseCategorySummary from '@/components/modules/Expenses/ExpenseCategorySummary';
import ExpenseList from '@/components/modules/Expenses/ExpenseList';
import { useConfirmationDialog } from '@/components/providers/ConfirmationDialogProvider';

const Expenses = () => {
  const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();
  const [expenses, setExpenses] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const { confirm } = useConfirmationDialog();

  const categories = useMemo(() => [
    'Oficina y Administración',
    'Marketing y Publicidad',
    'Servicios Públicos',
    'Transporte',
    'Alimentación',
    'Tecnología',
    'Mantenimiento',
    'Seguros',
    'Impuestos',
    'Nómina',
    'Alquiler',
    'Otros'
  ], []);

  const fetchExpenses = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('gastos').select('*').order('fecha', { ascending: false });
    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los gastos.", variant: "destructive" });
    } else {
      setExpenses(data || []);
    }
  };

  useEffect(() => {
    if (supabase && !supabaseLoading && !supabaseError) {
      fetchExpenses();
    }
  }, [supabase, supabaseLoading, supabaseError]);

  const handleFormSubmit = async (expenseData, isEditing) => {
    if (!supabase) {
      toast({ title: "Error de conexión", description: "Supabase no está conectado.", variant: "destructive" });
      return;
    }

    let savedExpense;

    if (isEditing) {
      const { data, error } = await supabase
        .from('gastos')
        .update(expenseData)
        .eq('id', editingExpense.id)
        .select()
        .single();
      
      if (error) {
        toast({ title: "Error", description: "No se pudo actualizar el gasto.", variant: "destructive" });
        return;
      }
      savedExpense = data;
      toast({ title: "¡Gasto actualizado!", description: "El gasto se ha actualizado correctamente." });
    } else {
      const { data, error } = await supabase
        .from('gastos')
        .insert(expenseData)
        .select()
        .single();

      if (error) {
        toast({ title: "Error", description: "No se pudo registrar el gasto.", variant: "destructive" });
        return;
      }
      savedExpense = data;
      toast({ title: "¡Gasto registrado!", description: "El gasto se ha registrado correctamente." });
      
      const { error: cashError } = await supabase.rpc('registrar_transaccion_caja', {
        p_tipo_transaccion: 'EGRESO_GASTO',
        p_descripcion: `Gasto: ${savedExpense.descripcion}`,
        p_monto: savedExpense.monto,
        p_referencia_id: savedExpense.id,
        p_referencia_tabla: 'gastos'
      });

      if (cashError) {
        toast({ title: "Error en Caja", description: `No se pudo registrar el movimiento en caja: ${cashError.message}`, variant: "destructive" });
      }
    }
    
    setIsDialogOpen(false);
    setEditingExpense(null);
    fetchExpenses();
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = async (expenseId) => {
    const confirmed = await confirm({
      title: 'Confirmar Eliminación',
      description: '¿Estás seguro de que quieres eliminar este gasto? Esta acción también eliminará el movimiento de caja asociado.',
      confirmText: 'Eliminar Gasto',
    });

    if (!confirmed) return;

    if (!supabase) {
      toast({ title: "Error de conexión", description: "Supabase no está conectado.", variant: "destructive" });
      return;
    }

    const { data: cashTransaction, error: cashErrorSelect } = await supabase
      .from('caja_general_transacciones')
      .select('id')
      .eq('referencia_id', expenseId)
      .eq('referencia_tabla', 'gastos')
      .single();

    if (cashErrorSelect && cashErrorSelect.code !== 'PGRST116') {
      toast({ title: "Error", description: "Error al buscar transacción de caja asociada.", variant: "destructive" });
    }

    if (cashTransaction) {
      const { error: cashDeleteError } = await supabase
        .from('caja_general_transacciones')
        .delete()
        .eq('id', cashTransaction.id);
      if (cashDeleteError) {
        toast({ title: "Error", description: `No se pudo eliminar la transacción de caja asociada: ${cashDeleteError.message}`, variant: "destructive" });
      }
    }

    const { error } = await supabase.from('gastos').delete().eq('id', expenseId);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el gasto.", variant: "destructive" });
    } else {
      toast({ title: "Gasto eliminado", description: "El gasto y su movimiento de caja asociado se han eliminado." });
      setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseId));
    }
  };
  
  if (supabaseLoading && !supabase) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl text-purple-600 animate-pulse">Conectando a Supabase...</p></div>;
  }
  
  if (supabaseError) {
     return (
      <div className="flex flex-col justify-center items-center h-screen p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Gastos</h2>
        <p className="text-gray-700 mb-2">{supabaseError.message}</p>
        <p className="text-gray-600">Intenta recargar la página o verifica la conexión con Supabase.</p>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.monto, 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter(exp => {
    const expenseDate = new Date(exp.fecha);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  }).reduce((sum, exp) => sum + exp.monto, 0);

  const expensesByCategory = categories.map(category => ({
    category,
    total: expenses.filter(exp => exp.categoria === category).reduce((sum, exp) => sum + exp.monto, 0),
    count: expenses.filter(exp => exp.categoria === category).length
  })).filter(item => item.total > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Gastos</h1>
          <p className="text-gray-600 mt-1">Registra y controla todos los gastos de tu empresa</p>
        </div>
        <ExpenseForm
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleFormSubmit}
          editingExpense={editingExpense}
          setEditingExpense={setEditingExpense}
          categories={categories}
        />
      </div>

      <ExpenseStats
        totalExpenses={totalExpenses}
        monthlyExpenses={monthlyExpenses}
        expenseCount={expenses.length}
      />

      <ExpenseCategorySummary expensesByCategory={expensesByCategory} />

      <ExpenseList expenses={expenses} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default Expenses;