import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const FabricCutList = ({ fabricCuts, onDelete }) => {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha Corte</TableHead>
                        <TableHead>Tela (Nombre - Color)</TableHead>
                        <TableHead>Rollo</TableHead>
                        <TableHead>Referencia Corte</TableHead>
                        <TableHead className="text-right">Metros Cortados</TableHead>
                        <TableHead>Observaciones</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fabricCuts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan="7" className="text-center py-8 text-gray-500">
                                No hay registros de cortes de tela.
                            </TableCell>
                        </TableRow>
                    )}
                    {fabricCuts.map(cut => (
                        <TableRow key={cut.id} className="hover:bg-gray-50">
                            <TableCell>{new Date(cut.fecha_corte + 'T00:00:00').toLocaleDateString()}</TableCell>
                            <TableCell>{cut.tela_nombre} - {cut.tela_color}</TableCell>
                            <TableCell className="font-mono text-xs">{cut.tela_codigo_rollo}</TableCell>
                            <TableCell>{cut.referencia_corte || '-'}</TableCell>
                            <TableCell className="text-right font-semibold">{Number(cut.metros_cortados).toFixed(2)}m</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={cut.observaciones}>{cut.observaciones || '-'}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => onDelete(cut.id)} className="text-red-600 hover:text-red-800">
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

export default FabricCutList;