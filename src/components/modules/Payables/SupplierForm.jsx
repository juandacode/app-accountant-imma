import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building } from 'lucide-react';

const SupplierForm = ({ isOpen, onOpenChange, onSubmit, editingSupplier }) => {
  const [form, setForm] = useState({
    nombre_proveedor: '',
    cedula_fiscal: '',
    ciudad: '',
    direccion: ''
  });

  useEffect(() => {
    if (editingSupplier) {
      setForm({
        nombre_proveedor: editingSupplier.nombre_proveedor || '',
        cedula_fiscal: editingSupplier.cedula_fiscal || '',
        ciudad: editingSupplier.ciudad || '',
        direccion: editingSupplier.direccion || ''
      });
    } else {
      setForm({ nombre_proveedor: '', cedula_fiscal: '', ciudad: '', direccion: '' });
    }
  }, [editingSupplier, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Building className="h-4 w-4 mr-2" />
          {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre_proveedor">Nombre del Proveedor</Label>
            <Input id="nombre_proveedor" value={form.nombre_proveedor} onChange={(e) => setForm({...form, nombre_proveedor: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="cedula_fiscal">Cédula Fiscal/ID</Label>
            <Input id="cedula_fiscal" value={form.cedula_fiscal} onChange={(e) => setForm({...form, cedula_fiscal: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input id="ciudad" value={form.ciudad} onChange={(e) => setForm({...form, ciudad: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" value={form.direccion} onChange={(e) => setForm({...form, direccion: e.target.value})} />
          </div>
          <Button type="submit" className="w-full">
            {editingSupplier ? 'Actualizar' : 'Crear'} Proveedor
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default SupplierForm;