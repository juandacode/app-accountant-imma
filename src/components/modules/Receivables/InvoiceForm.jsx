import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ShoppingCart, Percent } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const InvoiceForm = ({ isOpen, onOpenChange, onSubmit, editingInvoice, customers, products, nextInvoiceNumber }) => {
  // Formas de pago restringidas a solo 3 opciones
  const paymentMethods = ['Crédito', 'Efectivo', 'Transferencia'];

  const getInitialFormState = () => ({
    numero_factura: '',
    cliente_id: '',
    fecha_emision: new Date().toLocaleDateString('en-CA'),
    fecha_vencimiento: '',
    forma_pago: '',
    descripcion_factura: '',
    descuento: 0,
  });
  
  const [form, setForm] = useState(getInitialFormState());
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ producto_id: '', cantidad: 1, precio_unitario: 0, subtotal: 0 });

  useEffect(() => {
    if (isOpen) {
        if (editingInvoice) {
          setForm({
            numero_factura: editingInvoice.numero_factura || '',
            cliente_id: String(editingInvoice.cliente_id) || '',
            fecha_emision: editingInvoice.fecha_emision ? new Date(editingInvoice.fecha_emision + 'T00:00:00Z').toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'),
            fecha_vencimiento: editingInvoice.fecha_vencimiento ? new Date(editingInvoice.fecha_vencimiento + 'T00:00:00Z').toLocaleDateString('en-CA') : '',
            forma_pago: editingInvoice.forma_pago || '',
            descripcion_factura: editingInvoice.descripcion_factura || '',
            descuento: editingInvoice.descuento || 0,
          });
          const customer = customers.find(c => c.id === editingInvoice.cliente_id);
          setSelectedCustomerDetails(customer);
          setInvoiceItems(editingInvoice.items || []);
        } else {
          setForm({ ...getInitialFormState(), numero_factura: nextInvoiceNumber });
          setSelectedCustomerDetails(null);
          setInvoiceItems([]);
        }
    } else {
       setForm(getInitialFormState());
    }
  }, [editingInvoice, isOpen, customers, nextInvoiceNumber]);

  useEffect(() => {
    const subtotal = currentItem.cantidad * currentItem.precio_unitario;
    setCurrentItem(prev => ({ ...prev, subtotal }));
  }, [currentItem.cantidad, currentItem.precio_unitario]);

  const handleCustomerChange = (customerId) => {
    setForm({...form, cliente_id: customerId});
    const customer = customers.find(c => c.id === parseInt(customerId));
    setSelectedCustomerDetails(customer);
  };

  const handleProductSelectionChange = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      setCurrentItem(prev => ({ 
        ...prev, 
        producto_id: productId, 
        precio_unitario: product.precio_venta_predeterminado || 0 
      }));
    }
  };
  
  const handleAddItem = () => {
    if (!currentItem.producto_id || currentItem.cantidad <= 0 || currentItem.precio_unitario <= 0) {
      toast({ title: "Error", description: "Selecciona un producto e ingresa cantidad y precio válidos.", variant: "destructive" });
      return;
    }
    const product = products.find(p => p.id === parseInt(currentItem.producto_id));
    if (!product) {
        toast({ title: "Error", description: "Producto no encontrado.", variant: "destructive" });
        return;
    }
    if (parseInt(currentItem.cantidad) > product.cantidad_actual && !editingInvoice) {
        toast({ title: "Error", description: `Stock insuficiente para ${product.nombre}. Disponible: ${product.cantidad_actual}`, variant: "destructive" });
        return;
    }

    // CORREGIR: Asegurar que el producto tenga cantidad_actual válida
    if (product.cantidad_actual === null || product.cantidad_actual === undefined) {
        toast({ title: "Error", description: `El producto ${product.nombre} no tiene cantidad en stock definida. Actualice el inventario primero.`, variant: "destructive" });
        return;
    }

    setInvoiceItems([...invoiceItems, { ...currentItem, productName: product.nombre, productSku: product.sku }]);
    setCurrentItem({ producto_id: '', cantidad: 1, precio_unitario: 0, subtotal: 0 });
  };

  const handleRemoveItem = (index) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (invoiceItems.length === 0) {
      toast({ title: "Error", description: "Debes agregar al menos un producto a la factura.", variant: "destructive" });
      return;
    }
     if (!form.fecha_emision) {
      toast({ title: "Error de Validación", description: "La fecha de emisión es obligatoria.", variant: "destructive" });
      return;
    }
    const subtotalItems = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);
    const montoTotal = subtotalItems - (parseFloat(form.descuento) || 0);

    const dataToSubmit = {
      ...form,
      fecha_emision: form.fecha_emision,
      fecha_vencimiento: form.fecha_vencimiento || null,
      monto_total: montoTotal,
      descuento: parseFloat(form.descuento) || 0,
    };
    onSubmit(dataToSubmit, invoiceItems);
  };

  const subtotalGeneral = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalFactura = subtotalGeneral - (parseFloat(form.descuento) || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-screen max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingInvoice ? 'Editar Factura de Venta' : 'Nueva Factura de Venta'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <Label htmlFor="receivables_cliente_id">Cliente</Label>
                <Select value={String(form.cliente_id)} onValueChange={handleCustomerChange} required>
                    <SelectTrigger id="receivables_cliente_id"><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                    <SelectContent>
                    {customers.map(customer => (
                        <SelectItem key={customer.id} value={String(customer.id)}>{customer.nombre_completo}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
                <div>
                <Label htmlFor="receivables_numero_factura">Número de Factura</Label>
                <Input id="receivables_numero_factura" value={form.numero_factura} readOnly />
                </div>
            </div>

            {selectedCustomerDetails && (
                <div className="p-3 bg-gray-100 rounded-md text-sm">
                <p><strong>Cédula/ID:</strong> {selectedCustomerDetails.cedula_id}</p>
                <p><strong>Ciudad:</strong> {selectedCustomerDetails.ciudad}</p>
                <p><strong>Dirección:</strong> {selectedCustomerDetails.direccion}</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <Label htmlFor="receivables_fecha_emision">Fecha de Emisión</Label>
                <Input id="receivables_fecha_emision" type="date" value={form.fecha_emision} onChange={(e) => setForm({...form, fecha_emision: e.target.value})} required />
                </div>
                <div>
                <Label htmlFor="receivables_fecha_vencimiento">Fecha de Vencimiento</Label>
                <Input id="receivables_fecha_vencimiento" type="date" value={form.fecha_vencimiento} onChange={(e) => setForm({...form, fecha_vencimiento: e.target.value})} />
                </div>
            </div>
            <div>
                <Label htmlFor="receivables_forma_pago">Forma de Pago</Label>
                <Select value={form.forma_pago} onValueChange={(value) => setForm({...form, forma_pago: value})} required>
                <SelectTrigger id="receivables_forma_pago"><SelectValue placeholder="Seleccionar forma de pago" /></SelectTrigger>
                <SelectContent>
                    {paymentMethods.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="receivables_descripcion_factura">Descripción General (Opcional)</Label>
                <Input id="receivables_descripcion_factura" value={form.descripcion_factura} onChange={(e) => setForm({...form, descripcion_factura: e.target.value})} placeholder="Notas adicionales de la factura" />
            </div>

            <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-2">Líneas de Detalle</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end mb-3">
                <div className="md:col-span-2">
                    <Label htmlFor="receivables_item_producto_id">Producto</Label>
                    <Select value={String(currentItem.producto_id)} onValueChange={handleProductSelectionChange}>
                    <SelectTrigger id="receivables_item_producto_id"><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                    <SelectContent>
                        {products.map(product => (
                        <SelectItem key={product.id} value={String(product.id)}>{product.nombre} ({product.sku}) - Stock: {product.cantidad_actual}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="receivables_item_cantidad">Cantidad</Label>
                    <Input id="receivables_item_cantidad" type="number" min="1" value={currentItem.cantidad} onChange={(e) => setCurrentItem({...currentItem, cantidad: parseInt(e.target.value) || 1})} />
                </div>
                <div>
                    <Label htmlFor="receivables_item_precio_unitario">Precio Unit.</Label>
                    <Input id="receivables_item_precio_unitario" type="number" step="0.01" min="0" value={currentItem.precio_unitario} onChange={(e) => setCurrentItem({...currentItem, precio_unitario: parseFloat(e.target.value) || 0})} />
                </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center mb-4">
                    <div>
                        <Label>Subtotal Línea</Label>
                        <Input value={`${Math.round(currentItem.subtotal)}`} readOnly className="font-semibold" />
                    </div>
                    <div className="md:col-start-4 flex justify-end">
                        <Button type="button" onClick={handleAddItem} className="mt-4 bg-green-500 hover:bg-green-600">
                            <Plus className="h-4 w-4 mr-2" />Añadir Producto
                        </Button>
                    </div>
                </div>

                {invoiceItems.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Productos en Factura:</h4>
                    {invoiceItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                        <p className="font-semibold">{item.productName} ({item.productSku})</p>
                        <p className="text-sm text-gray-600">{item.cantidad} x ${Math.round(item.precio_unitario)} = ${Math.round(item.subtotal)}</p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                    ))}
                </div>
                )}
            </div>

            <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-end items-center gap-2">
                    <Label htmlFor="receivables_descuento" className="text-right">Descuento Total:</Label>
                    <Input 
                        id="receivables_descuento" 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        value={form.descuento} 
                        onChange={(e) => setForm({...form, descuento: parseFloat(e.target.value) || 0})} 
                        className="w-32"
                        placeholder="0"
                    />
                    <Percent className="h-4 w-4 text-gray-500" />
                </div>
                <div className="text-right font-semibold">Subtotal General: ${Math.round(subtotalGeneral)}</div>
            </div>

            <button type="submit" style={{ display: 'none' }}>Submit</button>
            </form>
        </div>
        <DialogFooter className="pt-4 border-t mt-auto">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-bold">Total Factura: ${Math.round(totalFactura)}</div>
                <Button onClick={handleSubmit} className="w-auto">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {editingInvoice ? 'Actualizar' : 'Crear'} Factura
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceForm;
