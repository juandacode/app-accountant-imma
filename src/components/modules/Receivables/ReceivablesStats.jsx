
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Clock, CheckCircle } from 'lucide-react';

const ReceivablesStats = ({ clientsCount, totalReceived, totalReceivable, pendingInvoicesCount }) => {
  const formatDisplayValue = (value) => {
    return Math.round(value).toLocaleString('es');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <motion.div whileHover={{ scale: 1.02 }} className="card-hover">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{clientsCount}</div></CardContent>
        </Card>
      </motion.div>
      <motion.div whileHover={{ scale: 1.02 }} className="card-hover">
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${formatDisplayValue(totalReceived)}</div></CardContent>
        </Card>
      </motion.div>
      <motion.div whileHover={{ scale: 1.02 }} className="card-hover">
        <Card className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${formatDisplayValue(totalReceivable)}</div></CardContent>
        </Card>
      </motion.div>
      <motion.div whileHover={{ scale: 1.02 }} className="card-hover">
        <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
            <CheckCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pendingInvoicesCount}</div></CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReceivablesStats;
