
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Package } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const FabricPurchaseInvoiceForm = ({ isOpen, onOpenChange, onSubmit, editingInvoice, suppliers }) => {
  const [form, setForm] = useState({
    numero_factura: '',
    proveedor_id: '',
    fecha_emision: new Date().toLocaleDateString('en-CA'),
    fecha_vencimiento: '',
    forma_pago: '',
    descripcion_factura: ''
  });

  const [invoiceItems, setInvoiceItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    codigo_rollo: '',
    nombre_tela: '',
    color: '',
    metraje_cantidad: '',
    ancho_tela: '',
    precio_metro: '',
    notas: '',
    subtotal: 0
  });

  // Calcular subtotal cuando cambian cantidad o precio
  useEffect(() => {
    const subtotal = (parseFloat(currentItem.metraje_cantidad) || 0) * (parseFloat(currentItem.precio_metro) || 0);
    setCurrentItem(prev => ({ ...prev, subtotal }));
  }, [currentItem.metraje_cantidad, currentItem.precio_metro]);

  useEffect(() => {
    if (isOpen && !editingInvoice) {
      // Generar número de factura automáticamente con formato TELA-01
      const generateNextNumber = async () => {
        try {
          const timestamp = Date.now().toString().slice(-6);
          const paddedNumber = timestamp.padStart(2, '0');
          setForm(prev => ({
            ...prev,
            numero_factura: `TELA-${paddedNumber}`
          }));
        } catch (error) {
          console.error('Error generando número de factura:', error);
          setForm(prev => ({
            ...prev,
            numero_factura: `TELA-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`
          }));
        }
      };
      generateNextNumber();
    }
  }, [isOpen, editingInvoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (!currentItem.codigo_rollo || !currentItem.nombre_tela || !currentItem.color || 
        !currentItem.metraje_cantidad || !currentItem.precio_metro) {
      toast({ title: "Error", description: "Complete todos los campos requeridos del ítem.", variant: "destructive" });
      return;
    }

    if (parseFloat(currentItem.metraje_cantidad) <= 0 || parseFloat(currentItem.precio_metro) <= 0) {
      toast({ title: "Error", description: "Cantidad y precio deben ser mayores a cero.", variant: "destructive" });
      return;
    }

    setInvoiceItems([...invoiceItems, { ...currentItem }]);
    setCurrentItem({
      codigo_rollo: '',
      nombre_tela: '',
      color: '',
      metraje_cantidad: '',
      ancho_tela: '',
      precio_metro: '',
      notas: '',
      subtotal: 0
    });
  };

  const handleRemoveItem = (index) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.proveedor_id || !form.forma_pago) {
      toast({ title: "Error", description: "Complete todos los campos requeridos.", variant: "destructive" });
      return;
    }

    if (invoiceItems.length === 0) {
      toast({ title: "Error", description: "Debe agregar al menos un ítem de tela.", variant: "destructive" });
      return;
    }

    const montoTotal = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);

    const dataToSubmit = {
      ...form,
      fecha_emision: form.fecha_emision || null, // CORREGIR: Enviar NULL si está vacío
      fecha_vencimiento: form.fecha_vencimiento || null, // CORREGIR: Enviar NULL si está vacío
      monto_total: montoTotal,
      detalles: invoiceItems
    };

    onSubmit(dataToSubmit);
  };

  const subtotalGeneral = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nueva Factura de Compra de Tela</DialogTitle>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos de la factura */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Factura</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero_factura">Número de Factura</Label>
                  <Input
                    id="numero_factura"
                    name="numero_factura"
                    value={form.numero_factura}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="proveedor_id">Proveedor</Label>
                  <Select value={form.proveedor_id} onValueChange={(value) => setForm({...form, proveedor_id: value})} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.nombre_proveedor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <div>
                  <Label htmlFor="forma_pago">Forma de Pago</Label>
                  <Select value={form.forma_pago} onValueChange={(value) => setForm({...form, forma_pago: value})} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar forma de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Crédito">Crédito</SelectItem>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="descripcion_factura">Descripción</Label>
                  <Textarea
                    id="descripcion_factura"
                    name="descripcion_factura"
                    value={form.descripcion_factura}
                    onChange={handleChange}
                    placeholder="Descripción opcional..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Agregar ítems */}
            <Card>
              <CardHeader>
                <CardTitle>Agregar Tela</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="codigo_rollo">Código de Rollo</Label>
                    <Input
                      id="codigo_rollo"
                      name="codigo_rollo"
                      value={currentItem.codigo_rollo}
                      onChange={handleItemChange}
                      placeholder="Ej: R001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nombre_tela">Nombre de Tela</Label>
                    <Input
                      id="nombre_tela"
                      name="nombre_tela"
                      value={currentItem.nombre_tela}
                      onChange={handleItemChange}
                      placeholder="Ej: Algodón"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={currentItem.color}
                      onChange={handleItemChange}
                      placeholder="Ej: Azul"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label htmlFor="metraje_cantidad">Cantidad (metros)</Label>
                    <Input
                      id="metraje_cantidad"
                      name="metraje_cantidad"
                      type="number"
                      step="0.01"
                      value={currentItem.metraje_cantidad}
                      onChange={handleItemChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ancho_tela">Ancho (metros)</Label>
                    <Input
                      id="ancho_tela"
                      name="ancho_tela"
                      type="number"
                      step="0.01"
                      value={currentItem.ancho_tela}
                      onChange={handleItemChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="precio_metro">Precio por Metro</Label>
                    <Input
                      id="precio_metro"
                      name="precio_metro"
                      type="number"
                      step="0.01"
                      value={currentItem.precio_metro}
                      onChange={handleItemChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Subtotal</Label>
                    <Input
                      value={`$${Math.round(currentItem.subtotal).toLocaleString('es')}`}
                      readOnly
                      className="font-semibold"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="notas">Notas</Label>
                  <Textarea
                    id="notas"
                    name="notas"
                    value={currentItem.notas}
                    onChange={handleItemChange}
                    placeholder="Notas opcionales..."
                    rows={2}
                  />
                </div>
                <Button type="button" onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Tela
                </Button>
              </CardContent>
            </Card>

            {/* Lista de ítems */}
            {invoiceItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Telas en la Factura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {invoiceItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div className="grid grid-cols-5 gap-4 flex-grow">
                          <div>
                            <p className="font-semibold">{item.codigo_rollo}</p>
                            <p className="text-sm text-gray-600">{item.nombre_tela}</p>
                          </div>
                          <div>
                            <p className="font-medium">{item.color}</p>
                          </div>
                          <div>
                            <p>{item.metraje_cantidad}m</p>
                            {item.ancho_tela && <p className="text-sm text-gray-600">Ancho: {item.ancho_tela}m</p>}
                          </div>
                          <div>
                            <p>${Math.round(item.precio_metro).toLocaleString('es')}/m</p>
                          </div>
                          <div>
                            <p className="font-semibold">${Math.round(item.subtotal).toLocaleString('es')}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="w-full flex justify-between items-center">
            <div className="text-xl font-bold">
              Total: ${Math.round(subtotalGeneral).toLocaleString('es')}
            </div>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              <Package className="mr-2 h-4 w-4" />
              Crear Factura
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FabricPurchaseInvoiceForm;
