import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GeneralSummary = ({ summary }) => {
  const formatDisplayValue = (value) => {
    return Math.round(value).toLocaleString('es');
  };
  const calculateNetProfitMargin = () => {
    if (summary.totalIncome === 0) return '0.0%';
    const grossProfit = summary.totalIncome - (summary.totalCogs || 0);
    if (summary.totalIncome === 0) return '0.0%';
    return (( (grossProfit - summary.totalExpenses) / summary.totalIncome) * 100).toFixed(1) + '%';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen Financiero General (Con Costos)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Estado de Resultados (Total)</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Ingresos Totales por Ventas</span>
                <span className="font-medium text-green-600">+${formatDisplayValue(summary.totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Costo de Mercancía Vendida (CMV)</span>
                <span className="font-medium text-orange-600">-${formatDisplayValue(summary.totalCogs)}</span>
              </div>
               <div className="flex justify-between items-center py-2 border-b font-semibold">
                <span className="text-gray-800">Utilidad Bruta</span>
                <span className={`text-gray-800`}>
                  ${formatDisplayValue(summary.totalIncome - summary.totalCogs)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Gastos Operativos Totales</span>
                <span className="font-medium text-red-600">-${formatDisplayValue(summary.totalExpenses)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
                <span className="font-semibold text-gray-900">Resultado Neto Total</span>
                <span className={`font-bold text-lg ${summary.netProfit >= 0 ? 'text-blue-700' : 'text-pink-700'}`}>
                  ${formatDisplayValue(summary.netProfit)}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Indicadores Clave</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700">Margen de Ganancia Neta</div>
                <div className="text-xl font-bold text-blue-900">
                  {calculateNetProfitMargin()}
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-700">Total Facturas de Venta</div>
                <div className="text-xl font-bold text-purple-900">{summary.totalSalesInvoices}</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-sm text-orange-700">Total Registros de Gastos</div>
                <div className="text-xl font-bold text-orange-900">{summary.totalExpensesRecords}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSummary;