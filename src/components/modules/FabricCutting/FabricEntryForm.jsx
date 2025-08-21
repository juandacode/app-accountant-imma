
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { PackagePlus } from 'lucide-react';

const FabricEntryForm = ({ isOpen, onOpenChange, onSubmit, editingFabricEntry, suppliers, paymentMethods }) => {
  const getInitialFormState = () => ({
    fecha_ingreso: new Date().toLocaleDateString('en-CA'),
    codigo_rollo: '',
    nombre_tela: '',
    color: '',
    metraje_saldo: '', 
    ancho_tela: '',
    precio_metro: '',
    proveedor_id: '',
    total_tela: 0,
    notas: '',
    metodo_pago: '',
  });

  const [form, setForm] = useState(getInitialFormState());

  useEffect(() => {
    if (isOpen) {
        if (editingFabricEntry) {
          setForm({
            ...getInitialFormState(), 
            ...editingFabricEntry,
            fecha_ingreso: editingFabricEntry.fecha_ingreso ? new Date(editingFabricEntry.fecha_ingreso + 'T00:00:00Z').toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'),
            proveedor_id: editingFabricEntry.proveedor_id ? String(editingFabricEntry.proveedor_id) : '',
            metraje_saldo: editingFabricEntry.metraje_saldo || '',
            ancho_tela: editingFabricEntry.ancho_tela || '',
            precio_metro: editingFabricEntry.precio_metro || '',
            total_tela: editingFabricEntry.total_tela || 0,
            metodo_pago: editingFabricEntry.metodo_pago || '',
          });
        } else {
          setForm(getInitialFormState());
        }
    }
  }, [editingFabricEntry, isOpen]);

  useEffect(() => {
    const metraje = parseFloat(form.metraje_saldo);
    const precio = parseFloat(form.precio_metro);
    const total = (metraje > 0 && precio > 0) ? metraje * precio : 0;
    setForm(prev => ({ ...prev, total_tela: total }));
  }, [form.metraje_saldo, form.precio_metro]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(form.metraje_saldo) <= 0) {
        toast({ title: "Error", description: "El metraje debe ser mayor a cero.", variant: "destructive" });
        return;
    }
    if (!form.metodo_pago) {
        toast({ title: "Error", description: "Debe seleccionar un método de pago.", variant: "destructive" });
        return;
    }
     if (!form.fecha_ingreso) {
      toast({ title: "Error de Validación", description: "La fecha de ingreso es obligatoria.", variant: "destructive" });
      return;
    }
    const dataToSubmit = {
        ...form,
        fecha_ingreso: form.fecha_ingreso,
        metraje_saldo: parseFloat(form.metraje_saldo),
        ancho_tela: form.ancho_tela ? parseFloat(form.ancho_tela) : null,
        precio_metro: parseFloat(form.precio_metro),
        total_tela: parseFloat(form.total_tela),
        proveedor_id: (form.proveedor_id && form.proveedor_id !== 'none') ? parseInt(form.proveedor_id) : null,
    };
    onSubmit(dataToSubmit);
  };
  
  const formatCurrency = (value) => {
     return Math.round(value).toLocaleString('es');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
            setForm(getInitialFormState());
        }
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingFabricEntry ? 'Editar Compra de Tela' : 'Registrar Compra de Tela'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fabric_entry_fecha_ingreso">Fecha Ingreso</Label>
              <Input id="fabric_entry_fecha_ingreso" name="fecha_ingreso" type="date" value={form.fecha_ingreso} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="fabric_entry_codigo_rollo">Código Rollo</Label>
              <Input id="fabric_entry_codigo_rollo" name="codigo_rollo" value={form.codigo_rollo} onChange={handleChange} required placeholder="Ej: R001-AZUL" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fabric_entry_nombre_tela">Nombre Tela</Label>
              <Input id="fabric_entry_nombre_tela" name="nombre_tela" value={form.nombre_tela} onChange={handleChange} required placeholder="Ej: Lino Flex" />
            </div>
            <div>
              <Label htmlFor="fabric_entry_color">Color</Label>
              <Input id="fabric_entry_color" name="color" value={form.color} onChange={handleChange} required placeholder="Ej: Azul Oscuro" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fabric_entry_metraje_saldo">Metraje Ingresado</Label>
              <Input id="fabric_entry_metraje_saldo" name="metraje_saldo" type="number" step="0.01" value={form.metraje_saldo} onChange={handleChange} required placeholder="Metros" />
            </div>
            <div>
              <Label htmlFor="fabric_entry_ancho_tela">Ancho Tela (Opcional)</Label>
              <Input id="fabric_entry_ancho_tela" name="ancho_tela" type="number" step="0.01" value={form.ancho_tela} onChange={handleChange} placeholder="Metros" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <Label htmlFor="fabric_entry_precio_metro">Precio x Metro</Label>
              <Input id="fabric_entry_precio_metro" name="precio_metro" type="number" step="0.01" value={form.precio_metro} onChange={handleChange} required placeholder="COP" />
            </div>
             <div>
              <Label htmlFor="fabric_entry_metodo_pago">Método de Pago</Label>
              <Select name="metodo_pago" value={form.metodo_pago} onValueChange={(value) => handleSelectChange('metodo_pago', value)} required>
                <SelectTrigger id="fabric_entry_metodo_pago"><SelectValue placeholder="Seleccionar método..." /></SelectTrigger>
                <SelectContent>
                  {paymentMethods && paymentMethods.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="fabric_entry_proveedor_id">Proveedor (Opcional)</Label>
            <Select name="proveedor_id" value={form.proveedor_id} onValueChange={(value) => handleSelectChange('proveedor_id', value)}>
              <SelectTrigger id="fabric_entry_proveedor_id"><SelectValue placeholder="Seleccionar proveedor..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguno</SelectItem>
                {suppliers && suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={String(supplier.id)}>{supplier.nombre_proveedor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fabric_entry_total_tela">Total Compra Tela</Label>
            <Input id="fabric_entry_total_tela" name="total_tela" value={`$${formatCurrency(form.total_tela)}`} readOnly className="font-bold bg-gray-100" />
          </div>

          <div>
            <Label htmlFor="fabric_entry_notas">Notas (Opcional)</Label>
            <Textarea id="fabric_entry_notas" name="notas" value={form.notas} onChange={handleChange} placeholder="Detalles adicionales sobre la tela o la compra..." />
          </div>
          
          <DialogFooter>
            <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                <PackagePlus className="mr-2 h-4 w-4" />
                {editingFabricEntry ? 'Actualizar Compra' : 'Registrar Compra'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FabricEntryForm;
