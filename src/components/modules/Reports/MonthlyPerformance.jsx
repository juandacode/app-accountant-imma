import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const MonthlyPerformance = ({ summary }) => {
  const formatDisplayValue = (value) => {
    return Math.round(value).toLocaleString('es');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Rendimiento del Mes Actual (Con Costos)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">${formatDisplayValue(summary.monthlyIncome)}</div>
            <p className="text-sm text-green-700">Ingresos del Mes</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">${formatDisplayValue(summary.monthlyCogs || 0)}</div>
            <p className="text-sm text-orange-700">CMV del Mes</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">${formatDisplayValue(summary.monthlyExpenses)}</div>
            <p className="text-sm text-red-700">Gastos del Mes</p>
          </div>
          <div className={`text-center p-4 rounded-lg ${summary.monthlyProfit >= 0 ? 'bg-blue-50' : 'bg-pink-50'}`}>
            <div className={`text-2xl font-bold ${summary.monthlyProfit >= 0 ? 'text-blue-600' : 'text-pink-600'}`}>
              ${formatDisplayValue(summary.monthlyProfit)}
            </div>
            <p className={`text-sm ${summary.monthlyProfit >= 0 ? 'text-blue-700' : 'text-pink-700'}`}>
              {summary.monthlyProfit >= 0 ? 'Ganancia Neta' : 'Pérdida Neta'} del Mes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyPerformance;