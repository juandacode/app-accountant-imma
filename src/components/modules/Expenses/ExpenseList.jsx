import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  const formatDisplayValue = (value) => {
    return Math.round(value).toLocaleString('es');
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Gastos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Fecha</th>
                <th className="text-left p-2">Descripción</th>
                <th className="text-left p-2">Categoría</th>
                <th className="text-left p-2">Monto</th>
                <th className="text-left p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <motion.tr 
                  key={expense.id} 
                  className="border-b hover:bg-gray-50"
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  <td className="p-2">{new Date(expense.fecha + 'T00:00:00').toLocaleDateString()}</td>
                  <td className="p-2 font-medium">{expense.descripcion}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {expense.categoria}
                    </span>
                  </td>
                  <td className="p-2 font-bold text-red-600">${formatDisplayValue(expense.monto)}</td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(expense)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {expenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay gastos registrados. ¡Registra tu primer gasto!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseList;