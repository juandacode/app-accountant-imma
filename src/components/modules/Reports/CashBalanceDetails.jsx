import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const CashBalanceDetails = ({ isOpen, onOpenChange, title, transactionType }) => {
  const { supabase } = useSupabase();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && transactionType) {
      fetchTransactions();
    }
  }, [isOpen, transactionType]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('caja_general_transacciones')
        .select('*')
        .order('fecha_transaccion', { ascending: false })
        .limit(50);

      // Filtrar por tipo de transacción si se especifica
      if (transactionType === 'EFECTIVO') {
        query = query.or('tipo_transaccion.like.%EFECTIVO%,tipo_transaccion.like.%CONTADO%');
      } else if (transactionType === 'TRANSFERENCIA') {
        query = query.like('tipo_transaccion', '%TRANSFERENCIA%');
      } else if (transactionType === 'INGRESOS') {
        query = query.like('tipo_transaccion', 'INGRESO%');
      } else if (transactionType === 'EGRESOS') {
        query = query.like('tipo_transaccion', 'EGRESO%');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `$${Math.round(value || 0).toLocaleString('es')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionBadge = (tipo) => {
    if (tipo.startsWith('INGRESO')) {
      return <Badge className="bg-green-500">Ingreso</Badge>;
    }
    return <Badge variant="destructive">Egreso</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title} - Últimos 50 Movimientos</DialogTitle>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron transacciones.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Saldo Resultante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.fecha_transaccion)}</TableCell>
                    <TableCell>{getTransactionBadge(transaction.tipo_transaccion)}</TableCell>
                    <TableCell className="max-w-xs truncate">{transaction.descripcion}</TableCell>
                    <TableCell className="text-right font-medium">
                      {transaction.tipo_transaccion.startsWith('INGRESO') ? '+' : '-'}
                      {formatCurrency(transaction.monto)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(transaction.saldo_resultante)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CashBalanceDetails;