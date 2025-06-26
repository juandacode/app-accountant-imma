import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, Receipt } from 'lucide-react';

const ExpenseStats = ({ totalExpenses, monthlyExpenses, expenseCount }) => {
  const formatDisplayValue = (value) => {
    return Math.round(value).toLocaleString('es');
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div whileHover={{ scale: 1.02 }} className="card-hover">
        <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatDisplayValue(totalExpenses)}</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} className="card-hover">
        <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatDisplayValue(monthlyExpenses)}</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} className="card-hover">
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <Receipt className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenseCount}</div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ExpenseStats;