import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';

const MovementForm = ({ isOpen, onOpenChange, onSubmit, products }) => {
  const [movementForm, setMovementForm] = useState({
    producto_id: '',
    tipo_movimiento: 'entrada',
    cantidad: 0,
    descripcion_movimiento: ''
  });

  useEffect(() => {
    if (!isOpen) {
      setMovementForm({ producto_id: '', tipo_movimiento: 'entrada', cantidad: 0, descripcion_movimiento: '' });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(movementForm);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          <TrendingUp className="h-4 w-4 mr-2" />
          Registrar Movimiento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Movimiento de Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="producto_id">Producto</Label>
            <Select value={movementForm.producto_id} onValueChange={(value) => 
              setMovementForm({...movementForm, producto_id: value})
            } required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={String(product.id)}>
                    {product.nombre} (Stock: {product.cantidad_actual})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tipo_movimiento">Tipo de Movimiento</Label>
            <Select value={movementForm.tipo_movimiento} onValueChange={(value) => 
              setMovementForm({...movementForm, tipo_movimiento: value})
            } required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="salida">Salida</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              value={movementForm.cantidad}
              onChange={(e) => setMovementForm({...movementForm, cantidad: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="descripcion_movimiento">Descripción</Label>
            <Input
              id="descripcion_movimiento"
              value={movementForm.descripcion_movimiento}
              onChange={(e) => setMovementForm({...movementForm, descripcion_movimiento: e.target.value})}
              placeholder="Motivo del movimiento"
            />
          </div>
          <Button type="submit" className="w-full">
            Registrar Movimiento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MovementForm;