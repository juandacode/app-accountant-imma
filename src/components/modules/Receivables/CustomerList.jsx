import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const CustomerList = ({ customers, onEdit, onDelete }) => {
  return (
    <Card>
      <CardHeader><CardTitle>Lista de Clientes</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Nombre</th>
                <th className="text-left p-2">Cédula/ID</th>
                <th className="text-left p-2">Ciudad</th>
                <th className="text-left p-2">Dirección</th>
                <th className="text-left p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <motion.tr 
                  key={customer.id} 
                  className="border-b hover:bg-gray-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  <td className="p-2 font-medium">{customer.nombre_completo}</td>
                  <td className="p-2">{customer.cedula_id}</td>
                  <td className="p-2">{customer.ciudad}</td>
                  <td className="p-2">{customer.direccion}</td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(customer)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(customer.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (<div className="text-center py-8 text-gray-500">No hay clientes registrados.</div>)}
        </div>
      </CardContent>
    </Card>
  );
};
export default CustomerList;