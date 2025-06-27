
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const PartnerForm = ({ isOpen, onOpenChange, onSubmit, editingPartner }) => {
  const initialFormState = {
    nombre_socio: '',
    cedula_socio: '',
    telefono: '',
    email: '',
    direccion: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    porcentaje_participacion: '',
    notas: ''
  };
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
        if (editingPartner) {
            setForm({
                nombre_socio: editingPartner.nombre_socio || '',
                cedula_socio: editingPartner.cedula_socio || '',
                telefono: editingPartner.telefono || '',
                email: editingPartner.email || '',
                direccion: editingPartner.direccion || '',
                fecha_ingreso: editingPartner.fecha_ingreso || new Date().toISOString().split('T')[0],
                porcentaje_participacion: editingPartner.porcentaje_participacion || '',
                notas: editingPartner.notas || ''
            });
        } else {
            setForm(initialFormState);
        }
    }
  }, [editingPartner, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre_socio) {
      return;
    }
    onSubmit({ 
      ...form, 
      porcentaje_participacion: form.porcentaje_participacion ? parseFloat(form.porcentaje_participacion) : null 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>{editingPartner ? 'Editar Socio' : 'Nuevo Socio'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="nombre_socio">Nombre del Socio *</Label>
                    <Input
                        id="nombre_socio"
                        value={form.nombre_socio}
                        onChange={(e) => setForm({ ...form, nombre_socio: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="cedula_socio">Cédula/ID</Label>
                    <Input
                        id="cedula_socio"
                        value={form.cedula_socio}
                        onChange={(e) => setForm({ ...form, cedula_socio: e.target.value })}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                        id="telefono"
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                    id="direccion"
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="fecha_ingreso">Fecha de Ingreso</Label>
                    <Input
                        id="fecha_ingreso"
                        type="date"
                        value={form.fecha_ingreso}
                        onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="porcentaje_participacion">% Participación</Label>
                    <Input
                        id="porcentaje_participacion"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={form.porcentaje_participacion}
                        onChange={(e) => setForm({ ...form, porcentaje_participacion: e.target.value })}
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                    id="notas"
                    value={form.notas}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                    placeholder="Información adicional sobre el socio..."
                />
            </div>
            <DialogFooter>
                <Button type="submit" className="w-full">
                {editingPartner ? 'Actualizar Socio' : 'Registrar Socio'}
                </Button>
            </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
};

export default PartnerForm;
