
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Eye, Search, CreditCard } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const FabricPurchaseInvoiceList = ({ 
  invoices, 
  onEdit, 
  onViewDetails, 
  onPayInvoice, 
  loading, 
  suppliers 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getSupplierName = (supplierId) => {
    const supplier = suppliers?.find(s => s.id === supplierId);
    return supplier ? supplier.nombre_proveedor : 'Sin proveedor';
  };

  const getStatusBadge = (estado, formaPago) => {
    if (estado === 'Pagada') {
      return <Badge variant="default" className="bg-green-500">Pagada</Badge>;
    }
    if (formaPago === 'Crédito') {
      return <Badge variant="destructive">Pendiente (Crédito)</Badge>;
    }
    return <Badge variant="secondary">Pendiente</Badge>;
  };

  const getPaymentBadge = (formaPago) => {
    const colors = {
      'Efectivo': 'bg-green-100 text-green-800',
      'Transferencia': 'bg-blue-100 text-blue-800',
      'Crédito': 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[formaPago] || 'bg-gray-100 text-gray-800'}>{formaPago}</Badge>;
  };

  const filteredInvoices = invoices?.filter(invoice =>
    invoice.numero_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSupplierName(invoice.proveedor_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.descripcion_factura?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatCurrency = (value) => {
    return `$${Math.round(value || 0).toLocaleString('es')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00Z').toLocaleDateString('es-ES');
  };

  const handlePayInvoice = (invoice) => {
    if (invoice.estado === 'Pagada') {
      toast({ 
        title: "Información", 
        description: "Esta factura ya está pagada.",
        variant: "default"
      });
      return;
    }
    if (invoice.forma_pago !== 'Crédito') {
      toast({ 
        title: "Información", 
        description: "Solo se pueden pagar facturas registradas a crédito.",
        variant: "default"
      });
      return;
    }
    onPayInvoice(invoice);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando facturas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Facturas de Compra de Tela</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar facturas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron facturas de compra de tela.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Factura</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Forma de Pago</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.numero_factura}</TableCell>
                    <TableCell>{formatDate(invoice.fecha_emision)}</TableCell>
                    <TableCell>{getSupplierName(invoice.proveedor_id)}</TableCell>
                    <TableCell>{getPaymentBadge(invoice.forma_pago)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(invoice.monto_total)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.estado, invoice.forma_pago)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(invoice)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(invoice)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {invoice.forma_pago === 'Crédito' && invoice.estado === 'Pendiente' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePayInvoice(invoice)}
                            className="bg-green-600 hover:bg-green-700"
                            title="Pagar factura"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FabricPurchaseInvoiceList;
