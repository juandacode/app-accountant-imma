
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';

const PaymentForm = ({ isOpen, onOpenChange, onSubmit, invoices }) => {
  const [form, setForm] = useState({
    factura_venta_id: '',
    monto_pago: 0,
    fecha_pago: new Date().toISOString().split('T')[0],
    descripcion_pago: ''
  });

  useEffect(() => {
    if (!isOpen) {
       setForm({ factura_venta_id: '', monto_pago: 0, fecha_pago: new Date().toISOString().split('T')[0], descripcion_pago: '' });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.factura_venta_id || !form.monto_pago || form.monto_pago <= 0) {
      return;
    }
    onSubmit(form);
  };

  // CORREGIR: Filtrar solo facturas pendientes o con saldo pendiente
  const pendingInvoices = (invoices || []).filter(invoice => 
    invoice.estado === 'Pendiente' && 
    (invoice.monto_total - (invoice.monto_pagado || 0)) > 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Registrar Pago Recibido</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="factura_venta_id">Factura</Label>
            <Select value={form.factura_venta_id} onValueChange={(value) => setForm({...form, factura_venta_id: value})} required>
              <SelectTrigger><SelectValue placeholder="Seleccionar factura" /></SelectTrigger>
              <SelectContent>
                {pendingInvoices.map(invoice => (
                  <SelectItem key={invoice.id} value={String(invoice.id)}>
                    {invoice.numero_factura} - {invoice.customerName} (Pendiente: ${Math.round((invoice.monto_total - (invoice.monto_pagado || 0)))})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="monto_pago">Monto</Label>
            <Input id="monto_pago" type="number" step="0.01" min="0.01" value={form.monto_pago} onChange={(e) => setForm({...form, monto_pago: parseFloat(e.target.value) || 0})} required />
          </div>
          <div>
            <Label htmlFor="fecha_pago">Fecha</Label>
            <Input id="fecha_pago" type="date" value={form.fecha_pago} onChange={(e) => setForm({...form, fecha_pago: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="descripcion_pago">Descripción</Label>
            <Input id="descripcion_pago" value={form.descripcion_pago} onChange={(e) => setForm({...form, descripcion_pago: e.target.value})} placeholder="Método de pago, referencia, etc." />
          </div>
        </form>
        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full">Registrar Pago</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default PaymentForm;
