
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ContributionForm = ({ isOpen, onOpenChange, onSubmit, editingContribution, partners }) => {
  const initialFormState = {
    nombre_socio: '',
    monto_aporte: '',
    fecha_aporte: new Date().toISOString().split('T')[0],
    tipo_ingreso: 'Efectivo'
  };
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
        if (editingContribution) {
            setForm({
                nombre_socio: editingContribution.nombre_socio || '',
                monto_aporte: editingContribution.monto_aporte || '',
                fecha_aporte: editingContribution.fecha_aporte || new Date().toISOString().split('T')[0],
                tipo_ingreso: editingContribution.tipo_ingreso || 'Efectivo'
            });
        } else {
            setForm(initialFormState);
        }
    }
  }, [editingContribution, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre_socio || !form.monto_aporte || !form.fecha_aporte || !form.tipo_ingreso) {
      return;
    }
    onSubmit({ ...form, monto_aporte: parseFloat(form.monto_aporte) });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{editingContribution ? 'Editar Aporte Social' : 'Nuevo Aporte Social'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="nombre_socio">Nombre del Socio</Label>
                {partners && partners.length > 0 ? (
                  <Select value={form.nombre_socio} onValueChange={(value) => setForm({ ...form, nombre_socio: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar socio" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map(partner => (
                        <SelectItem key={partner.id} value={partner.nombre_socio}>
                          {partner.nombre_socio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="nombre_socio"
                    value={form.nombre_socio}
                    onChange={(e) => setForm({ ...form, nombre_socio: e.target.value })}
                    placeholder="Ingresa el nombre del socio"
                    required
                  />
                )}
            </div>
            <div>
                <Label htmlFor="monto_aporte">Monto del Aporte</Label>
                <Input
                id="monto_aporte"
                type="number"
                step="0.01"
                min="0.01"
                value={form.monto_aporte}
                onChange={(e) => setForm({ ...form, monto_aporte: e.target.value })}
                required
                />
            </div>
            <div>
                <Label htmlFor="tipo_ingreso">Tipo de Ingreso</Label>
                <Select value={form.tipo_ingreso} onValueChange={(value) => setForm({ ...form, tipo_ingreso: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Banco">Banco</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="fecha_aporte">Fecha del Aporte</Label>
                <Input
                id="fecha_aporte"
                type="date"
                value={form.fecha_aporte}
                onChange={(e) => setForm({ ...form, fecha_aporte: e.target.value })}
                required
                />
            </div>
            <DialogFooter>
                <Button type="submit" className="w-full">
                {editingContribution ? 'Actualizar Aporte' : 'Registrar Aporte'}
                </Button>
            </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
};

export default ContributionForm;
