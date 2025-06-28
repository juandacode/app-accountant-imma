
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceTemplate, setShowInvoiceTemplate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabase && !supabaseLoading && !supabaseError) {
      fetchData();
    }
  }, [supabase, supabaseLoading, supabaseError]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchInvoices(), fetchClients()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
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
      
      if (error) throw error;
      setInvoices(data || []);
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

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.nombre_completo : 'Cliente no encontrado';
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
      fetchInvoices();
      return;
    }

    setLoading(true);
    try {
      // Corregir la sintaxis de búsqueda usando or() explícitamente
      const { data, error } = await supabase
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

      if (error) throw error;

      // También buscar por nombre de cliente
      const { data: clientData, error: clientError } = await supabase
        .from('facturas_venta')
        .select(`
          *,
          cliente:clientes!inner(nombre_completo, cedula_id, direccion, ciudad),
          detalles:facturas_venta_detalles(
            *,
            producto:productos(nombre, descripcion, sku)
          )
        `)
        .ilike('cliente.nombre_completo', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (clientError) throw clientError;

      // Combinar resultados y eliminar duplicados
      const allResults = [...(data || []), ...(clientData || [])];
      const uniqueResults = allResults.filter((invoice, index, self) => 
        index === self.findIndex(i => i.id === invoice.id)
      );

      setInvoices(uniqueResults);
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
    if (filterStatus === 'all') return true;
    return invoice.estado === filterStatus;
  });

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceTemplate(true);
  };

  const handlePrintInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceTemplate(true);
    // Trigger print after template loads
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (supabaseLoading) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-purple-600 animate-pulse">Cargando Impresión de Facturas...</p></div>;
  if (supabaseError) return <div className="flex flex-col justify-center items-center h-screen p-8 text-center"><h2 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Impresión de Facturas</h2><p className="text-gray-700 mb-2">{supabaseError.message}</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Imprimir Facturas</h1>
          <p className="text-gray-600 mt-1">Busca e imprime facturas de venta</p>
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
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
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
                      <TableCell>{getClientName(invoice.cliente_id)}</TableCell>
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
        <InvoiceTemplate
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceTemplate(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
};

export default PrintInvoices;
