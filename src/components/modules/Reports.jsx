
import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import SummaryCards from '@/components/modules/Reports/SummaryCards';
import MonthlyPerformance from '@/components/modules/Reports/MonthlyPerformance';
import TopExpenseCategories from '@/components/modules/Reports/TopExpenseCategories';
import RecentTransactions from '@/components/modules/Reports/RecentTransactions';
import GeneralSummary from '@/components/modules/Reports/GeneralSummary';
import MonthlyIncomeStatement from '@/components/modules/Reports/MonthlyIncomeStatement';
import DatabaseBackupButton from '@/components/modules/Reports/DatabaseBackupButton';
import CashTransactionsModal from '@/components/modules/Reports/CashTransactionsModal';

const Reports = ({ setActiveModule }) => {
  const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalCogs: 0,
    netProfit: 0,
    pendingReceivables: 0,
    totalPayables: 0,
    monthlyIncome: 0,
    monthlyCogs: 0,
    monthlyExpenses: 0,
    monthlyProfit: 0,
    topExpenseCategories: [],
    recentTransactions: [],
    totalSalesInvoices: 0,
    totalExpensesRecords: 0,
    cashBalance: 0,
  });
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);

  const fetchFinancialData = async () => {
    if (!supabase) return;

    try {
      const { data: summary, error } = await supabase.rpc('get_financial_summary');
      if (error) throw error;

      setFinancialSummary({
        totalIncome: summary.total_income || 0,
        totalCogs: summary.total_cogs || 0,
        totalExpenses: summary.total_expenses || 0,
        netProfit: summary.net_profit || 0,
        pendingReceivables: summary.pending_receivables || 0,
        totalPayables: summary.total_payables || 0,
        monthlyIncome: summary.monthly_income || 0,
        monthlyCogs: summary.monthly_cogs || 0,
        monthlyExpenses: summary.monthly_expenses || 0,
        monthlyProfit: summary.monthly_profit || 0,
        topExpenseCategories: summary.top_expense_categories || [],
        recentTransactions: summary.recent_transactions || [],
        totalSalesInvoices: summary.total_sales_invoices || 0,
        totalExpensesRecords: summary.total_expenses_records || 0,
        cashBalance: summary.cash_balance || 0,
      });

    } catch (error) {
      toast({ title: "Error", description: `No se pudieron cargar los datos financieros: ${error.message}`, variant: "destructive" });
    }
  };
  
  useEffect(() => {
    if (supabase && !supabaseLoading && !supabaseError) {
      fetchFinancialData();
      const intervalId = setInterval(fetchFinancialData, 30000); 
      return () => clearInterval(intervalId);
    }
  }, [supabase, supabaseLoading, supabaseError]);

  if (supabaseLoading) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-purple-600 animate-pulse">Cargando Informes...</p></div>;
  if (supabaseError) return <div className="flex flex-col justify-center items-center h-screen p-8 text-center"><h2 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Informes</h2><p className="text-gray-700 mb-2">{supabaseError.message}</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Informes y Estado de Resultados</h1>
          <p className="text-gray-600 mt-1">Resumen financiero y utilidades de tu empresa</p>
        </div>
      </div>
      <SummaryCards summary={financialSummary} onCashBalanceClick={() => setIsCashModalOpen(true)} />
      <MonthlyPerformance summary={financialSummary} />
      <MonthlyIncomeStatement />
      <TopExpenseCategories categories={financialSummary.topExpenseCategories} totalExpenses={financialSummary.totalExpenses} />
      <RecentTransactions transactions={financialSummary.recentTransactions} />
      <GeneralSummary summary={financialSummary} />
      <DatabaseBackupButton />
      <CashTransactionsModal isOpen={isCashModalOpen} onOpenChange={setIsCashModalOpen} />
    </div>
  );
};

export default Reports;
