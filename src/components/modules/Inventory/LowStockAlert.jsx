import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LowStockAlert = ({ lowStockProducts }) => {
  if (lowStockProducts.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">⚠️ Productos con Stock Bajo (12 unidades o menos)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lowStockProducts.map(product => (
            <div key={product.id} className="flex justify-between items-center p-2 bg-white rounded">
              <span className="font-medium">{product.nombre} ({product.sku})</span>
              <span className="text-red-600 font-bold">Stock: {product.cantidad_actual}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;