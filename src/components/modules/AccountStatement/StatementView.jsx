import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const StatementView = ({ data }) => {
    const { transactions, balance, entityName, entityType } = data;

    const formatCurrency = (value, isBalance = false) => {
        if (value === null || value === undefined) {
            return isBalance ? '$0' : '-';
        }
        const numValue = Number(value);
        if (isNaN(numValue)) {
             return isBalance ? '$0' : '-'; 
        }
        if (!isBalance && numValue === 0) {
            return '-';
        }
        return `$${Math.round(numValue).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        // Date comes as YYYY-MM-DD
        const date = new Date(dateString + 'T00:00:00Z'); // Interpret as UTC to avoid timezone shifts for display
        if (isNaN(date.getTime())) { 
            return 'Fecha inválida';
        }
        return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    };

    const balanceText = entityType === 'cliente' ? 'Saldo por Cobrar' : 'Saldo por Pagar';
    
    const actualBalance = Number(balance);
    const displayBalance = entityType === 'proveedor' ? actualBalance * -1 : actualBalance;

    const balanceColor = actualBalance > 0 && entityType === 'cliente' ? 'text-red-600' : 
                       actualBalance < 0 && entityType === 'proveedor' ? 'text-red-600' : 
                       (actualBalance === 0 ? 'text-gray-700' : 'text-green-600');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Estado de Cuenta de: {entityName}</CardTitle>
                    <CardDescription>
                        <div className="flex justify-between items-center mt-2">
                            <span>Historial de transacciones detallado.</span>
                            <div className="text-right">
                                <span className="font-semibold">{balanceText}: </span>
                                <span className={`text-xl font-bold ${balanceColor}`}>{formatCurrency(Math.abs(displayBalance), true)}</span>
                            </div>
                        </div>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-100">
                                <TableRow>
                                    <TableHead className="text-left p-3 font-medium">Fecha</TableHead>
                                    <TableHead className="text-left p-3 font-medium">Descripción</TableHead>
                                    <TableHead className="text-right p-3 font-medium">Debe</TableHead>
                                    <TableHead className="text-right p-3 font-medium">Haber</TableHead>
                                    <TableHead className="text-right p-3 font-medium">Saldo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions && transactions.map((tx, index) => (
                                    <TableRow key={tx.transaction_id || index} className="border-b hover:bg-gray-50">
                                        <TableCell className="p-3">{formatDate(tx.date)}</TableCell>
                                        <TableCell className="p-3">{tx.description}</TableCell>
                                        <TableCell className="p-3 text-right text-red-600">{formatCurrency(tx.debit)}</TableCell>
                                        <TableCell className="p-3 text-right text-green-600">{formatCurrency(tx.credit)}</TableCell>
                                        <TableCell className="p-3 text-right font-bold">{formatCurrency(tx.balance, true)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {(!transactions || transactions.length === 0) && (
                        <div className="text-center py-10 text-gray-500">
                            No se encontraron transacciones para esta entidad.
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default StatementView;