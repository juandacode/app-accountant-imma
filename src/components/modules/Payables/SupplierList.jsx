import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const SupplierList = ({ suppliers, onEdit, onDelete }) => {
  return (
    <Card>
      <CardHeader><CardTitle>Lista de Proveedores</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Nombre</th>
                <th className="text-left p-2">Cédula Fiscal/ID</th>
                <th className="text-left p-2">Ciudad</th>
                <th className="text-left p-2">Dirección</th>
                <th className="text-left p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(supplier => (
                <motion.tr 
                  key={supplier.id} 
                  className="border-b hover:bg-gray-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  <td className="p-2 font-medium">{supplier.nombre_proveedor}</td>
                  <td className="p-2">{supplier.cedula_fiscal}</td>
                  <td className="p-2">{supplier.ciudad}</td>
                  <td className="p-2">{supplier.direccion}</td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(supplier)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(supplier.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {suppliers.length === 0 && (<div className="text-center py-8 text-gray-500">No hay proveedores registrados.</div>)}
        </div>
      </CardContent>
    </Card>
  );
};
export default SupplierList;