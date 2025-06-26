import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const ProductList = ({ products, onEdit, onDelete }) => {
  const formatDisplayValue = (value) => {
    return value != null ? Math.round(value).toLocaleString('es') : '-';
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Productos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Referencia</th>
                <th className="text-left p-2">Nombre</th>
                <th className="text-left p-2">Descripción</th>
                <th className="text-left p-2">Stock Actual</th>
                <th className="text-left p-2">Costo Predet.</th>
                <th className="text-left p-2">Precio Venta</th>
                <th className="text-left p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <motion.tr 
                  key={product.id} 
                  className="border-b hover:bg-gray-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  <td className="p-2 font-mono text-sm">{product.sku}</td>
                  <td className="p-2 font-medium">{product.nombre}</td>
                  <td className="p-2 text-gray-600">{product.descripcion}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      product.cantidad_actual <= 5 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.cantidad_actual}
                    </span>
                  </td>
                  <td className="p-2 text-right">{formatDisplayValue(product.costo_predeterminado)}</td>
                  <td className="p-2 text-right">{formatDisplayValue(product.precio_venta_predeterminado)}</td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay productos registrados. ¡Agrega tu primer producto!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductList;