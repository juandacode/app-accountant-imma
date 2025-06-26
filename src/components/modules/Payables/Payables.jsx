import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import SupplierForm from '@/components/modules/Payables/SupplierForm';
import PurchaseInvoiceForm from '@/components/modules/Payables/PurchaseInvoiceForm';
import PayablePaymentForm from '@/components/modules/Payables/PayablePaymentForm';
import PurchaseInvoiceList from '@/components/modules/Payables/PurchaseInvoiceList';
import SupplierList from '@/components/modules/Payables/SupplierList';
import RecentPayablePayments from '@/components/modules/Payables/RecentPayablePayments';
import PayablesStats from '@/components/modules/Payables/PayablesStats';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useConfirmationDialog } from '@/components/providers/ConfirmationDialogProvider';

const Payables = () => {
  const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();
  const { confirm } = useConfirmationDialog();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');

  const paymentMethods = ['Contado', 'Crédito', 'Transferencia'];

  const fetchData = async () => {
    if (!supabase) return;

    const { data: suppliersData, error: suppliersError } = await supabase.from('proveedores').select('*').order('nombre_proveedor');
    if (suppliersError) toast({ title: "Error", description: "No se pudieron cargar los proveedores.", variant: "destructive" });
    else setSuppliers(suppliersData || []);

    const { data: productsData, error: productsError } = await supabase.from('productos').select('id, nombre, sku, cantidad_actual, costo_predeterminado').order('nombre');
    if (productsError) toast({ title: "Error", description: "No se pudieron cargar los productos para facturación de compra.", variant: "destructive" });
    else setProducts(productsData || []);

    const { data: invoicesData, error: invoicesError } = await supabase.from('facturas_compra').select('*, proveedores(nombre_proveedor)').order('fecha_emision', { ascending: false });
    if (invoicesError) toast({ title: "Error", description: "No se pudieron cargar las facturas de compra.", variant: "destructive" });
    else setInvoices((invoicesData || []).map(inv => ({...inv, supplierName: inv.proveedores?.nombre_proveedor || 'N/A'})));
    
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('pagos_realizados')
      .select('*, facturas_compra(numero_factura, proveedores(nombre_proveedor))')
      .order('fecha_pago', { ascending: false })
      .limit(10);
    if (paymentsError) toast({ title: "Error", description: "No se pudieron cargar los pagos realizados.", variant: "destructive" });
    else setPayments((paymentsData || []).map(p => ({...p, invoiceNumber: p.facturas_compra?.numero_factura, supplierName: p.facturas_compra?.proveedores?.nombre_proveedor || 'N/A'})));
  };

  useEffect(() => {
    if (supabase && !supabaseLoading && !supabaseError) {
      fetchData();
    }
  }, [supabase, supabaseLoading, supabaseError]);


  const handleSupplierSubmit = async (supplierData) => {
    if (!supabase) return;
    if (editingSupplier) {
      const { error } = await supabase.from('proveedores').update(supplierData).eq('id', editingSupplier.id);
      if (error) toast({ title: "Error", description: `No se pudo actualizar el proveedor: ${error.message}`, variant: "destructive" });
      else toast({ title: "¡Proveedor actualizado!", description: "El proveedor se ha actualizado correctamente." });
    } else {
      const { error } = await supabase.from('proveedores').insert(supplierData);
      if (error) toast({ title: "Error", description: `No se pudo agregar el proveedor: ${error.message}`, variant: "destructive" });
      else toast({ title: "¡Proveedor agregado!", description: "El proveedor se ha registrado correctamente." });
    }
    setEditingSupplier(null);
    setIsSupplierDialogOpen(false);
    fetchData();
  };

  const handleInvoiceSubmit = async (invoiceData, invoiceItems) => {
    if (!supabase) return;
    
    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);
    const invoicePayload = {
      ...invoiceData,
      proveedor_id: parseInt(invoiceData.proveedor_id),
      monto_total: totalAmount,
      estado: invoiceData.forma_pago === 'Contado' ? 'Pagada' : 'Pendiente',
      monto_pagado: invoiceData.forma_pago === 'Contado' ? totalAmount : 0
    };

    let savedInvoice;
    if (editingInvoice) {
      const { data, error } = await supabase.from('facturas_compra').update({ ...invoicePayload, estado: editingInvoice.estado, monto_pagado: editingInvoice.monto_pagado }).eq('id', editingInvoice.id).select('id, numero_factura, monto_total, forma_pago').single();
      if (error) { toast({ title: "Error", description: `No se pudo actualizar la factura: ${error.message}`, variant: "destructive" }); return; }
      savedInvoice = data;
      await supabase.from('facturas_compra_detalles').delete().eq('factura_compra_id', editingInvoice.id);
      toast({ title: "¡Factura actualizada!", description: "La factura se ha actualizado." });
    } else {
      const { data, error } = await supabase.from('facturas_compra').insert(invoicePayload).select('id, numero_factura, monto_total, forma_pago').single();
      if (error) { toast({ title: "Error", description: `No se pudo crear la factura: ${error.message}`, variant: "destructive" }); return; }
      savedInvoice = data;
      toast({ title: "¡Factura creada!", description: "La factura se ha registrado." });
    }
    
    const detailItems = invoiceItems.map(item => ({
        factura_compra_id: savedInvoice.id,
        producto_id: parseInt(item.producto_id),
        cantidad: item.cantidad,
        costo_unitario: item.costo_unitario,
        subtotal: item.subtotal,
        costo_adquisicion_unitario: item.costo_unitario 
    }));
    const { error: detailError } = await supabase.from('facturas_compra_detalles').insert(detailItems);
    if (detailError) {
      toast({ title: "Error", description: `No se pudieron guardar los detalles: ${detailError.message}`, variant: "destructive" });
      if (!editingInvoice) await supabase.from('facturas_compra').delete().eq('id', savedInvoice.id); 
      return;
    }

    for (const item of invoiceItems) {
      const product = products.find(p => p.id === parseInt(item.producto_id));
      if (product) {
        const newQuantity = product.cantidad_actual + parseInt(item.cantidad);
        await supabase.from('productos').update({ cantidad_actual: newQuantity }).eq('id', product.id);
      }
    }
    
    if (savedInvoice.forma_pago === 'Contado' && !editingInvoice) {
      const { error: cashError } = await supabase.rpc('registrar_transaccion_caja', { p_tipo_transaccion: 'EGRESO_COMPRA_CONTADO', p_descripcion: `Compra Contado Factura ${savedInvoice.numero_factura}`, p_monto: savedInvoice.monto_total, p_referencia_id: savedInvoice.id, p_referencia_tabla: 'facturas_compra' });
      if (cashError) toast({ title: "Error en Caja", description: `No se pudo registrar el movimiento en caja: ${cashError.message}`, variant: "destructive" });
    }
    
    setEditingInvoice(null);
    setIsInvoiceDialogOpen(false);
    fetchData();
  };

  const handlePaymentSubmit = async (paymentData) => {
    if (!supabase) return;
    const invoice = invoices.find(i => i.id === parseInt(paymentData.factura_compra_id));
    if (!invoice) return;

    const paymentAmount = Number(paymentData.monto_pago);
    const newPaidAmount = (invoice.monto_pagado || 0) + paymentAmount;
    
    if (newPaidAmount > invoice.monto_total) { toast({ title: "Error", description: "El monto del pago excede el saldo pendiente.", variant: "destructive" }); return; }

    const { data: paymentRecord, error: paymentInsertError } = await supabase.from('pagos_realizados').insert(paymentData).select('id').single();
    if (paymentInsertError) { toast({ title: "Error", description: `No se pudo registrar el pago: ${paymentInsertError.message}`, variant: "destructive" }); return; }

    const newStatus = newPaidAmount >= invoice.monto_total ? 'Pagada' : 'Pendiente';
    const { error: invoiceUpdateError } = await supabase.from('facturas_compra').update({ monto_pagado: newPaidAmount, estado: newStatus }).eq('id', parseInt(paymentData.factura_compra_id));

    if (invoiceUpdateError) toast({ title: "Error", description: `No se pudo actualizar la factura: ${invoiceUpdateError.message}`, variant: "destructive" });
    else {
      toast({ title: "¡Pago registrado!", description: "El pago se ha registrado correctamente." });
      const { error: cashError } = await supabase.rpc('registrar_transaccion_caja', { p_tipo_transaccion: 'EGRESO_PAGO_CXP', p_descripcion: `Pago Factura Compra ${invoice.numero_factura}`, p_monto: paymentAmount, p_referencia_id: paymentRecord.id, p_referencia_tabla: 'pagos_realizados' });
      if (cashError) toast({ title: "Error en Caja", description: `No se pudo registrar movimiento en caja: ${cashError.message}`, variant: "destructive" });
    }
    setIsPaymentDialogOpen(false);
    fetchData();
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setIsSupplierDialogOpen(true);
  };
  
  const handleOpenNewInvoiceDialog = async () => {
    if (!supabase) return;
    setEditingInvoice(null);
    const { data, error } = await supabase.rpc('get_next_purchase_invoice_number');
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
    const { data: details, error } = await supabase.from('facturas_compra_detalles').select('*, productos(id, nombre, sku)').eq('factura_compra_id', invoice.id);
    if (error) {
      toast({ title: "Error", description: `No se pudieron cargar los detalles: ${error.message}`, variant: "destructive" });
      setEditingInvoice({...invoice, items: []});
    } else {
      const items = (details || []).map(d => ({ producto_id: d.producto_id, productName: d.productos?.nombre, productSku: d.productos?.sku, cantidad: d.cantidad, costo_unitario: d.costo_unitario, subtotal: d.subtotal }));
      setEditingInvoice({...invoice, items});
    }
    setIsInvoiceDialogOpen(true);
  };

  const handleDeleteSupplier = async (supplierId) => {
    const confirmed = await confirm({
      title: 'Confirmar Eliminación',
      description: '¿Estás seguro de que quieres eliminar este proveedor? Esta acción es irreversible y eliminará todas las facturas asociadas.',
      confirmText: 'Eliminar Proveedor'
    });
    if (!confirmed) return;

    if (!supabase) return;
    const { data: relatedInvoices, error: fetchError } = await supabase.from('facturas_compra').select('id').eq('proveedor_id', supplierId);
    if (fetchError) { toast({ title: "Error", description: `Error al verificar facturas: ${fetchError.message}`, variant: "destructive" }); return; }
    
    if (relatedInvoices && relatedInvoices.length > 0) {
        for (const inv of relatedInvoices) {
            await handleDeleteInvoice(inv.id, true); // true to skip confirmation
        }
    }

    const { error } = await supabase.from('proveedores').delete().eq('id', supplierId);
    if (error) toast({ title: "Error", description: `No se pudo eliminar el proveedor: ${error.message}`, variant: "destructive" });
    else toast({ title: "Proveedor eliminado", description: "El proveedor y sus facturas asociadas se han eliminado." });
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
    await supabase.from('pagos_realizados').delete().eq('factura_compra_id', invoiceId);
    await supabase.from('facturas_compra_detalles').delete().eq('factura_compra_id', invoiceId);
    await supabase.from('caja_general_transacciones').delete().eq('referencia_id', invoiceId).eq('referencia_tabla', 'facturas_compra');

    const { error } = await supabase.from('facturas_compra').delete().eq('id', invoiceId);
    if (error) toast({ title: "Error", description: `No se pudo eliminar la factura: ${error.message}`, variant: "destructive" });
    else toast({ title: "Factura eliminada", description: "La factura y sus datos asociados se han eliminado." });
    fetchData();
  };
  
  if (supabaseLoading) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-purple-600 animate-pulse">Cargando Módulo...</p></div>;
  if (supabaseError) return <div className="flex flex-col justify-center items-center h-screen p-8 text-center"><h2 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Cuentas por Pagar</h2><p className="text-gray-700 mb-2">{supabaseError.message}</p></div>;

  const pendingInvoices = invoices.filter(i => i.estado === 'Pendiente');
  const totalPayable = pendingInvoices.reduce((sum, i) => sum + (i.monto_total - (i.monto_pagado || 0)), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + (i.monto_pagado || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cuentas por Pagar</h1>
          <p className="text-gray-600 mt-1">Gestiona proveedores, facturas y pagos realizados</p>
        </div>
        <div className="flex space-x-3">
          <PayablePaymentForm isOpen={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen} onSubmit={handlePaymentSubmit} pendingInvoices={pendingInvoices} />
           <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" onClick={handleOpenNewInvoiceDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
          <PurchaseInvoiceForm isOpen={isInvoiceDialogOpen} onOpenChange={(isOpen) => { setIsInvoiceDialogOpen(isOpen); if (!isOpen) setEditingInvoice(null); }} onSubmit={handleInvoiceSubmit} editingInvoice={editingInvoice} suppliers={suppliers} products={products} paymentMethods={paymentMethods} nextInvoiceNumber={nextInvoiceNumber} />
          <SupplierForm isOpen={isSupplierDialogOpen} onOpenChange={(isOpen) => { setIsSupplierDialogOpen(isOpen); if (!isOpen) setEditingSupplier(null); }} onSubmit={handleSupplierSubmit} editingSupplier={editingSupplier} />
        </div>
      </div>

      <PayablesStats suppliersCount={suppliers.length} totalPaid={totalPaid} totalPayable={totalPayable} pendingInvoicesCount={pendingInvoices.length} />
      
      <PurchaseInvoiceList invoices={invoices} onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} />
      <SupplierList suppliers={suppliers} onEdit={handleEditSupplier} onDelete={handleDeleteSupplier} />
      <RecentPayablePayments payments={payments} />
    </div>
  );
};

export default Payables;