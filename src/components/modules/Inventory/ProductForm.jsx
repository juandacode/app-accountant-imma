import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

const ProductForm = ({ isOpen, onOpenChange, onSubmit, editingProduct }) => {
  const [productForm, setProductForm] = useState({
    nombre: '',
    sku: '', // Cambiado de 'sku' a 'referencia' en la etiqueta
    descripcion: '',
    cantidad_actual: 0,
    costo_predeterminado: 0,
    precio_venta_predeterminado: 0,
  });

  useEffect(() => {
    if (editingProduct) {
      setProductForm({
        nombre: editingProduct.nombre || '',
        sku: editingProduct.sku || '',
        descripcion: editingProduct.descripcion || '',
        cantidad_actual: editingProduct.cantidad_actual || 0,
        costo_predeterminado: editingProduct.costo_predeterminado || 0,
        precio_venta_predeterminado: editingProduct.precio_venta_predeterminado || 0,
      });
    } else {
      setProductForm({ nombre: '', sku: '', descripcion: '', cantidad_actual: 0, costo_predeterminado: 0, precio_venta_predeterminado: 0 });
    }
  }, [editingProduct, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(productForm);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sku" className="text-right">Referencia</Label>
            <Input
              id="sku"
              value={productForm.sku}
              onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nombre" className="text-right">Nombre</Label>
            <Input
              id="nombre"
              value={productForm.nombre}
              onChange={(e) => setProductForm({...productForm, nombre: e.target.value})}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="descripcion" className="text-right">Descripción</Label>
            <Input
              id="descripcion"
              value={productForm.descripcion}
              onChange={(e) => setProductForm({...productForm, descripcion: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cantidad_actual" className="text-right">Cantidad Inicial</Label>
            <Input
              id="cantidad_actual"
              type="number"
              min="0"
              value={productForm.cantidad_actual}
              onChange={(e) => setProductForm({...productForm, cantidad_actual: parseInt(e.target.value) || 0})}
              className="col-span-3"
              required
              disabled={!!editingProduct} 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="costo_predeterminado" className="text-right">Costo Predet.</Label>
            <Input
              id="costo_predeterminado"
              type="number"
              min="0"
              step="0.01"
              value={productForm.costo_predeterminado}
              onChange={(e) => setProductForm({...productForm, costo_predeterminado: parseFloat(e.target.value) || 0})}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="precio_venta_predeterminado" className="text-right">Precio Venta</Label>
            <Input
              id="precio_venta_predeterminado"
              type="number"
              min="0"
              step="0.01"
              value={productForm.precio_venta_predeterminado}
              onChange={(e) => setProductForm({...productForm, precio_venta_predeterminado: parseFloat(e.target.value) || 0})}
              className="col-span-3"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;