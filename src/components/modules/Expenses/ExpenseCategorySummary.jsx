import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ExpenseCategorySummary = ({ expensesByCategory }) => {
  if (expensesByCategory.length === 0) return null;

  const formatDisplayValue = (value) => {
    return Math.round(value).toLocaleString('es');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expensesByCategory.map(item => (
            <motion.div 
              key={item.category}
              className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.category}</p>
                  <p className="text-sm text-gray-600">{item.count} gastos</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">${formatDisplayValue(item.total)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseCategorySummary;