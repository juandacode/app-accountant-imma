import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3, Banknote } from 'lucide-react';

const SummaryCards = ({ summary, onCashBalanceClick }) => {
  const cardsData = [
    { title: "Ingresos Totales", value: summary.totalIncome, icon: TrendingUp, color: "from-green-500 to-emerald-600", note: "Facturas pagadas" },
    { title: "Gastos Totales", value: summary.totalExpenses, icon: TrendingDown, color: "from-red-500 to-pink-600", note: "Gastos registrados" },
    { title: "Por Cobrar", value: summary.pendingReceivables, icon: BarChart3, color: "from-yellow-500 to-orange-600", note: "Facturas pendientes" },
    { title: "Saldo en Caja/Banco", value: summary.cashBalance, icon: Banknote, color: "from-teal-500 to-cyan-600", note: "Efectivo disponible", clickable: true },
  ];

  const formatDisplayValue = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
        return '$0'; // Or some other placeholder like '$NaN' or '$---'
    }
    return `\$${Math.round(Number(value)).toLocaleString('es')}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardsData.map((card, index) => (
        <motion.div 
          key={index} 
          whileHover={{ scale: 1.02 }} 
          className="card-hover h-full w-full"
          onClick={card.clickable ? onCashBalanceClick : undefined}
          style={{ cursor: card.clickable ? 'pointer' : 'default' }}
        >
          <Card className={`bg-gradient-to-r ${card.color} text-white overflow-hidden h-full flex flex-col rounded-xl shadow-lg min-w-[200px] sm:min-w-[220px] lg:min-w-[200px] xl:min-w-[240px]`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4 relative">
              <CardTitle className="text-sm lg:text-base font-semibold text-center w-full">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 opacity-90 absolute top-4 right-4" />
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center text-center px-4 pb-4">
              <div className="text-2xl md:text-xl lg:text-2xl xl:text-3xl font-bold break-words whitespace-normal">
                {formatDisplayValue(card.value)}
              </div>
              <p className="text-xs opacity-80 mt-1">{card.note}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;