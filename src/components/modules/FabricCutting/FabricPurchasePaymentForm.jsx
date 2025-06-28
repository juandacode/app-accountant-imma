
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { CreditCard } from 'lucide-react';

const FabricPurchasePaymentForm = ({ isOpen, onOpenChange, onSubmit, invoice, suppliers }) => {
  const [form, setForm] = useState({
    monto_pago: '',
    fecha_pago: new Date().toLocaleDateString('en-CA'),
    descripcion_pago: ''
  });

  useEffect(() => {
    if (isOpen && invoice) {
      const pendingAmount = (invoice.monto_total || 0) - (invoice.monto_pagado || 0);
      setForm({
        monto_pago: pendingAmount.toString(),
        fecha_pago: new Date().toLocaleDateString('en-CA'),
        descripcion_pago: `Pago de factura ${invoice.numero_factura}`
      });
    }
  }, [isOpen, invoice]);

  const getSupplierName = () => {
    if (!invoice?.proveedor_id) return 'Sin proveedor';
    const supplier = suppliers?.find(s => s.id === invoice.proveedor_id);
    return supplier ? supplier.nombre_proveedor : 'Sin proveedor';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const montoPago = parseFloat(form.monto_pago);
    const pendingAmount = (invoice.monto_total || 0) - (invoice.monto_pagado || 0);
    
    if (montoPago <= 0) {
      toast({ title: "Error", description: "El monto del pago debe ser mayor a cero.", variant: "destructive" });
      return;
    }
    
    if (montoPago > pendingAmount) {
      toast({ title: "Error", description: `El monto no puede ser mayor al saldo pendiente ($${Math.round(pendingAmount).toLocaleString('es')}).`, variant: "destructive" });
      return;
    }

    const dataToSubmit = {
      factura_compra_tela_id: invoice.id,
      monto_pago: montoPago,
      fecha_pago: form.fecha_pago,
      descripcion_pago: form.descripcion_pago || `Pago de factura ${invoice.numero_factura}`
    };

    onSubmit(dataToSubmit);
  };

  const formatCurrency = (value) => {
    return `$${Math.round(value || 0).toLocaleString('es')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00Z').toLocaleDateString('es-ES');
  };

  const pendingAmount = invoice ? (invoice.monto_total || 0) - (invoice.monto_pagado || 0) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Pago de Factura</DialogTitle>
        </DialogHeader>
        
        {invoice && (
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Factura:</span>
                  <p>{invoice.numero_factura}</p>
                </div>
                <div>
                  <span className="font-medium">Fecha:</span>
                  <p>{formatDate(invoice.fecha_emision)}</p>
                </div>
                <div>
                  <span className="font-medium">Proveedor:</span>
                  <p>{getSupplierName()}</p>
                </div>
                <div>
                  <span className="font-medium">Total:</span>
                  <p className="font-semibold">{formatCurrency(invoice.monto_total)}</p>
                </div>
                <div>
                  <span className="font-medium">Pagado:</span>
                  <p>{formatCurrency(invoice.monto_pagado)}</p>
                </div>
                <div>
                  <span className="font-medium">Pendiente:</span>
                  <p className="font-semibold text-red-600">{formatCurrency(pendingAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monto_pago">Monto del Pago</Label>
              <Input 
                id="monto_pago" 
                name="monto_pago" 
                type="number" 
                step="0.01" 
                value={form.monto_pago} 
                onChange={handleChange} 
                required 
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="fecha_pago">Fecha del Pago</Label>
              <Input 
                id="fecha_pago" 
                name="fecha_pago" 
                type="date" 
                value={form.fecha_pago} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="descripcion_pago">Descripción del Pago</Label>
            <Textarea 
              id="descripcion_pago" 
              name="descripcion_pago" 
              value={form.descripcion_pago} 
              onChange={handleChange} 
              placeholder="Descripción del pago..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <CreditCard className="mr-2 h-4 w-4" />
              Registrar Pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FabricPurchasePaymentForm;
