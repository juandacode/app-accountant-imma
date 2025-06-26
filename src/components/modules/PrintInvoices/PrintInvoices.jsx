
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Printer, Search, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const InvoiceTemplate = lazy(() => import('./InvoiceTemplate'));

const LoadingInvoiceTemplateFallback = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500">
    <FileText className="h-16 w-16 mb-4 animate-pulse text-pink-300" />
    <p>Cargando plantilla de factura...</p>
  </div>
);

const PrintInvoices = () => {
  const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();
  const [invoiceType, setInvoiceType] = useState('venta');
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false); 
  const printRef = useRef();

  const fetchInvoices = async () => {
    if (!supabase) {
        toast({title: "Supabase no disponible", description: "No se pueden cargar facturas.", variant: "destructive"});
        return;
    }
    setLoading(true);
    setSelectedInvoice(null);

    let queryBase = invoiceType === 'venta' ? 'facturas_venta' : 'facturas_compra';
    let query = supabase.from(queryBase);
    
    let selectFields = 'id, numero_factura, fecha_emision, fecha_vencimiento, monto_total, forma_pago, descripcion_factura, descuento';
    if (invoiceType === 'venta') {
        selectFields += ', clientes(id, nombre_completo, cedula_id, direccion, ciudad), facturas_venta_detalles(id, cantidad, precio_unitario, subtotal, productos(id, nombre, sku))';
    } else {
        selectFields += ', proveedores(id, nombre_proveedor, cedula_fiscal, direccion, ciudad), facturas_compra_detalles(id, cantidad, costo_unitario, subtotal, productos(id, nombre, sku))';
    }
    
    query = query.select(selectFields).order('fecha_emision', { ascending: false });

    if (searchTerm.trim()) {
      const searchVal = searchTerm.trim();
      
      if (invoiceType === 'venta') {
        // Fixed PostgREST syntax using or() function
        query = query.or(`clientes.nombre_completo.ilike.%${searchVal}%,numero_factura.ilike.%${searchVal}%`);
      } else { // compra
        // Fixed PostgREST syntax using or() function
        query = query.or(`proveedores.nombre_proveedor.ilike.%${searchVal}%,numero_factura.ilike.%${searchVal}%`);
      }
    }
    
    const { data, error } = await query.limit(50);

    if (error) {
      toast({ title: "Error al Cargar Facturas", description: `No se pudieron cargar las facturas: ${error.message}`, variant: "destructive" });
      setInvoices([]);
    } else {
      setInvoices(data || []);
      if (data && data.length === 0 && searchTerm.trim()) { 
        toast({ title: "Sin resultados", description: "No se encontraron facturas con los criterios de búsqueda.", variant: "default" });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (supabase && !supabaseLoading && !supabaseError) {
        fetchInvoices(); 
    }
  }, [invoiceType, supabase, supabaseLoading, supabaseError]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handlePrint = () => {
    if (!selectedInvoice || !printRef.current) {
        toast({ title: "Error", description: "Selecciona una factura para imprimir.", variant: "destructive" });
        return;
    }
    
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'height=800,width=1000');
    
    if(!printWindow) {
        toast({ title: "Error de Impresión", description: "No se pudo abrir la ventana de impresión. Revisa los bloqueadores de pop-ups.", variant: "destructive" });
        return;
    }

    printWindow.document.write('<html><head><title>Imprimir Factura</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">'); // Tailwind for basic layout in print
    printWindow.document.write('<style>');
    // Inline styles from InvoiceTemplate will be included via printContent
    // Add print-specific styles here
    printWindow.document.write(`
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; color: #333; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .invoice-box { width: 100%; max-width: 800px; margin: auto; padding: 20px; font-size: 12px; line-height: 1.5; }
        @media print {
            body { margin: 0; padding: 0; }
            .invoice-box { box-shadow: none; border: none; margin: 0; padding: 10px; width: 100%; font-size: 10pt; }
            .no-print { display: none; }
        }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    printWindow.onload = () => { 
        printWindow.focus(); 
        printWindow.print();
    };
  };
  
  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('es', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatDateForList = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00Z');
    if (isNaN(date.getTime())) return 'Fecha Inválida';
    return date.toLocaleDateString('es-CO');
  }


  if (supabaseLoading) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-pink-600 animate-pulse">Cargando Módulo de Impresión...</p></div>;
  if (supabaseError) return <div className="flex flex-col justify-center items-center h-screen p-8 text-center"><h2 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Módulo</h2><p className="text-gray-700 mb-2">{supabaseError.message}</p></div>;


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Printer className="h-8 w-8 mr-3 text-rose-600"/>
            Imprimir Facturas
          </h1>
          <p className="text-gray-600 mt-1">Busca y visualiza facturas para imprimir.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow">
              <Label htmlFor="invoiceTypePrint">Tipo de Factura</Label>
              <Select value={invoiceType} onValueChange={(val) => { setInvoiceType(val); setSearchTerm(''); setInvoices([]); setSelectedInvoice(null); }}>
                <SelectTrigger id="invoiceTypePrint">
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venta">Factura de Venta</SelectItem>
                  <SelectItem value="compra">Factura de Compra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-grow">
              <Label htmlFor="searchTermPrint">Buscar (N°, Cliente/Proveedor)</Label>
              <Input 
                id="searchTermPrint" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Ej: FV-000001 o Nombre"
              />
            </div>
            <Button type="submit" disabled={loading || supabaseLoading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Resultados de Búsqueda</CardTitle>
            <CardDescription>{invoices.length} factura(s) encontrada(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-3">
              {loading && <p className="text-center text-pink-600">Cargando...</p>}
              {!loading && invoices.length === 0 && <p className="text-center text-gray-500">No se encontraron facturas. Realiza una búsqueda o cambia el tipo de factura.</p>}
              <ul className="space-y-2">
                {invoices.map(inv => (
                  <li key={inv.id} 
                      className={`p-3 rounded-md cursor-pointer transition-all ${selectedInvoice?.id === inv.id ? 'bg-pink-100 ring-2 ring-pink-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                      onClick={() => handleSelectInvoice(inv)}>
                    <p className="font-semibold">{inv.numero_factura}</p>
                    <p className="text-sm text-gray-700">{invoiceType === 'venta' ? inv.clientes?.nombre_completo : inv.proveedores?.nombre_proveedor}</p>
                    <p className="text-xs text-gray-500">Fecha: {formatDateForList(inv.fecha_emision)} - Total: ${formatCurrency(inv.monto_total)}</p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle>Vista Previa de Factura</CardTitle>
                <CardDescription>
                    {selectedInvoice ? `Factura N° ${selectedInvoice.numero_factura}` : 'Selecciona una factura para visualizar'}
                </CardDescription>
            </div>
            <Button onClick={handlePrint} disabled={!selectedInvoice || loading || supabaseLoading} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 no-print">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] border rounded-md p-1 bg-gray-100">
              <Suspense fallback={<LoadingInvoiceTemplateFallback />}>
                {selectedInvoice ? (
                  <div ref={printRef}>
                    <InvoiceTemplate invoice={selectedInvoice} type={invoiceType} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FileText className="h-16 w-16 mb-4" />
                    <p>Selecciona una factura de la lista para ver la vista previa aquí.</p>
                  </div>
                )}
              </Suspense>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrintInvoices;
