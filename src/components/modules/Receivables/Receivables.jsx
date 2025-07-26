import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { DollarSign, FileText, Users, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConfirmationDialog } from '@/components/providers/ConfirmationDialogProvider';
import InvoiceForm from './InvoiceForm';
import InvoiceList from './InvoiceList';
import CustomerForm from './CustomerForm';
import CustomerList from './CustomerList';
import PaymentForm from './PaymentForm';
import RecentPayments from './RecentPayments';
import ReceivablesStats from './ReceivablesStats';

const Receivables = () => {
  const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();
  const { confirm } = useConfirmationDialog();
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');

  // CORREGIR: Solo 3 formas de pago permitidas
  const paymentMethods = ['Crédito', 'Efectivo', 'Transferencia'];

  const fetchData = async () => {
    if (!supabase) return;
    
    try {
      const [invoicesResult, customersResult, productsResult, paymentsResult, nextNumberResult] = await Promise.all([
        supabase.from('facturas_venta').select(`
          *,
          clientes (nombre_completo, cedula_id, ciudad, direccion),
          facturas_venta_detalles (
            id, cantidad, precio_unitario, subtotal,
            productos (id, nombre, sku)
          )
        `).order('fecha_emision', { ascending: false }),
        supabase.from('clientes').select('*').order('nombre_completo'),
        supabase.from('productos').select('*').order('nombre'),
        supabase.from('pagos_recibidos').select(`
          *,
          facturas_venta (numero_factura, clientes(nombre_completo))
        `).order('fecha_pago', { ascending: false }).limit(10),
        supabase.rpc('get_next_sale_invoice_number')
      ]);

      if (invoicesResult.error) throw invoicesResult.error;
      if (customersResult.error) throw customersResult.error;
      if (productsResult.error) throw productsResult.error;
      if (paymentsResult.error) throw paymentsResult.error;
      if (nextNumberResult.error) throw nextNumberResult.error;

      const processedInvoices = (invoicesResult.data || []).map(invoice => ({
        ...invoice,
        customerName: invoice.clientes?.nombre_completo,
        items: invoice.facturas_venta_detalles || []
      }));

      setInvoices(processedInvoices);
      setCustomers(customersResult.data || []);
      setProducts(productsResult.data || []);
      setPayments(paymentsResult.data || []);
      setNextInvoiceNumber(nextNumberResult.data || 'FV-000001');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: `No se pudieron cargar los datos: ${error.message}`, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (supabase && !supabaseLoading && !supabaseError) {
      fetchData();
    }
  }, [supabase, supabaseLoading, supabaseError]);

  const handleInvoiceSubmit = async (invoiceData, invoiceItems) => {
    if (!supabase) return;

    try {
      let result;
      
      if (editingInvoice) {
        const { data, error } = await supabase.from('facturas_venta').update(invoiceData).eq('id', editingInvoice.id).select().single();
        if (error) throw error;
        result = data;

        await supabase.from('facturas_venta_detalles').delete().eq('factura_venta_id', editingInvoice.id);
      } else {
        // CORREGIR: Set estado based on forma_pago (Crédito = Pendiente, Efectivo/Transferencia = Pagada)
        const estadoFactura = invoiceData.forma_pago === 'Crédito' ? 'Pendiente' : 'Pagada';
        const montosPagados = invoiceData.forma_pago === 'Crédito' ? 0 : invoiceData.monto_total;
        
        const { data, error } = await supabase.from('facturas_venta').insert({
          ...invoiceData,
          estado: estadoFactura,
          monto_pagado: montosPagados
        }).select().single();
        if (error) throw error;
        result = data;

        // CORREGIR: Registrar pago y transacción de caja para Efectivo y Transferencia
        if (invoiceData.forma_pago !== 'Crédito') {
          const { error: paymentError } = await supabase.from('pagos_recibidos').insert({
            factura_venta_id: result.id,
            monto_pago: invoiceData.monto_total,
            fecha_pago: invoiceData.fecha_emision,
            descripcion_pago: `Pago con ${invoiceData.forma_pago}`
          });
          if (paymentError) throw paymentError;

          // CORREGIR: Registrar en caja según forma de pago
          const tipoTransaccion = invoiceData.forma_pago === 'Efectivo' ? 'INGRESO_VENTA_EFECTIVO' : 'INGRESO_VENTA_TRANSFERENCIA';
          const { error: cashError } = await supabase.rpc('registrar_transaccion_caja', {
            p_tipo_transaccion: tipoTransaccion,
            p_descripcion: `Venta ${invoiceData.forma_pago} factura ${result.numero_factura}`,
            p_monto: invoiceData.monto_total,
            p_referencia_id: result.id,
            p_referencia_tabla: 'facturas_venta'
          });
          if (cashError) throw cashError;
        }
      }

      const invoiceDetailsData = invoiceItems.map(item => ({
        factura_venta_id: result.id,
        producto_id: parseInt(item.producto_id),
        cantidad: parseInt(item.cantidad),
        precio_unitario: parseFloat(item.precio_unitario),
        subtotal: parseFloat(item.subtotal)
      }));

      const { error: detailsError } = await supabase.from('facturas_venta_detalles').insert(invoiceDetailsData);
      if (detailsError) throw detailsError;

      // CORREGIR: Actualizar inventario solo para facturas nuevas
      if (!editingInvoice) {
        for (const item of invoiceItems) {
          // CORREGIR: Obtener cantidad actual antes de actualizarla
          const { data: productData, error: getProductError } = await supabase
            .from('productos')
            .select('cantidad_actual')
            .eq('id', parseInt(item.producto_id))
            .single();
          
          if (getProductError) throw getProductError;
          
          // CORREGIR: Asegurar cantidad_actual como número válido
          const currentStock = productData.cantidad_actual || 0;
          const newStock = currentStock - parseInt(item.cantidad);
          
          // CORREGIR: Validar stock suficiente
          if (newStock < 0) {
            throw new Error(`Stock insuficiente para el producto. Disponible: ${currentStock}, Solicitado: ${item.cantidad}`);
          }

          const { error: inventoryError } = await supabase
            .from('productos')
            .update({ cantidad_actual: newStock })
            .eq('id', parseInt(item.producto_id));
          
          if (inventoryError) throw inventoryError;

          const { error: movementError } = await supabase.from('movimientos_inventario').insert({
            producto_id: parseInt(item.producto_id),
            tipo_movimiento: 'SALIDA',
            cantidad: parseInt(item.cantidad),
            cantidad_anterior: currentStock,
            cantidad_nueva: newStock,
            descripcion_movimiento: `Venta - Factura ${result.numero_factura}`
          });
          if (movementError) throw movementError;
        }
      }

      toast({ 
        title: editingInvoice ? "Factura actualizada" : "Factura creada", 
        description: editingInvoice ? "La factura se ha actualizado correctamente." : "La nueva factura se ha creado correctamente." 
      });

      setEditingInvoice(null);
      setIsInvoiceFormOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({ title: "Error", description: `Error al guardar la factura: ${error.message}`, variant: "destructive" });
    }
  };

  const handleCustomerSubmit = async (customerData) => {
    if (!supabase) return;

    try {
      if (editingCustomer) {
        const { error } = await supabase.from('clientes').update(customerData).eq('id', editingCustomer.id);
        if (error) throw error;
        toast({ title: "Cliente actualizado", description: "El cliente se ha actualizado correctamente." });
      } else {
        const { error } = await supabase.from('clientes').insert(customerData);
        if (error) throw error;
        toast({ title: "Cliente creado", description: "El nuevo cliente se ha creado correctamente." });
      }
      setEditingCustomer(null);
      setIsCustomerFormOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({ title: "Error", description: `Error al guardar el cliente: ${error.message}`, variant: "destructive" });
    }
  };

  const handlePaymentSubmit = async (paymentData) => {
    if (!supabase) return;

    try {
      const { error } = await supabase.from('pagos_recibidos').insert(paymentData);
      if (error) throw error;

      const invoice = invoices.find(inv => inv.id === paymentData.factura_venta_id);
      if (invoice) {
        const newPaidAmount = (invoice.monto_pagado || 0) + paymentData.monto_pago;
        const newStatus = newPaidAmount >= invoice.monto_total ? 'Pagada' : 'Pendiente';
        
        const { error: updateError } = await supabase.from('facturas_venta').update({
          monto_pagado: newPaidAmount,
          estado: newStatus
        }).eq('id', paymentData.factura_venta_id);
        if (updateError) throw updateError;

        const { error: cashError } = await supabase.rpc('registrar_transaccion_caja', {
          p_tipo_transaccion: 'INGRESO_PAGO_FACTURA',
          p_descripcion: `Pago recibido factura ${invoice.numero_factura}`,
          p_monto: paymentData.monto_pago,
          p_referencia_id: paymentData.factura_venta_id,
          p_referencia_tabla: 'facturas_venta'
        });
        if (cashError) throw cashError;
      }

      toast({ title: "Pago registrado", description: "El pago se ha registrado correctamente." });
      setIsPaymentFormOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving payment:', error);
      toast({ title: "Error", description: `Error al registrar el pago: ${error.message}`, variant: "destructive" });
    }
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setIsInvoiceFormOpen(true);
  };

  const handleDeleteInvoice = async (id) => {
    const confirmed = await confirm({
      title: 'Confirmar Eliminación',
      description: '¿Estás seguro de que quieres eliminar esta factura? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar Factura'
    });
    if (!confirmed) return;

    if (!supabase) return;

    try {
      await supabase.from('facturas_venta_detalles').delete().eq('factura_venta_id', id);
      const { error } = await supabase.from('facturas_venta').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Factura eliminada", description: "La factura se ha eliminado correctamente." });
      fetchData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({ title: "Error", description: `Error al eliminar la factura: ${error.message}`, variant: "destructive" });
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsCustomerFormOpen(true);
  };

  const handleDeleteCustomer = async (id) => {
    const confirmed = await confirm({
      title: 'Confirmar Eliminación',
      description: '¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar Cliente'
    });
    if (!confirmed) return;

    if (!supabase) return;

    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Cliente eliminado", description: "El cliente se ha eliminado correctamente." });
      fetchData();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({ title: "Error", description: `Error al eliminar el cliente: ${error.message}`, variant: "destructive" });
    }
  };

  const stats = {
    totalInvoices: invoices.length,
    pendingInvoices: invoices.filter(inv => inv.estado === 'Pendiente').length,
    totalRevenue: invoices.reduce((sum, inv) => sum + (inv.monto_total || 0), 0),
    pendingAmount: invoices.filter(inv => inv.estado === 'Pendiente').reduce((sum, inv) => sum + ((inv.monto_total || 0) - (inv.monto_pagado || 0)), 0)
  };

  if (supabaseLoading) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-blue-600 animate-pulse">Cargando Módulo...</p></div>;
  if (supabaseError) return <div className="flex flex-col justify-center items-center h-screen p-8 text-center"><h2 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Módulo</h2><p className="text-gray-700 mb-2">{supabaseError.message}</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <DollarSign className="h-8 w-8 mr-3 text-blue-600"/>
            Cuentas por Cobrar
          </h1>
          <p className="text-gray-600 mt-1">Gestiona facturas de venta, clientes y pagos</p>
        </div>
      </div>

      <ReceivablesStats 
        clientsCount={customers.length}
        totalReceived={invoices.reduce((sum, inv) => sum + (inv.monto_pagado || 0), 0)}
        totalReceivable={invoices.filter(inv => inv.estado === 'Pendiente').reduce((sum, inv) => sum + (inv.monto_total - (inv.monto_pagado || 0)), 0)}
        pendingInvoicesCount={invoices.filter(inv => inv.estado === 'Pendiente').length}
      />

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'invoices', label: 'Facturas', icon: FileText },
          { key: 'customers', label: 'Clientes', icon: Users },
          { key: 'payments', label: 'Pagos', icon: DollarSign }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => { setEditingInvoice(null); setIsInvoiceFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
            <InvoiceForm 
              isOpen={isInvoiceFormOpen}
              onOpenChange={setIsInvoiceFormOpen}
              onSubmit={handleInvoiceSubmit}
              editingInvoice={editingInvoice}
              customers={customers}
              products={products}
              paymentMethods={paymentMethods}
              nextInvoiceNumber={nextInvoiceNumber}
            />
          </div>
          <InvoiceList invoices={invoices} onEdit={handleEditInvoice} onDelete={handleDeleteInvoice} />
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => { setEditingCustomer(null); setIsCustomerFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
            <CustomerForm 
              isOpen={isCustomerFormOpen}
              onOpenChange={setIsCustomerFormOpen}
              onSubmit={handleCustomerSubmit}
              editingCustomer={editingCustomer}
            />
          </div>
          <CustomerList customers={customers} onEdit={handleEditCustomer} onDelete={handleDeleteCustomer} />
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => setIsPaymentFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Pago
            </Button>
            <PaymentForm 
              isOpen={isPaymentFormOpen}
              onOpenChange={setIsPaymentFormOpen}
              onSubmit={handlePaymentSubmit}
              invoices={invoices.filter(inv => inv.estado === 'Pendiente')}
            />
          </div>
          <RecentPayments payments={payments} />
        </div>
      )}
    </div>
  );
};

export default Receivables;
