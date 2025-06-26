import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import CustomerForm from '@/components/modules/Receivables/CustomerForm';
import InvoiceForm from '@/components/modules/Receivables/InvoiceForm';
import PaymentForm from '@/components/modules/Receivables/PaymentForm';
import InvoiceList from '@/components/modules/Receivables/InvoiceList';
import CustomerList from '@/components/modules/Receivables/CustomerList';
import RecentPayments from '@/components/modules/Receivables/RecentPayments';
import ReceivablesStats from '@/components/modules/Receivables/ReceivablesStats';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useConfirmationDialog } from '@/components/providers/ConfirmationDialogProvider';

const Receivables = () => {
  const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();
  const { confirm } = useConfirmationDialog();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');

  const paymentMethods = ['Contado', 'Crédito', 'Transferencia'];

  const fetchData = async () => {
    if (!supabase) return;

    try {
      const { data: customersData, error: customersError } = await supabase.from('clientes').select('*').order('nombre_completo');
      if (customersError) throw customersError;
      setCustomers(customersData || []);

      const { data: productsData, error: productsError } = await supabase.from('productos').select('id, nombre, sku, cantidad_actual, costo_predeterminado, precio_venta_predeterminado').order('nombre');
      if (productsError) throw productsError;
      setProducts(productsData || []);

      const { data: invoicesData, error: invoicesError } = await supabase.from('facturas_venta').select('*, clientes(nombre_completo)').order('fecha_emision', { ascending: false });
      if (invoicesError) throw invoicesError;
      setInvoices((invoicesData || []).map(inv => ({...inv, customerName: inv.clientes?.nombre_completo || 'N/A'})));
      
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('pagos_recibidos')
        .select('*, facturas_venta(numero_factura, clientes(nombre_completo))')
        .order('fecha_pago', { ascending: false })
        .limit(10);
      if (paymentsError) throw paymentsError;
      setPayments((paymentsData || []).map(p => ({...p, invoiceNumber: p.facturas_venta?.numero_factura, customerName: p.facturas_venta?.clientes?.nombre_completo || 'N/A'})));
    } catch (error) {
      toast({ title: "Error Crítico al Cargar Datos", description: `No se pudieron cargar datos esenciales: ${error.message}`, variant: "destructive", duration: 7000 });
    }
  };

  useEffect(() => {
    if (supabase && !supabaseLoading && !supabaseError) {
      fetchData();
    } else if (supabaseError) {
       toast({ title: "Error de Conexión Supabase", description: `Cuentas por Cobrar: ${supabaseError.message}`, variant: "destructive", duration: 7000 });
    }
  }, [supabase, supabaseLoading, supabaseError]);

  const handleCustomerSubmit = async (customerData) => {
    if (!supabase) return;
    if (editingCustomer) {
      const { error } = await supabase.from('clientes').update(customerData).eq('id', editingCustomer.id);
      if (error) toast({ title: "Error", description: `No se pudo actualizar el cliente: ${error.message}`, variant: "destructive" });
      else toast({ title: "¡Cliente actualizado!", description: "El cliente se ha actualizado correctamente." });
    } else {
      const { error } = await supabase.from('clientes').insert(customerData);
      if (error) toast({ title: "Error", description: `No se pudo agregar el cliente: ${error.message}`, variant: "destructive" });
      else toast({ title: "¡Cliente agregado!", description: "El cliente se ha registrado correctamente." });
    }
    setEditingCustomer(null);
    setIsCustomerDialogOpen(false);
    fetchData();
  };

  const handleInvoiceSubmit = async (invoiceData, invoiceItems) => {
    if (!supabase) return;
    
    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);
    const invoicePayload = {
      ...invoiceData,
      cliente_id: parseInt(invoiceData.cliente_id),
      monto_total: totalAmount,
      estado: invoiceData.forma_pago === 'Contado' ? 'Pagada' : 'Pendiente',
      monto_pagado: invoiceData.forma_pago === 'Contado' ? totalAmount : 0
    };

    let savedInvoice;
    if (editingInvoice) {
      const { data, error } = await supabase.from('facturas_venta').update({ ...invoicePayload, estado: editingInvoice.estado, monto_pagado: editingInvoice.monto_pagado }).eq('id', editingInvoice.id).select('id, numero_factura, monto_total, forma_pago').single();
      if (error) { toast({ title: "Error", description: `No se pudo actualizar la factura: ${error.message}`, variant: "destructive" }); return; }
      savedInvoice = data;
      await supabase.from('facturas_venta_detalles').delete().eq('factura_venta_id', editingInvoice.id);
      toast({ title: "¡Factura actualizada!", description: "La factura se ha actualizado." });
    } else {
      const { data, error } = await supabase.from('facturas_venta').insert(invoicePayload).select('id, numero_factura, monto_total, forma_pago').single();
      if (error) { toast({ title: "Error", description: `No se pudo crear la factura: ${error.message}`, variant: "destructive" }); return; }
      savedInvoice = data;
      toast({ title: "¡Factura creada!", description: "La factura se ha registrado." });
    }
    
    const detailItems = invoiceItems.map(item => ({
        factura_venta_id: savedInvoice.id,
        producto_id: parseInt(item.producto_id),
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal
    }));

    const { error: detailError } = await supabase.from('facturas_venta_detalles').insert(detailItems);
    if (detailError) {
      toast({ title: "Error", description: `No se pudieron guardar los detalles: ${detailError.message}`, variant: "destructive" });
      if (!editingInvoice) await supabase.from('facturas_venta').delete().eq('id', savedInvoice.id); 
      return;
    }

    if (!editingInvoice) {
        for (const item of invoiceItems) {
            const product = products.find(p => p.id === parseInt(item.producto_id));
            if (product) {
                const newQuantity = product.cantidad_actual - parseInt(item.cantidad);
                await supabase.from('productos').update({ cantidad_actual: newQuantity }).eq('id', product.id);
            }
        }
    }
    
    if (savedInvoice.forma_pago === 'Contado' && !editingInvoice) {
      const { error: cashError } = await supabase.rpc('registrar_transaccion_caja', { p_tipo_transaccion: 'INGRESO_VENTA_CONTADO', p_descripcion: `Venta Contado Factura ${savedInvoice.numero_factura}`, p_monto: savedInvoice.monto_total, p_referencia_id: savedInvoice.id, p_referencia_tabla: 'facturas_venta' });
      if (cashError) toast({ title: "Error en Caja", description: `No se pudo registrar el movimiento en caja: ${cashError.message}`, variant: "destructive" });
    }
    
    setEditingInvoice(null);
    setIsInvoiceDialogOpen(false);
    fetchData();
  };

  const handlePaymentSubmit = async (paymentData) => {
    if (!supabase) return;
    const invoice = invoices.find(i => i.id === parseInt(paymentData.factura_venta_id));
    if (!invoice) return;

    const paymentAmount = Number(paymentData.monto_pago);
    const newPaidAmount = (invoice.monto_pagado || 0) + paymentAmount;
    
    if (newPaidAmount > invoice.monto_total) { toast({ title: "Error", description: "El monto del pago excede el saldo pendiente.", variant: "destructive" }); return; }

    const { data: paymentRecord, error: paymentInsertError } = await supabase.from('pagos_recibidos').insert(paymentData).select('id').single();
    if (paymentInsertError) { toast({ title: "Error", description: `No se pudo registrar el pago: ${paymentInsertError.message}`, variant: "destructive" }); return; }

    const newStatus = newPaidAmount >= invoice.monto_total ? 'Pagada' : 'Pendiente';
    const { error: invoiceUpdateError } = await supabase.from('facturas_venta').update({ monto_pagado: newPaidAmount, estado: newStatus }).eq('id', parseInt(paymentData.factura_venta_id));

    if (invoiceUpdateError) toast({ title: "Error", description: `No se pudo actualizar la factura: ${invoiceUpdateError.message}`, variant: "destructive" });
    else {
      toast({ title: "¡Pago registrado!", description: "El pago se ha registrado correctamente." });
      const { error: cashError } = await supabase.rpc('registrar_transaccion_caja', { p_tipo_transaccion: 'INGRESO_COBRO_CXC', p_descripcion: `Cobro Factura Venta ${invoice.numero_factura}`, p_monto: paymentAmount, p_referencia_id: paymentRecord.id, p_referencia_tabla: 'pagos_recibidos' });
      if (cashError) toast({ title: "Error en Caja", description: `No se pudo registrar movimiento en caja: ${cashError.message}`, variant: "destructive" });
    }
    setIsPaymentDialogOpen(false);
    fetchData();
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsCustomerDialogOpen(true);
  };
  
  const handleOpenNewInvoiceDialog = async () => {
    if (!supabase) return;
    setEditingInvoice(null);
    const { data, error } = await supabase.rpc('get_next_sale_invoice_number');
    if (error) {
      toast({ title: "Error", description: "No se pudo generar el número de factura.", variant: "destructive" });
      setNextInvoiceNumber('');
    } else {
      setNextInvoiceNumber(data);
    }
    setIsInvoiceDialogOpen(true);
  };

  const handleEditInvoice = async (invoice) => {
     if (!supabase) return;
    const { data: details, error } = await supabase.from('facturas_venta_detalles').select('*, productos(id, nombre, sku)').eq('factura_venta_id', invoice.id);
    if (error) {
      toast({ title: "Error", description: `No se pudieron cargar los detalles: ${error.message}`, variant: "destructive" });
      setEditingInvoice({...invoice, items: []});
    } else {
      const items = (details || []).map(d => ({ producto_id: d.producto_id, productName: d.productos?.nombre, productSku: d.productos?.sku, cantidad: d.cantidad, precio_unitario: d.precio_unitario, subtotal: d.subtotal }));
      setEditingInvoice({...invoice, items});
    }
    setIsInvoiceDialogOpen(true);
  };

  const handleDeleteCustomer = async (customerId) => {
    const confirmed = await confirm({
        title: 'Confirmar Eliminación',
        description: '¿Estás seguro de que quieres eliminar este cliente? Esta acción es irreversible y eliminará todas las facturas asociadas.',
        confirmText: 'Eliminar Cliente'
    });
    if (!confirmed) return;

    if (!supabase) return;
    const { data: relatedInvoices, error: fetchError } = await supabase.from('facturas_venta').select('id').eq('cliente_id', customerId);
    if (fetchError) { toast({ title: "Error", description: `Error al verificar facturas: ${fetchError.message}`, variant: "destructive" }); return; }
    
    if (relatedInvoices && relatedInvoices.length > 0) {
        for (const inv of relatedInvoices) {
            await handleDeleteInvoice(inv.id, true); // true to skip confirmation
        }
    }

    const { error } = await supabase.from('clientes').delete().eq('id', customerId);
    if (error) toast({ title: "Error", description: `No se pudo eliminar el cliente: ${error.message}`, variant: "destructive" });
    else toast({ title: "Cliente eliminado", description: "El cliente y sus facturas asociadas se han eliminado." });
    fetchData();
  };

  const handleDeleteInvoice = async (invoiceId, skipConfirmation = false) => {
    if (!skipConfirmation) {
        const confirmed = await confirm({
            title: 'Confirmar Eliminación',
            description: '¿Estás seguro de que quieres eliminar esta factura? Esta acción es irreversible y eliminará todos los pagos y movimientos de caja asociados.',
            confirmText: 'Eliminar Factura'
        });
        if (!confirmed) return;
    }

    if (!supabase) return;
    await supabase.from('pagos_recibidos').delete().eq('factura_venta_id', invoiceId);
    await supabase.from('facturas_venta_detalles').delete().eq('factura_venta_id', invoiceId);
    await supabase.from('caja_general_transacciones').delete().eq('referencia_id', invoiceId).eq('referencia_tabla', 'facturas_venta');
    
    const { error } = await supabase.from('facturas_venta').delete().eq('id', invoiceId);
    if (error) toast({ title: "Error", description: `No se pudo eliminar la factura: ${error.message}`, variant: "destructive" });
    else toast({ title: "Factura eliminada", description: "La factura y sus datos asociados se han eliminado." });
    fetchData();
  };
  
  if (supabaseLoading && !customers.length && !products.length) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-purple-600 animate-pulse">Cargando Módulo de Cuentas por Cobrar...</p></div>;
  if (supabaseError && !supabase) return <div className="flex flex-col justify-center items-center h-screen p-8 text-center"><h2 className="text-2xl font-bold text-red-600 mb-4">Error Crítico de Conexión</h2><p className="text-gray-700 mb-2">No se puede conectar a Supabase. Verifique la conexión y credenciales.</p></div>;


  const pendingInvoices = invoices.filter(i => i.estado === 'Pendiente');
  const totalReceivable = pendingInvoices.reduce((sum, i) => sum + (i.monto_total - (i.monto_pagado || 0)), 0);
  const totalCollected = invoices.reduce((sum, i) => sum + (i.monto_pagado || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cuentas por Cobrar</h1>
          <p className="text-gray-600 mt-1">Gestiona clientes, facturas y pagos recibidos</p>
        </div>
        <div className="flex space-x-3">
          <PaymentForm isOpen={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen} onSubmit={handlePaymentSubmit} pendingInvoices={pendingInvoices} />
           <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" onClick={handleOpenNewInvoiceDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
          <InvoiceForm isOpen={isInvoiceDialogOpen} onOpenChange={(isOpen) => { setIsInvoiceDialogOpen(isOpen); if (!isOpen) setEditingInvoice(null); }} onSubmit={handleInvoiceSubmit} editingInvoice={editingInvoice} customers={customers} products={products} paymentMethods={paymentMethods} nextInvoiceNumber={nextInvoiceNumber} />
          <CustomerForm isOpen={isCustomerDialogOpen} onOpenChange={(isOpen) => { setIsCustomerDialogOpen(isOpen); if (!isOpen) setEditingCustomer(null); }} onSubmit={handleCustomerSubmit} editingCustomer={editingCustomer} />
        </div>
      </div>

      <ReceivablesStats customersCount={customers.length} totalPaid={totalCollected} totalReceivable={totalReceivable} pendingInvoicesCount={pendingInvoices.length} />
      
      <InvoiceList invoices={invoices} onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} />
      <CustomerList customers={customers} onEdit={handleEditCustomer} onDelete={handleDeleteCustomer} />
      <RecentPayments payments={payments} />
    </div>
  );
};

export default Receivables;