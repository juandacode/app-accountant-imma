import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const CashTransactionsModal = ({ isOpen, onOpenChange }) => {
  const { supabase } = useSupabase();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('caja_general_transacciones')
        .select('*')
        .order('fecha_transaccion', { ascending: false })
        .limit(50); 
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      toast({ title: "Error", description: `No se pudieron cargar los movimientos de caja: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && supabase) { // Ensure supabase is available before fetching
      fetchTransactions();
    }
  }, [isOpen, supabase]);

  const formatCurrency = (value) => {
    return Math.round(value).toLocaleString('es');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[80vh] max-h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Movimientos Recientes en Caja</DialogTitle>
          <DialogDescription>
            Últimos 50 movimientos registrados en la caja general.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-3"> 
            <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Saldo Resultante</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading && (
                    <TableRow>
                    <TableCell colSpan="5" className="text-center h-64 align-middle">Cargando movimientos...</TableCell>
                    </TableRow>
                )}
                {!loading && transactions.length === 0 && (
                    <TableRow>
                    <TableCell colSpan="5" className="text-center h-64 align-middle">No hay movimientos registrados.</TableCell>
                    </TableRow>
                )}
                {!loading && transactions.map((tx) => (
                    <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.fecha_transaccion).toLocaleString('es-CO', {dateStyle: 'short', timeStyle: 'short'})}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={tx.descripcion}>{tx.descripcion}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.tipo_transaccion.startsWith('INGRESO') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {tx.tipo_transaccion.replace(/_/g, ' ')}
                        </span>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${tx.tipo_transaccion.startsWith('INGRESO') ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.tipo_transaccion.startsWith('INGRESO') ? '+' : '-'}${formatCurrency(tx.monto)}
                    </TableCell>
                    <TableCell className="text-right font-bold">${formatCurrency(tx.saldo_resultante)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CashTransactionsModal;