import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RecentTransactions = ({ transactions }) => {
  if (!transactions) return null;

  const formatDisplayValue = (value) => {
    return Math.round(value).toLocaleString('es');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones Recientes (Ingresos y Gastos)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Fecha</th>
                <th className="text-left p-2">Descripción</th>
                <th className="text-left p-2">Tipo</th>
                <th className="text-left p-2">Monto</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <motion.tr 
                  key={`${index}-${transaction.date}-${transaction.description}`}
                  className="border-b hover:bg-gray-50"
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  <td className="p-2">{new Date(transaction.date).toLocaleDateString()}</td>
                  <td className="p-2">{transaction.description}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                  <td className={`p-2 font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${formatDisplayValue(parseFloat(transaction.amount))}
                  </td>
                </motion.tr>))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">No hay transacciones recientes.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;