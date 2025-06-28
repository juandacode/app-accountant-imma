
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ShoppingCart, Percent } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const PurchaseInvoiceForm = ({ isOpen, onOpenChange, onSubmit, editingInvoice, suppliers, products, nextInvoiceNumber }) => {
  // Formas de pago restringidas a solo 3 opciones
  const paymentMethods = ['Crédito', 'Efectivo', 'Transferencia'];

  const getInitialFormState = () => ({
    numero_factura: '',
    proveedor_id: '',
    fecha_emision: new Date().toLocaleDateString('en-CA'),
    fecha_vencimiento: '',
    forma_pago: '',
    descripcion_factura: '',
    descuento: 0,
  });

  const [form, setForm] = useState(getInitialFormState());
  const [selectedSupplierDetails, setSelectedSupplierDetails] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ producto_id: '', cantidad: 1, costo_unitario: 0, subtotal: 0 });

  useEffect(() => {
    if (isOpen) {
        if (editingInvoice) {
          setForm({
            numero_factura: editingInvoice.numero_factura || '',
            proveedor_id: String(editingInvoice.proveedor_id) || '',
            fecha_emision: editingInvoice.fecha_emision ? new Date(editingInvoice.fecha_emision + 'T00:00:00Z').toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'),
            fecha_vencimiento: editingInvoice.fecha_vencimiento ? new Date(editingInvoice.fecha_vencimiento + 'T00:00:00Z').toLocaleDateString('en-CA') : '',
            forma_pago: editingInvoice.forma_pago || '',
            descripcion_factura: editingInvoice.descripcion_factura || '',
            descuento: editingInvoice.descuento || 0,
          });
          const supplier = suppliers.find(s => s.id === editingInvoice.proveedor_id);
          setSelectedSupplierDetails(supplier);
          setInvoiceItems(editingInvoice.items || []);
        } else {
          setForm({ ...getInitialFormState(), numero_factura: nextInvoiceNumber });
          setSelectedSupplierDetails(null);
          setInvoiceItems([]);
        }
    } else {
       setForm(getInitialFormState());
    }
  }, [editingInvoice, isOpen, suppliers, nextInvoiceNumber]);

  useEffect(() => {
    const subtotal = currentItem.cantidad * currentItem.costo_unitario;
    setCurrentItem(prev => ({ ...prev, subtotal }));
  }, [currentItem.cantidad, currentItem.costo_unitario]);

  const handleSupplierChange = (supplierId) => {
    setForm({...form, proveedor_id: supplierId});
    const supplier = suppliers.find(s => s.id === parseInt(supplierId));
    setSelectedSupplierDetails(supplier);
  };

  const handleProductSelectionChange = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      setCurrentItem(prev => ({ 
        ...prev, 
        producto_id: productId, 
        costo_unitario: product.costo_predeterminado || 0 
      }));
    }
  };
  
  const handleAddItem = () => {
    if (!currentItem.producto_id || currentItem.cantidad <= 0 || currentItem.costo_unitario <= 0) {
      toast({ title: "Error", description: "Selecciona un producto e ingresa cantidad y costo válidos.", variant: "destructive" });
      return;
    }
    const product = products.find(p => p.id === parseInt(currentItem.producto_id));
    if (!product) {
        toast({ title: "Error", description: "Producto no encontrado.", variant: "destructive" });
        return;
    }

    setInvoiceItems([...invoiceItems, { ...currentItem, productName: product.nombre, productSku: product.sku }]);
    setCurrentItem({ producto_id: '', cantidad: 1, costo_unitario: 0, subtotal: 0 });
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
            {editingInvoice ? 'Editar Factura de Compra' : 'Nueva Factura de Compra'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <Label htmlFor="payables_proveedor_id">Proveedor</Label>
                <Select value={String(form.proveedor_id)} onValueChange={handleSupplierChange} required>
                    <SelectTrigger id="payables_proveedor_id"><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
                    <SelectContent>
                    {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={String(supplier.id)}>{supplier.nombre_proveedor}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
                <div>
                <Label htmlFor="payables_numero_factura">Número de Factura</Label>
                <Input id="payables_numero_factura" value={form.numero_factura} readOnly />
                </div>
            </div>

            {selectedSupplierDetails && (
                <div className="p-3 bg-gray-100 rounded-md text-sm">
                <p><strong>Cédula Fiscal:</strong> {selectedSupplierDetails.cedula_fiscal}</p>
                <p><strong>Ciudad:</strong> {selectedSupplierDetails.ciudad}</p>
                <p><strong>Dirección:</strong> {selectedSupplierDetails.direccion}</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <Label htmlFor="payables_fecha_emision">Fecha de Emisión</Label>
                <Input id="payables_fecha_emision" type="date" value={form.fecha_emision} onChange={(e) => setForm({...form, fecha_emision: e.target.value})} required />
                </div>
                <div>
                <Label htmlFor="payables_fecha_vencimiento">Fecha de Vencimiento</Label>
                <Input id="payables_fecha_vencimiento" type="date" value={form.fecha_vencimiento} onChange={(e) => setForm({...form, fecha_vencimiento: e.target.value})} />
                </div>
            </div>
            <div>
                <Label htmlFor="payables_forma_pago">Forma de Pago</Label>
                <Select value={form.forma_pago} onValueChange={(value) => setForm({...form, forma_pago: value})} required>
                <SelectTrigger id="payables_forma_pago"><SelectValue placeholder="Seleccionar forma de pago" /></SelectTrigger>
                <SelectContent>
                    {paymentMethods.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="payables_descripcion_factura">Descripción General (Opcional)</Label>
                <Input id="payables_descripcion_factura" value={form.descripcion_factura} onChange={(e) => setForm({...form, descripcion_factura: e.target.value})} placeholder="Notas adicionales de la factura" />
            </div>

            <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-2">Líneas de Detalle</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end mb-3">
                <div className="md:col-span-2">
                    <Label htmlFor="payables_item_producto_id">Producto</Label>
                    <Select value={String(currentItem.producto_id)} onValueChange={handleProductSelectionChange}>
                    <SelectTrigger id="payables_item_producto_id"><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                    <SelectContent>
                        {products.map(product => (
                        <SelectItem key={product.id} value={String(product.id)}>{product.nombre} ({product.sku})</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="payables_item_cantidad">Cantidad</Label>
                    <Input id="payables_item_cantidad" type="number" min="1" value={currentItem.cantidad} onChange={(e) => setCurrentItem({...currentItem, cantidad: parseInt(e.target.value) || 1})} />
                </div>
                <div>
                    <Label htmlFor="payables_item_costo_unitario">Costo Unit.</Label>
                    <Input id="payables_item_costo_unitario" type="number" step="0.01" min="0" value={currentItem.costo_unitario} onChange={(e) => setCurrentItem({...currentItem, costo_unitario: parseFloat(e.target.value) || 0})} />
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
                        <p className="text-sm text-gray-600">{item.cantidad} x ${Math.round(item.costo_unitario)} = ${Math.round(item.subtotal)}</p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                    ))}
                </div>
                )}
            </div>

            <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-end items-center gap-2">
                    <Label htmlFor="payables_descuento" className="text-right">Descuento Total:</Label>
                    <Input 
                        id="payables_descuento" 
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

export default PurchaseInvoiceForm;
