import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const FabricInventoryList = ({ fabricInventory, onEdit, onDelete }) => {
    const getStockBadgeVariant = (metraje) => {
        if (metraje <= 0) return "destructive";
        if (metraje < 10) return "default"; 
        return "secondary";
    };
    const formatDisplayValue = (value) => {
        return value != null ? Math.round(value).toLocaleString('es') : '-';
    };
    const formatDecimalValue = (value) => {
        return value != null ? Number(value).toFixed(2) : '-';
    };


    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha Ing.</TableHead>
                        <TableHead>Cód. Rollo</TableHead>
                        <TableHead>Nombre Tela</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead className="text-right">Metraje Saldo</TableHead>
                        <TableHead className="text-right">Ancho (cm)</TableHead>
                        <TableHead className="text-right">Precio/m</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead className="text-right">Total Tela</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fabricInventory.length === 0 && (
                        <TableRow>
                            <TableCell colSpan="11" className="text-center py-8 text-gray-500">
                                No hay telas registradas en el inventario.
                            </TableCell>
                        </TableRow>
                    )}
                    {fabricInventory.map(fabric => (
                        <TableRow key={fabric.id} className="hover:bg-gray-50">
                            <TableCell>{new Date(fabric.fecha_ingreso + 'T00:00:00').toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{fabric.codigo_rollo}</TableCell>
                            <TableCell>{fabric.nombre_tela}</TableCell>
                            <TableCell>{fabric.color}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={getStockBadgeVariant(fabric.metraje_saldo)} className="px-2 py-1 text-xs">
                                    {formatDecimalValue(fabric.metraje_saldo)}m
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">{fabric.ancho_tela ? `${formatDisplayValue(fabric.ancho_tela)}cm` : '-'}</TableCell>
                            <TableCell className="text-right">{fabric.precio_metro ? `${formatDisplayValue(fabric.precio_metro)}` : '-'}</TableCell>
                            <TableCell>{fabric.proveedor_nombre || 'N/A'}</TableCell>
                            <TableCell className="text-right font-semibold">{fabric.total_tela ? `${formatDisplayValue(fabric.total_tela)}` : '-'}</TableCell>
                            <TableCell className="max-w-[150px] truncate" title={fabric.notas}>{fabric.notas || '-'}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => onEdit(fabric)} className="text-blue-600 hover:text-blue-800">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete(fabric.id)} className="text-red-600 hover:text-red-800">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default FabricInventoryList;