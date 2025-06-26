import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RecentPayments = ({ payments }) => {
  const formatDisplayValue = (value) => {
    return Math.round(value).toLocaleString('es');
  };
  return (
    <Card>
      <CardHeader><CardTitle>Pagos Recibidos Recientes</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Fecha</th>
                <th className="text-left p-2">Factura</th>
                <th className="text-left p-2">Cliente</th>
                <th className="text-left p-2">Monto</th>
                <th className="text-left p-2">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{new Date(payment.fecha_pago + 'T00:00:00').toLocaleDateString()}</td>
                  <td className="p-2 font-mono text-sm">{payment.invoiceNumber || payment.facturas_venta?.numero_factura}</td>
                  <td className="p-2">{payment.customerName || payment.facturas_venta?.clientes?.nombre_completo}</td>
                  <td className="p-2 font-bold text-green-600">${formatDisplayValue(payment.monto_pago)}</td>
                  <td className="p-2 text-gray-600">{payment.descripcion_pago}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (<div className="text-center py-8 text-gray-500">No hay pagos registrados.</div>)}
        </div>
      </CardContent>
    </Card>
  );
};
export default RecentPayments;