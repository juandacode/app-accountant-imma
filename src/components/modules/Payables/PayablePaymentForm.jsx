import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';

const PayablePaymentForm = ({ isOpen, onOpenChange, onSubmit, pendingInvoices }) => {
  const [form, setForm] = useState({
    factura_compra_id: '',
    monto_pago: 0,
    fecha_pago: new Date().toISOString().split('T')[0],
    descripcion_pago: ''
  });

  useEffect(() => {
    if (!isOpen) {
       setForm({ factura_compra_id: '', monto_pago: 0, fecha_pago: new Date().toISOString().split('T')[0], descripcion_pago: '' });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
          <DollarSign className="h-4 w-4 mr-2" />
          Registrar Pago
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Registrar Pago Realizado</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="factura_compra_id">Factura de Compra</Label>
            <Select value={form.factura_compra_id} onValueChange={(value) => setForm({...form, factura_compra_id: value})} required>
              <SelectTrigger><SelectValue placeholder="Seleccionar factura" /></SelectTrigger>
              <SelectContent>
                {pendingInvoices.map(invoice => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    {invoice.numero_factura} - {invoice.supplierName} (Pendiente: ${(invoice.monto_total - (invoice.monto_pagado || 0)).toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="monto_pago">Monto</Label>
            <Input id="monto_pago" type="number" step="0.01" min="0.01" value={form.monto_pago} onChange={(e) => setForm({...form, monto_pago: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="fecha_pago">Fecha</Label>
            <Input id="fecha_pago" type="date" value={form.fecha_pago} onChange={(e) => setForm({...form, fecha_pago: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="descripcion_pago">Descripción</Label>
            <Input id="descripcion_pago" value={form.descripcion_pago} onChange={(e) => setForm({...form, descripcion_pago: e.target.value})} placeholder="Método de pago, referencia, etc." />
          </div>
          <Button type="submit" className="w-full">Registrar Pago</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default PayablePaymentForm;