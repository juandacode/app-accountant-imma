import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const ContributionList = ({ contributions, onEdit, onDelete }) => {
  const formatDisplayValue = (value) => {
    return Math.round(value).toLocaleString('es');
  };
  return (
    <Card>
      <CardHeader><CardTitle>Lista de Aportes</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Fecha</th>
                <th className="text-left p-2">Nombre del Socio</th>
                <th className="text-left p-2">Monto del Aporte</th>
                <th className="text-left p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map(item => (
                <motion.tr 
                  key={item.id} 
                  className="border-b hover:bg-gray-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  <td className="p-2">{new Date(item.fecha_aporte + 'T00:00:00').toLocaleDateString()}</td>
                  <td className="p-2 font-medium">{item.nombre_socio}</td>
                  <td className="p-2 font-bold text-green-600">${formatDisplayValue(item.monto_aporte)}</td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(item)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {contributions.length === 0 && (<div className="text-center py-8 text-gray-500">No hay aportes sociales registrados.</div>)}
        </div>
      </CardContent>
    </Card>
  );
};
export default ContributionList;