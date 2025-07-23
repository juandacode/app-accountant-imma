
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
        return `$${Math.abs(numValue).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString + 'T00:00:00Z');
        if (isNaN(date.getTime())) { 
            return 'Fecha inválida';
        }
        return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    };

    const getTransactionType = (description) => {
        if (description.includes('Factura de Venta') || description.includes('Factura de Compra')) {
            return 'invoice';
        }
        if (description.includes('Pago Recibido') || description.includes('Pago Realizado')) {
            return 'payment';
        }
        if (description.includes('Descuento')) {
            return 'discount';
        }
        return 'other';
    };

    const getTransactionBadge = (type) => {
        switch(type) {
            case 'invoice':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Factura</Badge>;
            case 'payment':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pago</Badge>;
            case 'discount':
                return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Descuento</Badge>;
            default:
                return <Badge variant="outline">Otro</Badge>;
        }
    };

    const getAmountDisplay = (tx) => {
        const type = getTransactionType(tx.description);
        const debitAmount = Number(tx.debit || 0);
        const creditAmount = Number(tx.credit || 0);
        
        if (entityType === 'cliente') {
            // Para clientes: débito = cargo (factura), crédito = abono (pago)
            if (debitAmount > 0) {
                return {
                    amount: debitAmount,
                    color: 'text-red-600',
                    sign: '+',
                    type: 'cargo'
                };
            } else if (creditAmount > 0) {
                return {
                    amount: creditAmount,
                    color: 'text-green-600',
                    sign: '-',
                    type: 'abono'
                };
            }
        } else {
            // Para proveedores: crédito = cargo (factura), débito = abono (pago)
            if (creditAmount > 0) {
                return {
                    amount: creditAmount,
                    color: 'text-red-600',
                    sign: '+',
                    type: 'cargo'
                };
            } else if (debitAmount > 0) {
                return {
                    amount: debitAmount,
                    color: 'text-green-600',
                    sign: '-',
                    type: 'abono'
                };
            }
        }
        
        return {
            amount: 0,
            color: 'text-gray-500',
            sign: '',
            type: 'neutro'
        };
    };

    const balanceText = entityType === 'cliente' ? 'Saldo por Cobrar' : 'Saldo por Pagar';
    const actualBalance = Number(balance || 0);
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
            <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Estado de Cuenta: {entityName}
                    </CardTitle>
                    <CardDescription>
                        <div className="flex justify-between items-center mt-3">
                            <span className="text-gray-600">Historial detallado de transacciones</span>
                            <div className="text-right">
                                <span className="font-semibold text-gray-700">{balanceText}: </span>
                                <span className={`text-2xl font-bold ${balanceColor}`}>
                                    {formatCurrency(Math.abs(displayBalance), true)}
                                </span>
                            </div>
                        </div>
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="text-left p-4 font-semibold text-gray-700">Fecha</TableHead>
                                    <TableHead className="text-left p-4 font-semibold text-gray-700">Tipo</TableHead>
                                    <TableHead className="text-left p-4 font-semibold text-gray-700">Descripción</TableHead>
                                    <TableHead className="text-center p-4 font-semibold text-gray-700">Movimiento</TableHead>
                                    <TableHead className="text-right p-4 font-semibold text-gray-700">Monto</TableHead>
                                    <TableHead className="text-right p-4 font-semibold text-gray-700">Saldo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions && transactions.map((tx, index) => {
                                    const transactionType = getTransactionType(tx.description);
                                    const amountDisplay = getAmountDisplay(tx);
                                    
                                    return (
                                        <TableRow key={tx.transaction_id || index} className="border-b hover:bg-gray-50 transition-colors">
                                            <TableCell className="p-4 font-medium text-gray-900">
                                                {formatDate(tx.date)}
                                            </TableCell>
                                            <TableCell className="p-4">
                                                {getTransactionBadge(transactionType)}
                                            </TableCell>
                                            <TableCell className="p-4 max-w-xs">
                                                <div className="text-gray-900 font-medium">
                                                    {tx.description}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {transactionType === 'invoice' ? 'Nuevo cargo en la cuenta' :
                                                     transactionType === 'payment' ? 'Pago aplicado a la cuenta' :
                                                     transactionType === 'discount' ? 'Descuento aplicado' : 'Movimiento'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-4 text-center">
                                                <Badge variant={amountDisplay.type === 'cargo' ? 'destructive' : 'default'} className="text-xs">
                                                    {amountDisplay.type === 'cargo' ? 'Cargo' : 
                                                     amountDisplay.type === 'abono' ? 'Abono' : 'Neutro'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={`p-4 text-right font-bold text-lg ${amountDisplay.color}`}>
                                                {amountDisplay.sign}{formatCurrency(amountDisplay.amount)}
                                            </TableCell>
                                            <TableCell className="p-4 text-right font-bold text-lg text-gray-900">
                                                {formatCurrency(Math.abs(tx.balance || 0), true)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    {(!transactions || transactions.length === 0) && (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-lg font-medium">Sin transacciones</div>
                            <div className="text-sm mt-2">No se encontraron transacciones para esta entidad.</div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default StatementView;
