
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { PackagePlus, Plus, Trash2 } from 'lucide-react';

const FabricPurchaseInvoiceForm = ({ isOpen, onOpenChange, onSubmit, editingInvoice, suppliers }) => {
  const getInitialFormState = () => ({
    numero_factura: '',
    proveedor_id: '',
    fecha_emision: new Date().toLocaleDateString('en-CA'),
    fecha_vencimiento: '',
    forma_pago: '',
    descripcion_factura: '',
    detalles: [{
      codigo_rollo: '',
      nombre_tela: '',
      color: '',
      metraje_cantidad: '',
      ancho_tela: '',
      precio_metro: '',
      subtotal: 0,
      notas: ''
    }]
  });

  const [form, setForm] = useState(getInitialFormState());
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');

  const paymentMethods = ['Crédito', 'Efectivo', 'Transferencia'];

  useEffect(() => {
    if (isOpen && !editingInvoice) {
      fetchNextInvoiceNumber();
    }
  }, [isOpen, editingInvoice]);

  useEffect(() => {
    if (isOpen) {
      if (editingInvoice) {
        setForm({
          ...editingInvoice,
          fecha_emision: editingInvoice.fecha_emision ? new Date(editingInvoice.fecha_emision + 'T00:00:00Z').toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'),
          fecha_vencimiento: editingInvoice.fecha_vencimiento ? new Date(editingInvoice.fecha_vencimiento + 'T00:00:00Z').toLocaleDateString('en-CA') : '',
          proveedor_id: editingInvoice.proveedor_id ? String(editingInvoice.proveedor_id) : '',
          detalles: editingInvoice.detalles || [getInitialFormState().detalles[0]]
        });
      } else {
        setForm(getInitialFormState());
      }
    }
  }, [editingInvoice, isOpen]);

  const fetchNextInvoiceNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_fabric_purchase_invoice_number');
      if (error) throw error;
      setNextInvoiceNumber(data);
      setForm(prev => ({ ...prev, numero_factura: data }));
    } catch (error) {
      console.error('Error fetching next invoice number:', error);
    }
  };

  const calculateSubtotal = (metraje, precio) => {
    const metrajeParsed = parseFloat(metraje) || 0;
    const precioParsed = parseFloat(precio) || 0;
    return metrajeParsed * precioParsed;
  };

  const calculateTotal = () => {
    return form.detalles.reduce((total, detalle) => total + (detalle.subtotal || 0), 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDetalleChange = (index, field, value) => {
    setForm(prev => {
      const newDetalles = [...prev.detalles];
      newDetalles[index] = { ...newDetalles[index], [field]: value };
      
      if (field === 'metraje_cantidad' || field === 'precio_metro') {
        newDetalles[index].subtotal = calculateSubtotal(
          newDetalles[index].metraje_cantidad,
          newDetalles[index].precio_metro
        );
      }
      
      return { ...prev, detalles: newDetalles };
    });
  };

  const addDetalle = () => {
    setForm(prev => ({
      ...prev,
      detalles: [...prev.detalles, {
        codigo_rollo: '',
        nombre_tela: '',
        color: '',
        metraje_cantidad: '',
        ancho_tela: '',
        precio_metro: '',
        subtotal: 0,
        notas: ''
      }]
    }));
  };

  const removeDetalle = (index) => {
    if (form.detalles.length > 1) {
      setForm(prev => ({
        ...prev,
        detalles: prev.detalles.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.forma_pago) {
      toast({ title: "Error", description: "Debe seleccionar un método de pago.", variant: "destructive" });
      return;
    }

    const hasValidDetalles = form.detalles.some(detalle => 
      detalle.codigo_rollo && detalle.nombre_tela && detalle.color && 
      parseFloat(detalle.metraje_cantidad) > 0 && parseFloat(detalle.precio_metro) > 0
    );

    if (!hasValidDetalles) {
      toast({ title: "Error", description: "Debe agregar al menos un detalle válido de tela.", variant: "destructive" });
      return;
    }

    const dataToSubmit = {
      ...form,
      proveedor_id: form.proveedor_id ? parseInt(form.proveedor_id) : null,
      monto_total: calculateTotal(),
      detalles: form.detalles.filter(detalle => 
        detalle.codigo_rollo && detalle.nombre_tela && detalle.color
      ).map(detalle => ({
        ...detalle,
        metraje_cantidad: parseFloat(detalle.metraje_cantidad),
        ancho_tela: detalle.ancho_tela ? parseFloat(detalle.ancho_tela) : null,
        precio_metro: parseFloat(detalle.precio_metro),
        subtotal: detalle.subtotal
      }))
    };

    onSubmit(dataToSubmit);
  };

  const formatCurrency = (value) => {
    return Math.round(value).toLocaleString('es');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setForm(getInitialFormState());
      }
    }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingInvoice ? 'Editar Factura de Compra de Tela' : 'Nueva Factura de Compra de Tela'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Datos de la Factura */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos de la Factura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="numero_factura">Número de Factura</Label>
                  <Input 
                    id="numero_factura" 
                    name="numero_factura" 
                    value={form.numero_factura} 
                    onChange={handleChange} 
                    required 
                    readOnly={!editingInvoice}
                    className={!editingInvoice ? "bg-gray-100" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="fecha_emision">Fecha de Emisión</Label>
                  <Input 
                    id="fecha_emision" 
                    name="fecha_emision" 
                    type="date" 
                    value={form.fecha_emision} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                  <Input 
                    id="fecha_vencimiento" 
                    name="fecha_vencimiento" 
                    type="date" 
                    value={form.fecha_vencimiento} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proveedor_id">Proveedor</Label>
                  <Select name="proveedor_id" value={form.proveedor_id} onValueChange={(value) => handleSelectChange('proveedor_id', value)}>
                    <SelectTrigger id="proveedor_id">
                      <SelectValue placeholder="Seleccionar proveedor..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ninguno</SelectItem>
                      {suppliers && suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={String(supplier.id)}>{supplier.nombre_proveedor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="forma_pago">Forma de Pago</Label>
                  <Select name="forma_pago" value={form.forma_pago} onValueChange={(value) => handleSelectChange('forma_pago', value)} required>
                    <SelectTrigger id="forma_pago">
                      <SelectValue placeholder="Seleccionar forma de pago..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="descripcion_factura">Descripción de la Factura</Label>
                <Textarea 
                  id="descripcion_factura" 
                  name="descripcion_factura" 
                  value={form.descripcion_factura} 
                  onChange={handleChange} 
                  placeholder="Descripción general de la compra..." 
                />
              </div>
            </CardContent>
          </Card>

          {/* Detalles de Tela */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Detalles de Tela</CardTitle>
              <Button type="button" onClick={addDetalle} size="sm" className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-1" />
                Agregar Tela
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.detalles.map((detalle, index) => (
                <Card key={index} className="border-2 border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <h4 className="font-medium">Tela #{index + 1}</h4>
                    {form.detalles.length > 1 && (
                      <Button type="button" onClick={() => removeDetalle(index)} size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Código Rollo</Label>
                        <Input 
                          value={detalle.codigo_rollo} 
                          onChange={(e) => handleDetalleChange(index, 'codigo_rollo', e.target.value)}
                          placeholder="Ej: R001-AZUL"
                          required
                        />
                      </div>
                      <div>
                        <Label>Nombre Tela</Label>
                        <Input 
                          value={detalle.nombre_tela} 
                          onChange={(e) => handleDetalleChange(index, 'nombre_tela', e.target.value)}
                          placeholder="Ej: Lino Flex"
                          required
                        />
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Input 
                          value={detalle.color} 
                          onChange={(e) => handleDetalleChange(index, 'color', e.target.value)}
                          placeholder="Ej: Azul Oscuro"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <Label>Metraje</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          value={detalle.metraje_cantidad} 
                          onChange={(e) => handleDetalleChange(index, 'metraje_cantidad', e.target.value)}
                          placeholder="Metros"
                          required
                        />
                      </div>
                      <div>
                        <Label>Ancho (Opcional)</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          value={detalle.ancho_tela} 
                          onChange={(e) => handleDetalleChange(index, 'ancho_tela', e.target.value)}
                          placeholder="Metros"
                        />
                      </div>
                      <div>
                        <Label>Precio x Metro</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          value={detalle.precio_metro} 
                          onChange={(e) => handleDetalleChange(index, 'precio_metro', e.target.value)}
                          placeholder="COP"
                          required
                        />
                      </div>
                      <div>
                        <Label>Subtotal</Label>
                        <Input 
                          value={`$${formatCurrency(detalle.subtotal)}`} 
                          readOnly 
                          className="font-bold bg-gray-100"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Notas (Opcional)</Label>
                      <Textarea 
                        value={detalle.notas} 
                        onChange={(e) => handleDetalleChange(index, 'notas', e.target.value)}
                        placeholder="Detalles adicionales sobre esta tela..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Total */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total de la Factura:</span>
                <span className="text-green-600">${formatCurrency(calculateTotal())}</span>
              </div>
            </CardContent>
          </Card>
          
          <DialogFooter>
            <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <PackagePlus className="mr-2 h-4 w-4" />
              {editingInvoice ? 'Actualizar Factura' : 'Crear Factura'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FabricPurchaseInvoiceForm;
