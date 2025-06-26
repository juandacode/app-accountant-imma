import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const FabricCutForm = ({ isOpen, onOpenChange, onSubmit, fabricInventory }) => {
    const initialFormState = {
        tela_inventario_id: '',
        referencia_corte: '',
        metros_cortados: '',
        observaciones: ''
    };
    const [formData, setFormData] = useState(initialFormState);
    const [selectedFabricStock, setSelectedFabricStock] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormState);
            setSelectedFabricStock(null);
        }
    }, [isOpen]);
    
    const handleSelectFabric = (value) => {
        const fabricId = parseInt(value);
        setFormData(prev => ({ ...prev, tela_inventario_id: String(fabricId) }));
        const fabric = fabricInventory.find(f => f.id === fabricId);
        setSelectedFabricStock(fabric ? fabric.metraje_saldo : null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.tela_inventario_id || !formData.metros_cortados) {
            toast({ title: "Campos requeridos", description: "Debes seleccionar una tela y especificar los metros a cortar.", variant: "destructive" });
            return;
        }
        if (parseFloat(formData.metros_cortados) <= 0) {
            toast({ title: "Valor inválido", description: "Los metros a cortar deben ser un número positivo.", variant: "destructive" });
            return;
        }
        onSubmit(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Salida de Tela a Corte</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="tela_inventario_id">Tela (Referencia - Color - Rollo)</Label>
                        <Select onValueChange={handleSelectFabric} value={formData.tela_inventario_id}>
                            <SelectTrigger id="tela_inventario_id">
                                <SelectValue placeholder="Seleccionar tela del inventario..." />
                            </SelectTrigger>
                            <SelectContent>
                                {fabricInventory.map(fabric => (
                                    <SelectItem key={fabric.id} value={String(fabric.id)}>
                                        {fabric.nombre_tela} - {fabric.color} (Rollo: {fabric.codigo_rollo}) - Saldo: {fabric.metraje_saldo}m
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedFabricStock !== null && (
                            <p className="text-sm text-gray-500 mt-1">Stock disponible: {selectedFabricStock} metros</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="referencia_corte">Referencia de Corte (Opcional)</Label>
                        <Input id="referencia_corte" name="referencia_corte" value={formData.referencia_corte} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="metros_cortados">Cantidad a Cortar (metros)*</Label>
                        <Input type="number" step="0.01" id="metros_cortados" name="metros_cortados" value={formData.metros_cortados} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="observaciones">Observaciones</Label>
                        <Textarea id="observaciones" name="observaciones" value={formData.observaciones} onChange={handleChange} />
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit}>Registrar Corte</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FabricCutForm;