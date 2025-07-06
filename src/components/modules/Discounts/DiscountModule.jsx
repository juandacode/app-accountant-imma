import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Percent, Search } from 'lucide-react';

const DiscountModule = ({ invoiceType = 'venta', isOpen, onOpenChange }) => {
  const { supabase } = useSupabase();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const tableName = invoiceType === 'venta' ? 'facturas_venta' : 'facturas_compra';
  const relatedTable = invoiceType === 'venta' ? 'clientes' : 'proveedores';
  const nameField = invoiceType === 'venta' ? 'nombre_completo' : 'nombre_proveedor';

  useEffect(() => {
    if (isOpen) {
      fetchPendingInvoices();
    }
  }, [isOpen, invoiceType]);

  const fetchPendingInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          *,
          ${relatedTable}(${nameField})
        `)
        .eq('estado', 'Pendiente')
        .order('fecha_emision', { ascending: false });

      if (error) throw error;

      const processedInvoices = (data || []).map(invoice => ({
        ...invoice,
        clientName: invoice[relatedTable]?.[nameField] || 'Sin nombre'
      }));

      setInvoices(processedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({ title: "Error", description: `No se pudieron cargar las facturas: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!selectedInvoice || discountAmount <= 0) {
      toast({ title: "Error", description: "Selecciona una factura e ingresa un descuento válido.", variant: "destructive" });
      return;
    }

    try {
      const invoice = invoices.find(inv => inv.id === parseInt(selectedInvoice));
      if (!invoice) {
        toast({ title: "Error", description: "Factura no encontrada.", variant: "destructive" });
        return;
      }

      // Validar que el descuento no sea mayor al monto total
      const currentDiscount = invoice.descuento || 0;
      const maxDiscount = invoice.monto_total - currentDiscount;
      
      if (discountAmount > maxDiscount) {
        toast({ title: "Error", description: `El descuento no puede ser mayor a $${Math.round(maxDiscount)}`, variant: "destructive" });
        return;
      }

      const newDiscount = currentDiscount + discountAmount;
      const newTotal = invoice.monto_total - newDiscount;

      // Actualizar la factura con el nuevo descuento
      const { error } = await supabase
        .from(tableName)
        .update({ 
          descuento: newDiscount,
          monto_total: newTotal
        })
        .eq('id', parseInt(selectedInvoice));

      if (error) throw error;

      // Registrar la transacción del descuento
      const transactionType = invoiceType === 'venta' ? 'EGRESO_DESCUENTO_VENTA' : 'INGRESO_DESCUENTO_COMPRA';
      const description = `Descuento aplicado a factura ${invoice.numero_factura}`;
      
      await supabase.rpc('registrar_transaccion_caja', {
        p_tipo_transaccion: transactionType,
        p_descripcion: description,
        p_monto: discountAmount,
        p_referencia_id: parseInt(selectedInvoice),
        p_referencia_tabla: tableName
      });

      toast({ title: "Éxito", description: "Descuento aplicado correctamente." });
      
      // Limpiar formulario y refrescar datos
      setSelectedInvoice('');
      setDiscountAmount(0);
      fetchPendingInvoices();
      
    } catch (error) {
      console.error('Error applying discount:', error);
      toast({ title: "Error", description: `No se pudo aplicar el descuento: ${error.message}`, variant: "destructive" });
    }
  };

  const formatCurrency = (value) => `$${Math.round(value || 0).toLocaleString('es')}`;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00Z').toLocaleDateString('es-ES');
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.numero_factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedInvoiceData = invoices.find(inv => inv.id === parseInt(selectedInvoice));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            <Percent className="h-5 w-5 mr-2 inline" />
            Aplicar Descuento - {invoiceType === 'venta' ? 'Facturas de Venta' : 'Facturas de Compra'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto space-y-6">
          {/* Buscar facturas */}
          <Card>
            <CardHeader>
              <CardTitle>Buscar Factura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por número de factura o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-select">Seleccionar Factura</Label>
                  <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
                    <SelectTrigger id="invoice-select">
                      <SelectValue placeholder="Seleccionar factura pendiente" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredInvoices.map(invoice => (
                        <SelectItem key={invoice.id} value={invoice.id.toString()}>
                          {invoice.numero_factura} - {invoice.clientName} - {formatCurrency(invoice.monto_total)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="discount-amount">Monto del Descuento</Label>
                  <Input
                    id="discount-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {selectedInvoiceData && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Detalles de la Factura Seleccionada</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Número:</strong> {selectedInvoiceData.numero_factura}</p>
                      <p><strong>{invoiceType === 'venta' ? 'Cliente' : 'Proveedor'}:</strong> {selectedInvoiceData.clientName}</p>
                      <p><strong>Fecha:</strong> {formatDate(selectedInvoiceData.fecha_emision)}</p>
                    </div>
                    <div>
                      <p><strong>Monto Original:</strong> {formatCurrency(selectedInvoiceData.monto_total)}</p>
                      <p><strong>Descuento Actual:</strong> {formatCurrency(selectedInvoiceData.descuento || 0)}</p>
                      <p><strong>Nuevo Total:</strong> {formatCurrency(selectedInvoiceData.monto_total - discountAmount)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de facturas pendientes */}
          <Card>
            <CardHeader>
              <CardTitle>Facturas Pendientes ({filteredInvoices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No se encontraron facturas pendientes.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Factura</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>{invoiceType === 'venta' ? 'Cliente' : 'Proveedor'}</TableHead>
                        <TableHead>Monto Total</TableHead>
                        <TableHead>Descuento Actual</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow 
                          key={invoice.id}
                          className={selectedInvoice === invoice.id.toString() ? 'bg-blue-50' : ''}
                        >
                          <TableCell className="font-medium">{invoice.numero_factura}</TableCell>
                          <TableCell>{formatDate(invoice.fecha_emision)}</TableCell>
                          <TableCell>{invoice.clientName}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(invoice.monto_total)}</TableCell>
                          <TableCell>{formatCurrency(invoice.descuento || 0)}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Pendiente</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-gray-600">
              {selectedInvoiceData && discountAmount > 0 && (
                <span>Nuevo total: {formatCurrency(selectedInvoiceData.monto_total - discountAmount)}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleApplyDiscount}
                disabled={!selectedInvoice || discountAmount <= 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Percent className="h-4 w-4 mr-2" />
                Aplicar Descuento
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountModule;