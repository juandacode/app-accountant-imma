import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

const TopExpenseCategories = ({ categories, totalExpenses }) => {
  if (!categories || categories.length === 0) return null;
  
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChart className="h-5 w-5" />
          <span>Principales Categorías de Gastos</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((item, index) => {
            const amount = parseFloat(item.total);
            const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : '0.0';
            return (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                  <span className="font-medium">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">${amount.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopExpenseCategories;