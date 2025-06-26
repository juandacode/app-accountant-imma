import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

const ExpenseForm = ({ isOpen, onOpenChange, onSubmit, editingExpense, setEditingExpense, categories }) => {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    categoria: '',
    monto: ""
  });

  useEffect(() => {
    if (editingExpense) {
      setForm({
        fecha: editingExpense.fecha,
        descripcion: editingExpense.descripcion,
        categoria: editingExpense.categoria,
        monto: String(editingExpense.monto)
      });
    } else {
      resetForm();
    }
  }, [editingExpense, isOpen]);

  const resetForm = () => {
    setForm({
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      categoria: '',
      monto: ""
    });
  };

  const handleOpenChange = (open) => {
    onOpenChange(open);
    if (!open) {
      setEditingExpense(null);
      resetForm();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const expenseData = {
      fecha: form.fecha,
      descripcion: form.descripcion,
      categoria: form.categoria,
      monto: Number(form.monto)
    };
    onSubmit(expenseData, !!editingExpense);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Gasto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({...form, fecha: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
              placeholder="Describe el gasto"
              required
            />
          </div>
          <div>
            <Label htmlFor="categoria">Categoría</Label>
            <Select value={form.categoria} onValueChange={(value) => 
              setForm({...form, categoria: value})
            } required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="monto">Monto</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              min="0.01"
              value={form.monto}
              onChange={(e) => setForm({...form, monto: e.target.value})}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            {editingExpense ? 'Actualizar' : 'Registrar'} Gasto
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseForm;