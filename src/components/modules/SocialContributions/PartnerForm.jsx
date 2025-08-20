
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const PartnerForm = ({ isOpen, onOpenChange, onSubmit, editingPartner }) => {
  const initialFormState = {
    nombre_socio: '',
    fecha_ingreso: new Date().toISOString().split('T')[0]
  };
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
        if (editingPartner) {
            setForm({
                nombre_socio: editingPartner.nombre_socio || '',
                fecha_ingreso: editingPartner.fecha_ingreso || new Date().toISOString().split('T')[0]
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
    onSubmit(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>{editingPartner ? 'Editar Socio' : 'Nuevo Socio'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="nombre_socio">Nombre del Socio *</Label>
                    <Input
                        id="nombre_socio"
                        value={form.nombre_socio}
                        onChange={(e) => setForm({ ...form, nombre_socio: e.target.value })}
                        required
                        placeholder="Ingrese el nombre completo del socio"
                    />
                </div>
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
                <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                        <strong>Nota:</strong> El reparto de ganancias se realizará de forma equitativa entre todos los socios al final del año fiscal, 
                        basado en el capital total aportado por cada socio.
                    </p>
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
