
import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Printer, Eye } from 'lucide-react';
import InvoiceTemplate from './InvoiceTemplate';

const PrintInvoices = () => {
  const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceTemplate, setShowInvoiceTemplate] = useState(false);
  const [invoiceType, setInvoiceType] = useState('venta');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabase && !supabaseLoading && !supabaseError) {
      fetchData();
    }
  }, [supabase, supabaseLoading, supabaseError]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAllInvoices(), fetchClients(), fetchSuppliers()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllInvoices = async () => {
    try {
      // Fetch sales invoices
      const { data: salesInvoices, error: salesError } = await supabase
        .from('facturas_venta')
        .select(`
          *,
          cliente:clientes(nombre_completo, cedula_id, direccion, ciudad),
          detalles:facturas_venta_detalles(
            *,
            producto:productos(nombre, descripcion, sku)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (salesError) throw salesError;

      // Fetch purchase invoices
      const { data: purchaseInvoices, error: purchaseError } = await supabase
        .from('facturas_compra')
        .select(`
          *,
          proveedor:proveedores(nombre_proveedor, cedula_fiscal, direccion, ciudad),
          detalles:facturas_compra_detalles(
            *,
            producto:productos(nombre, descripcion, sku)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (purchaseError) throw purchaseError;

      // Fetch fabric purchase invoices
      const { data: fabricInvoices, error: fabricError } = await supabase
        .from('facturas_compra_tela')
        .select(`
          *,
          proveedor:proveedores(nombre_proveedor, cedula_fiscal, direccion, ciudad),
          detalles:facturas_compra_tela_detalles(*)
        `)
        .order('created_at', { ascending: false });
      
      if (fabricError) throw fabricError;

      // Combine all invoices with type identification
      const allInvoices = [
        ...((salesInvoices || []).map(inv => ({ ...inv, invoice_type: 'venta' }))),
        ...((purchaseInvoices || []).map(inv => ({ ...inv, invoice_type: 'compra' }))),
        ...((fabricInvoices || []).map(inv => ({ ...inv, invoice_type: 'compra_tela' })))
      ];

      // Sort by creation date
      allInvoices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setInvoices(allInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({ title: "Error", description: "No se pudieron cargar las facturas.", variant: "destructive" });
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nombre_completo');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({ title: "Error", description: "No se pudieron cargar los clientes.", variant: "destructive" });
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('nombre_proveedor');
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({ title: "Error", description: "No se pudieron cargar los proveedores.", variant: "destructive" });
    }
  };

  const getEntityName = (invoice) => {
    if (invoice.invoice_type === 'venta') {
      const client = clients.find(c => c.id === invoice.cliente_id);
      return client ? client.nombre_completo : 'Cliente no encontrado';
    } else {
      const supplier = suppliers.find(s => s.id === invoice.proveedor_id);
      return supplier ? supplier.nombre_proveedor : 'Proveedor no encontrado';
    }
  };

  const getInvoiceTypeLabel = (type) => {
    switch(type) {
      case 'venta': return 'Venta';
      case 'compra': return 'Compra';
      case 'compra_tela': return 'Compra Tela';
      default: return 'Desconocido';
    }
  };

  const getStatusBadge = (estado) => {
    if (estado === 'Pagada') {
      return <Badge variant="default" className="bg-green-500">Pagada</Badge>;
    }
    return <Badge variant="destructive">Pendiente</Badge>;
  };

  const formatCurrency = (value) => {
    return `$${Math.round(value || 0).toLocaleString('es')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00Z').toLocaleDateString('es-ES');
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchAllInvoices();
      return;
    }

    setLoading(true);
    try {
      const searchResults = [];

      // Search sales invoices
      const { data: salesData, error: salesError } = await supabase
        .from('facturas_venta')
        .select(`
          *,
          cliente:clientes(nombre_completo, cedula_id, direccion, ciudad),
          detalles:facturas_venta_detalles(
            *,
            producto:productos(nombre, descripcion, sku)
          )
        `)
        .or(`numero_factura.ilike.%${searchTerm}%,descripcion_factura.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;
      if (salesData) {
        searchResults.push(...salesData.map(inv => ({ ...inv, invoice_type: 'venta' })));
      }

      // Search purchase invoices
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('facturas_compra')
        .select(`
          *,
          proveedor:proveedores(nombre_proveedor, cedula_fiscal, direccion, ciudad),
          detalles:facturas_compra_detalles(
            *,
            producto:productos(nombre, descripcion, sku)
          )
        `)
        .or(`numero_factura.ilike.%${searchTerm}%,descripcion_factura.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (purchaseError) throw purchaseError;
      if (purchaseData) {
        searchResults.push(...purchaseData.map(inv => ({ ...inv, invoice_type: 'compra' })));
      }

      // Search fabric purchase invoices
      const { data: fabricData, error: fabricError } = await supabase
        .from('facturas_compra_tela')
        .select(`
          *,
          proveedor:proveedores(nombre_proveedor, cedula_fiscal, direccion, ciudad),
          detalles:facturas_compra_tela_detalles(*)
        `)
        .or(`numero_factura.ilike.%${searchTerm}%,descripcion_factura.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (fabricError) throw fabricError;
      if (fabricData) {
        searchResults.push(...fabricData.map(inv => ({ ...inv, invoice_type: 'compra_tela' })));
      }

      // Sort by creation date
      searchResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setInvoices(searchResults);
    } catch (error) {
      console.error('Error searching invoices:', error);
      toast({ title: "Error", description: `Error al buscar facturas: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    let passesStatusFilter = true;
    let passesTypeFilter = true;
    
    if (filterStatus !== 'all') {
      passesStatusFilter = invoice.estado === filterStatus;
    }
    
    if (filterType !== 'all') {
      passesTypeFilter = invoice.invoice_type === filterType;
    }
    
    return passesStatusFilter && passesTypeFilter;
  });

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceType(invoice.invoice_type);
    setShowInvoiceTemplate(true);
  };

  const handlePrintInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceType(invoice.invoice_type);
    setShowInvoiceTemplate(true);
    // Trigger print after template loads
    setTimeout(() => {
      const printContent = document.querySelector('.invoice-template-print');
      if (printContent) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Factura ${invoice.numero_factura}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                @media print { body { margin: 0; padding: 0; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }, 500);
  };

  if (supabaseLoading) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-purple-600 animate-pulse">Cargando Impresión de Facturas...</p></div>;
  if (supabaseError) return <div className="flex flex-col justify-center items-center h-screen p-8 text-center"><h2 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Impresión de Facturas</h2><p className="text-gray-700 mb-2">{supabaseError.message}</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Imprimir Facturas</h1>
          <p className="text-gray-600 mt-1">Busca e imprime facturas de venta, compra y compra de tela</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por número, cliente o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="venta">Venta</SelectItem>
                <SelectItem value="compra">Compra</SelectItem>
                <SelectItem value="compra_tela">Compra Tela</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Pendiente">Pendientes</SelectItem>
                <SelectItem value="Pagada">Pagadas</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Facturas Encontradas ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron facturas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Factura</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente/Proveedor</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={`${invoice.invoice_type}-${invoice.id}`}>
                      <TableCell className="font-medium">{invoice.numero_factura}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          invoice.invoice_type === 'venta' ? 'bg-blue-50 text-blue-700' :
                          invoice.invoice_type === 'compra' ? 'bg-orange-50 text-orange-700' :
                          'bg-purple-50 text-purple-700'
                        }>
                          {getInvoiceTypeLabel(invoice.invoice_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(invoice.fecha_emision)}</TableCell>
                      <TableCell>{getEntityName(invoice)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(invoice.monto_total)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.estado)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                            title="Ver factura"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePrintInvoice(invoice)}
                            className="bg-green-600 hover:bg-green-700"
                            title="Imprimir factura"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
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

      {showInvoiceTemplate && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Vista Previa - Factura {selectedInvoice.numero_factura}</h2>
              <Button
                variant="outline"
                onClick={() => {
                  setShowInvoiceTemplate(false);
                  setSelectedInvoice(null);
                }}
              >
                Cerrar
              </Button>
            </div>
            <div className="invoice-template-print">
              <InvoiceTemplate
                invoice={selectedInvoice}
                type={invoiceType}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintInvoices;
