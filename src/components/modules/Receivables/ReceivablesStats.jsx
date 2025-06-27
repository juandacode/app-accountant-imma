
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Clock, CheckCircle } from 'lucide-react';

const ReceivablesStats = ({ receivablesData }) => {
  const formatCurrency = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return '$0';
    return '$' + Math.round(numValue).toLocaleString('es');
  };

  const safeCount = (value) => {
    const numValue = Number(value);
    return isNaN(numValue) ? 0 : numValue;
  };

  const totalClients = safeCount(receivablesData?.totalClients);
  const totalCobrado = Number(receivablesData?.totalCobrado) || 0;
  const totalPorCobrar = Number(receivablesData?.totalPorCobrar) || 0;
  const facturasPendientes = safeCount(receivablesData?.facturasPendientes);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-100">Total Clientes</CardTitle>
          <Users className="h-4 w-4 text-blue-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClients}</div>
          <p className="text-xs text-blue-200 mt-1">Clientes registrados</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-100">Total Cobrado</CardTitle>
          <DollarSign className="h-4 w-4 text-green-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalCobrado)}</div>
          <p className="text-xs text-green-200 mt-1">Pagos recibidos</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-100">Por Cobrar</CardTitle>
          <Clock className="h-4 w-4 text-yellow-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPorCobrar)}</div>
          <p className="text-xs text-yellow-200 mt-1">Saldo pendiente</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-100">Facturas Pendientes</CardTitle>
          <CheckCircle className="h-4 w-4 text-red-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{facturasPendientes}</div>
          <p className="text-xs text-red-200 mt-1">Sin pagar completamente</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceivablesStats;
