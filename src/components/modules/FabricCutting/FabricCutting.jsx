
import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, PackagePlus, Scissors } from 'lucide-react';

// Componentes existentes
import FabricInventoryList from './FabricInventoryList';
import FabricEntryForm from './FabricEntryForm';
import FabricCutForm from './FabricCutForm';
import FabricCutList from './FabricCutList';

// Componentes para facturas de compra de tela
import FabricPurchaseInvoiceForm from './FabricPurchaseInvoiceForm';
import FabricPurchaseInvoiceList from './FabricPurchaseInvoiceList';
import FabricPurchasePaymentForm from './FabricPurchasePaymentForm';

const FabricCutting = () => {
  const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();
  
  // Estados existentes
  const [fabricInventory, setFabricInventory] = useState([]);
  const [fabricCuts, setFabricCuts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [isCutFormOpen, setIsCutFormOpen] = useState(false);
  const [editingFabricEntry, setEditingFabricEntry] = useState(null);
  
  // Estados para facturas de compra de tela
  const [fabricInvoices, setFabricInvoices] = useState([]);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  
  const [loading, setLoading] = useState(true);

  const paymentMethods = ['Crédito', 'Efectivo', 'Transferencia'];

  useEffect(() => {
    if (supabase && !supabaseLoading && !supabaseError) {
      fetchAllData();
    }
  }, [supabase, supabaseLoading, supabaseError]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchFabricInventory(),
        fetchFabricCuts(),
        fetchSuppliers(),
        fetchFabricInvoices()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFabricInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('telas_inventario')
        .select(`
          *,
          proveedor:proveedores(nombre_proveedor)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFabricInventory(data || []);
    } catch (error) {
      console.error('Error fetching fabric inventory:', error);
      toast({ title: "Error", description: "No se pudo cargar el inventario de telas.", variant: "destructive" });
    }
  };

  const fetchFabricCuts = async () => {
    try {
      const { data, error } = await supabase
        .from('telas_cortes')
        .select(`
          *,
          tela_inventario:telas_inventario(nombre_tela, color, codigo_rollo)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transformar los datos para incluir información de la tela
      const transformedData = data.map(cut => ({
        ...cut,
        tela_nombre: cut.tela_inventario?.nombre_tela || 'Sin nombre',
        tela_color: cut.tela_inventario?.color || 'Sin color',
        tela_codigo_rollo: cut.tela_inventario?.codigo_rollo || 'Sin código'
      }));
      
      setFabricCuts(transformedData || []);
    } catch (error) {
      console.error('Error fetching fabric cuts:', error);
      toast({ title: "Error", description: "No se pudieron cargar los cortes de tela.", variant: "destructive" });
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

  const fetchFabricInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('facturas_compra_tela')
        .select(`
          *,
          proveedor:proveedores(nombre_proveedor)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFabricInvoices(data || []);
    } catch (error) {
      console.error('Error fetching fabric invoices:', error);
      toast({ title: "Error", description: "No se pudieron cargar las facturas de compra de tela.", variant: "destructive" });
    }
  };

  const handleCreateInvoice = async (invoiceData) => {
    try {
      console.log('Creating invoice with data:', invoiceData);
      
      // Crear la factura
      const { data: invoice, error: invoiceError } = await supabase
        .from('facturas_compra_tela')
        .insert({
          numero_factura: invoiceData.numero_factura,
          proveedor_id: parseInt(invoiceData.proveedor_id),
          fecha_emision: invoiceData.fecha_emision,
          fecha_vencimiento: invoiceData.fecha_vencimiento || null,
          forma_pago: invoiceData.forma_pago,
          monto_total: invoiceData.monto_total,
          descripcion_factura: invoiceData.descripcion_factura
        })
        .select()
        .single();

      if (invoiceError) {
        console.error('Invoice creation error:', invoiceError);
        throw invoiceError;
      }

      console.log('Invoice created:', invoice);

      // Crear los detalles
      const detallesWithInvoiceId = invoiceData.detalles.map(detalle => ({
        ...detalle,
        factura_compra_tela_id: invoice.id
      }));

      const { error: detallesError } = await supabase
        .from('facturas_compra_tela_detalles')
        .insert(detallesWithInvoiceId);

      if (detallesError) {
        console.error('Details creation error:', detallesError);
        throw detallesError;
      }

      // CORREGIR: Actualizar inventario de telas sin insertar en total_tela que tiene restricciones
      for (const detalle of invoiceData.detalles) {
        const { error: inventoryError } = await supabase
          .from('telas_inventario')
          .insert({
            codigo_rollo: detalle.codigo_rollo,
            nombre_tela: detalle.nombre_tela,
            color: detalle.color,
            metraje_saldo: detalle.metraje_cantidad,
            ancho_tela: detalle.ancho_tela || null,
            precio_metro: detalle.precio_metro,
            // REMOVER: total_tela ya que tiene restricciones DEFAULT
            proveedor_id: parseInt(invoiceData.proveedor_id),
            metodo_pago: invoiceData.forma_pago,
            notas: detalle.notas || null,
            fecha_ingreso: invoiceData.fecha_emision
          });

        if (inventoryError) {
          console.error('Inventory update error:', inventoryError);
          throw inventoryError;
        }
      }

      toast({ title: "Éxito", description: "Factura de compra de tela creada correctamente." });
      setIsInvoiceFormOpen(false);
      fetchAllData();
      
    } catch (error) {
      console.error('Error creating fabric invoice:', error);
      toast({ title: "Error", description: `No se pudo crear la factura: ${error.message}`, variant: "destructive" });
    }
  };

  const handlePayInvoice = async (paymentData) => {
    try {
      // Registrar el pago
      const { error: paymentError } = await supabase
        .from('pagos_facturas_compra_tela')
        .insert(paymentData);

      if (paymentError) throw paymentError;

      // Actualizar el monto pagado en la factura
      const { data: invoice } = await supabase
        .from('facturas_compra_tela')
        .select('monto_pagado, monto_total')
        .eq('id', paymentData.factura_compra_tela_id)
        .single();

      const newMontoPagado = (invoice.monto_pagado || 0) + paymentData.monto_pago;
      const newEstado = newMontoPagado >= invoice.monto_total ? 'Pagada' : 'Pendiente';

      const { error: updateError } = await supabase
        .from('facturas_compra_tela')
        .update({ 
          monto_pagado: newMontoPagado,
          estado: newEstado
        })
        .eq('id', paymentData.factura_compra_tela_id);

      if (updateError) throw updateError;

      // Registrar en caja (egreso por pago de compra)
      await supabase.rpc('registrar_transaccion_caja', {
        p_tipo_transaccion: 'EGRESO_PAGO_COMPRA_TELA',
        p_descripcion: paymentData.descripcion_pago,
        p_monto: paymentData.monto_pago,
        p_referencia_id: paymentData.factura_compra_tela_id,
        p_referencia_tabla: 'facturas_compra_tela'
      });

      toast({ title: "Éxito", description: "Pago registrado correctamente." });
      setIsPaymentFormOpen(false);
      setSelectedInvoiceForPayment(null);
      fetchFabricInvoices();
      
    } catch (error) {
      console.error('Error registering payment:', error);
      toast({ title: "Error", description: `No se pudo registrar el pago: ${error.message}`, variant: "destructive" });
    }
  };

  const handleViewInvoiceDetails = async (invoice) => {
    try {
      setSelectedInvoiceForView(invoice);
      const { data, error } = await supabase
        .from('facturas_compra_tela_detalles')
        .select('*')
        .eq('factura_compra_tela_id', invoice.id)
        .order('id', { ascending: true });
      if (error) throw error;
      setInvoiceDetails(data || []);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los detalles de la factura.', variant: 'destructive' });
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      const confirmed = window.confirm('¿Eliminar esta factura y sus registros asociados (pagos y caja)?');
      if (!confirmed) return;

      // Eliminar pagos asociados primero (si existen)
      await supabase.from('pagos_facturas_compra_tela').delete().eq('factura_compra_tela_id', invoiceId);
      // Eliminar detalles
      await supabase.from('facturas_compra_tela_detalles').delete().eq('factura_compra_tela_id', invoiceId);
      // Eliminar factura (triggers limpiarán caja)
      const { error } = await supabase.from('facturas_compra_tela').delete().eq('id', invoiceId);
      if (error) throw error;

      toast({ title: 'Factura eliminada', description: 'Se eliminaron registros asociados y el historial de caja.', });
      fetchFabricInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({ title: 'Error', description: `No se pudo eliminar la factura: ${error.message}`, variant: 'destructive' });
    }
  };

  const handleSubmitFabricEntry = async (fabricData) => {
    try {
      if (editingFabricEntry) {
        const { error } = await supabase
          .from('telas_inventario')
          .update(fabricData)
          .eq('id', editingFabricEntry.id);
        if (error) throw error;
        toast({ title: "Éxito", description: "Entrada de tela actualizada correctamente." });
      } else {
        const { error } = await supabase
          .from('telas_inventario')
          .insert(fabricData);
        if (error) throw error;
        toast({ title: "Éxito", description: "Entrada de tela registrada correctamente." });
      }
      setIsEntryFormOpen(false);
      setEditingFabricEntry(null);
      fetchFabricInventory();
    } catch (error) {
      console.error('Error submitting fabric entry:', error);
      toast({ title: "Error", description: `No se pudo registrar la entrada: ${error.message}`, variant: "destructive" });
    }
  };

  const handleEditFabricEntry = (fabricEntry) => {
    setEditingFabricEntry(fabricEntry);
    setIsEntryFormOpen(true);
  };

  const handleSubmitCut = async (cutData) => {
    try {
      // Agregar fecha de corte si no está presente
      const cutDataWithDate = {
        ...cutData,
        fecha_corte: cutData.fecha_corte || new Date().toLocaleDateString('en-CA')
      };

      const { error } = await supabase
        .from('telas_cortes')
        .insert(cutDataWithDate);
      
      if (error) throw error;

      // Actualizar el inventario restando la cantidad cortada
      const { data: fabricData, error: fabricError } = await supabase
        .from('telas_inventario')
        .select('metraje_saldo')
        .eq('id', cutData.tela_inventario_id)
        .single();

      if (fabricError) throw fabricError;

      const newSaldo = fabricData.metraje_saldo - parseFloat(cutData.metros_cortados);
      
      if (newSaldo < 0) {
        throw new Error('No hay suficiente tela en inventario para este corte');
      }

      const { error: updateError } = await supabase
        .from('telas_inventario')
        .update({ metraje_saldo: newSaldo })
        .eq('id', cutData.tela_inventario_id);

      if (updateError) throw updateError;

      toast({ title: "Éxito", description: "Corte registrado correctamente." });
      setIsCutFormOpen(false);
      fetchFabricCuts();
      fetchFabricInventory();
    } catch (error) {
      console.error('Error submitting cut:', error);
      toast({ title: "Error", description: `No se pudo registrar el corte: ${error.message}`, variant: "destructive" });
    }
  };

  const handleDeleteCut = async (cutId) => {
    try {
      // Obtener datos del corte antes de eliminarlo
      const { data: cutData, error: getCutError } = await supabase
        .from('telas_cortes')
        .select('tela_inventario_id, metros_cortados')
        .eq('id', cutId)
        .single();

      if (getCutError) throw getCutError;

      // Eliminar el corte
      const { error: deleteError } = await supabase
        .from('telas_cortes')
        .delete()
        .eq('id', cutId);

      if (deleteError) throw deleteError;

      // Devolver la tela al inventario
      const { data: fabricData, error: fabricError } = await supabase
        .from('telas_inventario')
        .select('metraje_saldo')
        .eq('id', cutData.tela_inventario_id)
        .single();

      if (fabricError) throw fabricError;

      const newSaldo = fabricData.metraje_saldo + parseFloat(cutData.metros_cortados);

      const { error: updateError } = await supabase
        .from('telas_inventario')
        .update({ metraje_saldo: newSaldo })
        .eq('id', cutData.tela_inventario_id);

      if (updateError) throw updateError;

      toast({ title: "Éxito", description: "Corte eliminado correctamente." });
      fetchFabricCuts();
      fetchFabricInventory();
    } catch (error) {
      console.error('Error deleting cut:', error);
      toast({ title: "Error", description: `No se pudo eliminar el corte: ${error.message}`, variant: "destructive" });
    }
  };

  if (supabaseLoading) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-purple-600 animate-pulse">Cargando Gestión de Telas...</p></div>;
  if (supabaseError) return <div className="flex flex-col justify-center items-center h-screen p-8 text-center"><h2 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Gestión de Telas</h2><p className="text-gray-700 mb-2">{supabaseError.message}</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Telas</h1>
          <p className="text-gray-600 mt-1">Administra tu inventario, compras y cortes de tela</p>
        </div>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoices">Facturas de Compra</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="cuts">Cortes</TabsTrigger>
          <TabsTrigger value="entry">Entradas Directas</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsInvoiceFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <PackagePlus className="mr-2 h-4 w-4" />
              Nueva Factura de Compra
            </Button>
          </div>
          <FabricPurchaseInvoiceList
            invoices={fabricInvoices}
            suppliers={suppliers}
            onEdit={(invoice) => {
              setEditingInvoice(invoice);
              setIsInvoiceFormOpen(true);
            }}
            onViewDetails={handleViewInvoiceDetails}
            onDelete={(invoice) => handleDeleteInvoice(invoice.id)}
            onPayInvoice={(invoice) => {
              setSelectedInvoiceForPayment(invoice);
              setIsPaymentFormOpen(true);
            }}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <FabricInventoryList
            fabricInventory={fabricInventory}
            onEdit={handleEditFabricEntry}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="cuts" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsCutFormOpen(true)} className="bg-orange-600 hover:bg-orange-700">
              <Scissors className="mr-2 h-4 w-4" />
              Registrar Corte
            </Button>
          </div>
          <FabricCutList
            fabricCuts={fabricCuts}
            onDelete={handleDeleteCut}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="entry" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsEntryFormOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Entrada
            </Button>
          </div>
          <FabricInventoryList
            fabricInventory={fabricInventory}
            onEdit={handleEditFabricEntry}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Formularios */}
      <FabricPurchaseInvoiceForm
        isOpen={isInvoiceFormOpen}
        onOpenChange={(open) => {
          setIsInvoiceFormOpen(open);
          if (!open) setEditingInvoice(null);
        }}
        onSubmit={handleCreateInvoice}
        editingInvoice={editingInvoice}
        suppliers={suppliers}
      />

      <FabricPurchasePaymentForm
        isOpen={isPaymentFormOpen}
        onOpenChange={setIsPaymentFormOpen}
        onSubmit={handlePayInvoice}
        invoice={selectedInvoiceForPayment}
        suppliers={suppliers}
      />

      <FabricEntryForm
        isOpen={isEntryFormOpen}
        onOpenChange={(open) => {
          setIsEntryFormOpen(open);
          if (!open) setEditingFabricEntry(null);
        }}
        onSubmit={handleSubmitFabricEntry}
        editingFabricEntry={editingFabricEntry}
        suppliers={suppliers}
        paymentMethods={paymentMethods}
      />

      <FabricCutForm
        isOpen={isCutFormOpen}
        onOpenChange={(open) => {
          setIsCutFormOpen(open);
        }}
        onSubmit={handleSubmitCut}
        fabricInventory={fabricInventory}
      />

      {/* Detalles de Factura de Compra de Tela */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Factura {selectedInvoiceForView?.numero_factura}</DialogTitle>
            <p className="text-sm text-gray-600">Proveedor: {suppliers.find(s => s.id === selectedInvoiceForView?.proveedor_id)?.nombre_proveedor || 'Sin proveedor'}</p>
          </DialogHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rollo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Metraje</TableHead>
                  <TableHead className="text-right">Ancho</TableHead>
                  <TableHead className="text-right">Precio x m</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceDetails.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.codigo_rollo}</TableCell>
                    <TableCell>{d.nombre_tela}</TableCell>
                    <TableCell>{d.color}</TableCell>
                    <TableCell className="text-right">{Number(d.metraje_cantidad).toFixed(2)} m</TableCell>
                    <TableCell className="text-right">{d.ancho_tela ? Number(d.ancho_tela).toFixed(2) + ' m' : '-'}</TableCell>
                    <TableCell className="text-right">${'{'}Math.round(d.precio_metro || 0).toLocaleString('es'){'}'}</TableCell>
                    <TableCell className="text-right">${'{'}Math.round(d.subtotal || 0).toLocaleString('es'){'}'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FabricCutting;
