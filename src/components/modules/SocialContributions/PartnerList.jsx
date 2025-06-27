
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';

const PartnerList = ({ partners, contributions, onEdit, onDelete }) => {
  const getPartnerContributions = (partnerName) => {
    return contributions
      .filter(contrib => contrib.nombre_socio === partnerName)
      .reduce((sum, contrib) => sum + Number(contrib.monto_aporte), 0);
  };

  const formatDisplayValue = (value) => {
    return Math.round(value).toLocaleString('es');
  };

  return (
    <Card>
      <CardHeader><CardTitle>Lista de Socios</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map(partner => (
            <motion.div 
              key={partner.id} 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-purple-700">{partner.nombre_socio}</h3>
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => onEdit(partner)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(partner.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {partner.cedula_socio && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Cédula:</strong> {partner.cedula_socio}
                </p>
              )}
              
              {partner.telefono && (
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {partner.telefono}
                </p>
              )}
              
              {partner.email && (
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {partner.email}
                </p>
              )}
              
              {partner.direccion && (
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {partner.direccion}
                </p>
              )}
              
              {partner.fecha_ingreso && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Ingreso:</strong> {new Date(partner.fecha_ingreso + 'T00:00:00').toLocaleDateString()}
                </p>
              )}
              
              {partner.porcentaje_participacion && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Participación:</strong> {partner.porcentaje_participacion}%
                </p>
              )}
              
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-semibold text-green-600">
                  Total Aportado: ${formatDisplayValue(getPartnerContributions(partner.nombre_socio))}
                </p>
              </div>
              
              {partner.notas && (
                <p className="text-xs text-gray-500 mt-2 italic">{partner.notas}</p>
              )}
            </motion.div>
          ))}
        </div>
        {partners.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay socios registrados.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerList;
