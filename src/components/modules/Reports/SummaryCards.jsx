
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Banknote, CreditCard, Building2 } from 'lucide-react';
import CashBalanceDetails from './CashBalanceDetails';

const SummaryCards = ({ summary, onCashBalanceClick }) => {
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // NUEVO: Separar saldo en caja y banco
  const cashBalance = summary.cashBalance || 0; // Solo efectivo
  const bankBalance = summary.bankBalance || 0; // Solo transferencias

  const cardsData = [
    { 
      title: "Ingresos Totales", 
      value: summary.totalIncome, 
      icon: TrendingUp, 
      color: "from-green-500 to-emerald-600", 
      note: "Facturas pagadas",
      clickable: true,
      detailType: 'INGRESOS'
    },
    { 
      title: "Por Cobrar", 
      value: summary.pendingReceivables, 
      icon: BarChart3, 
      color: "from-yellow-500 to-orange-600", 
      note: "Facturas pendientes",
      clickable: true,
      detailType: 'RECEIVABLES'
    },
    { 
      title: "Saldo en Caja", 
      value: cashBalance, 
      icon: Banknote, 
      color: "from-blue-500 to-indigo-600", 
      note: "Efectivo disponible",
      clickable: true,
      detailType: 'EFECTIVO'
    },
    { 
      title: "Saldo en Banco", 
      value: bankBalance, 
      icon: Building2, 
      color: "from-teal-500 to-cyan-600", 
      note: "Transferencias",
      clickable: true,
      detailType: 'TRANSFERENCIA'
    },
  ];

  const handleCardClick = (card) => {
    if (card.clickable) {
      if (card.detailType === 'EFECTIVO' || card.detailType === 'TRANSFERENCIA') {
        // Para saldos, usar el callback existente si existe
        if (onCashBalanceClick) {
          onCashBalanceClick();
        } else {
          setSelectedDetail({
            title: card.title,
            type: card.detailType
          });
          setDetailsOpen(true);
        }
      } else {
        setSelectedDetail({
          title: card.title,
          type: card.detailType
        });
        setDetailsOpen(true);
      }
    }
  };

  const formatDisplayValue = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
        return '$0';
    }
    return `\$${Math.round(Number(value)).toLocaleString('es')}`;
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardsData.map((card, index) => (
          <motion.div 
            key={index} 
            whileHover={{ scale: 1.02 }} 
            className="card-hover h-full w-full"
            onClick={() => handleCardClick(card)}
            style={{ cursor: card.clickable ? 'pointer' : 'default' }}
          >
            <Card className={`bg-gradient-to-r ${card.color} text-white overflow-hidden h-full flex flex-col rounded-xl shadow-lg min-w-[200px] sm:min-w-[180px] lg:min-w-[180px] xl:min-w-[200px]`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4 relative">
                <CardTitle className="text-sm lg:text-base font-semibold text-center w-full">{card.title}</CardTitle>
                <card.icon className="h-5 w-5 opacity-90 absolute top-4 right-4" />
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-center items-center text-center px-4 pb-4">
                <div className="text-2xl md:text-xl lg:text-2xl xl:text-2xl font-bold break-words whitespace-normal">
                  {formatDisplayValue(card.value)}
                </div>
                <p className="text-xs opacity-80 mt-1">{card.note}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal de detalles */}
      <CashBalanceDetails
        isOpen={detailsOpen}
        onOpenChange={setDetailsOpen}
        title={selectedDetail?.title || ''}
        transactionType={selectedDetail?.type || ''}
      />
    </>
  );
};

export default SummaryCards;
