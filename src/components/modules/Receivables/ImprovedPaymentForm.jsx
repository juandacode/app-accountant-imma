import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ImprovedPaymentForm = ({ isOpen, onOpenChange, onSubmit, invoices, customers }) => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentDistribution, setPaymentDistribution] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);

  // Filtrar facturas pendientes del cliente seleccionado
  const customerInvoices = selectedCustomer 
    ? invoices.filter(invoice => 
        invoice.cliente_id === parseInt(selectedCustomer) && 
        invoice.estado === 'Pendiente' && 
        (invoice.monto_total - (invoice.monto_pagado || 0)) > 0
      ).sort((a, b) => new Date(a.fecha_emision) - new Date(b.fecha_emision)) // Más antiguas primero
    : [];

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (paymentAmount > 0 && selectedInvoices.length > 0) {
      calculatePaymentDistribution();
    } else {
      setPaymentDistribution([]);
      setRemainingAmount(0);
    }
  }, [paymentAmount, selectedInvoices]);

  const resetForm = () => {
    setSelectedCustomer('');
    setSelectedInvoices([]);
    setPaymentAmount(0);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setPaymentDistribution([]);
    setRemainingAmount(0);
  };

  const calculatePaymentDistribution = () => {
    let remainingPayment = parseFloat(paymentAmount);
    const distribution = [];

    // Distribuir el pago empezando por las facturas más antiguas
    for (const invoiceId of selectedInvoices) {
      if (remainingPayment <= 0) break;
      
      const invoice = customerInvoices.find(inv => inv.id === invoiceId);
      if (!invoice) continue;
      
      const pendingAmount = invoice.monto_total - (invoice.monto_pagado || 0);
      const paymentForThisInvoice = Math.min(remainingPayment, pendingAmount);
      
      distribution.push({
        invoiceId: invoice.id,
        invoiceNumber: invoice.numero_factura,
        pendingAmount,
        paymentAmount: paymentForThisInvoice,
        willBePaidInFull: paymentForThisInvoice >= pendingAmount
      });
      
      remainingPayment -= paymentForThisInvoice;
    }

    setPaymentDistribution(distribution);
    setRemainingAmount(remainingPayment);
  };

  const handleInvoiceToggle = (invoiceId) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedCustomer || selectedInvoices.length === 0 || !paymentAmount || paymentAmount <= 0) {
      return;
    }

    // Crear pagos individuales para cada factura
    const payments = paymentDistribution.map(item => ({
      factura_venta_id: item.invoiceId,
      monto_pago: item.paymentAmount,
      fecha_pago: paymentDate,
      descripcion_pago: description || `Pago distribución automática`
    }));

    onSubmit(payments);
  };

  const totalPendingAmount = selectedInvoices.reduce((sum, invoiceId) => {
    const invoice = customerInvoices.find(inv => inv.id === invoiceId);
    return sum + (invoice ? (invoice.monto_total - (invoice.monto_pagado || 0)) : 0);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Pago Mejorado</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Selección de Cliente */}
          <div>
            <Label htmlFor="customer">Cliente</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={String(customer.id)}>
                    {customer.nombre_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Facturas del Cliente */}
          {selectedCustomer && (
            <div>
              <Label>Facturas Pendientes del Cliente</Label>
              {customerInvoices.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Este cliente no tiene facturas pendientes.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {customerInvoices.map(invoice => {
                    const pendingAmount = invoice.monto_total - (invoice.monto_pagado || 0);
                    const isSelected = selectedInvoices.includes(invoice.id);
                    
                    return (
                      <Card 
                        key={invoice.id} 
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
                        onClick={() => handleInvoiceToggle(invoice.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{invoice.numero_factura}</div>
                              <div className="text-sm text-gray-500">
                                Fecha: {invoice.fecha_emision}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">${pendingAmount.toFixed(2)}</div>
                              <Badge variant={isSelected ? "default" : "outline"}>
                                {isSelected ? "Seleccionada" : "Pendiente"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Monto del Pago */}
          {selectedInvoices.length > 0 && (
            <>
              <div>
                <Label htmlFor="amount">Monto del Pago</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Total pendiente seleccionado: ${totalPendingAmount.toFixed(2)}
                </div>
              </div>

              {/* Distribución del Pago */}
              {paymentDistribution.length > 0 && (
                <div>
                  <Label>Distribución del Pago</Label>
                  <div className="space-y-2 mt-2">
                    {paymentDistribution.map(item => (
                      <Card key={item.invoiceId}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{item.invoiceNumber}</div>
                              <div className="text-sm text-gray-500">
                                Pendiente: ${item.pendingAmount.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">
                                ${item.paymentAmount.toFixed(2)}
                              </div>
                              {item.willBePaidInFull && (
                                <div className="flex items-center text-sm text-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Pagada en total
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {remainingAmount > 0 && (
                    <Alert className="mt-3">
                      <DollarSign className="h-4 w-4" />
                      <AlertDescription>
                        Sobrante: ${remainingAmount.toFixed(2)} - Este monto no será aplicado a ninguna factura. 
                        Considera ajustar el monto del pago o seleccionar más facturas.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </>
          )}

          {/* Fecha y Descripción */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Fecha del Pago</Label>
              <Input
                id="date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Método de pago, referencia, etc."
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!selectedCustomer || selectedInvoices.length === 0 || !paymentAmount || paymentAmount <= 0}
          >
            Registrar Pago(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImprovedPaymentForm;