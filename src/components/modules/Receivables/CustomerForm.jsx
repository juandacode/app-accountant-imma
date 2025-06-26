import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users } from 'lucide-react';

const CustomerForm = ({ isOpen, onOpenChange, onSubmit, editingCustomer }) => {
  const [form, setForm] = useState({
    nombre_completo: '',
    cedula_id: '',
    ciudad: '',
    direccion: ''
  });

  useEffect(() => {
    if (editingCustomer) {
      setForm({
        nombre_completo: editingCustomer.nombre_completo || '',
        cedula_id: editingCustomer.cedula_id || '',
        ciudad: editingCustomer.ciudad || '',
        direccion: editingCustomer.direccion || ''
      });
    } else {
      setForm({ nombre_completo: '', cedula_id: '', ciudad: '', direccion: '' });
    }
  }, [editingCustomer, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Users className="h-4 w-4 mr-2" />
          {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre_completo">Nombre Completo</Label>
            <Input id="nombre_completo" value={form.nombre_completo} onChange={(e) => setForm({...form, nombre_completo: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="cedula_id">Cédula/ID</Label>
            <Input id="cedula_id" value={form.cedula_id} onChange={(e) => setForm({...form, cedula_id: e.target.value})} required />
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
            {editingCustomer ? 'Actualizar' : 'Crear'} Cliente
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default CustomerForm;