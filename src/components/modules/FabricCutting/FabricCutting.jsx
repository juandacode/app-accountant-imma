import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import FabricEntryForm from './FabricEntryForm';
import FabricCutForm from './FabricCutForm';
import FabricInventoryList from './FabricInventoryList';
import FabricCutList from './FabricCutList';
import { Button } from '@/components/ui/button';
import { Scissors, PackagePlus, ListOrdered, LayoutList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useConfirmationDialog } from '@/components/providers/ConfirmationDialogProvider';

const FabricCutting = () => {
  const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();
  const { confirm } = useConfirmationDialog();
  const [fabricInventory, setFabricInventory] = useState([]);
  const [fabricCuts, setFabricCuts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [isCutFormOpen, setIsCutFormOpen] = useState(false);
  const [editingFabricEntry, setEditingFabricEntry] = useState(null);
  const [editingFabricCut, setEditingFabricCut] = useState(null);
  const [activeTab, setActiveTab] = useState("inventory");

  const paymentMethods = ['Efectivo', 'Crédito', 'Transferencia'];

  const fetchData = async () => {
    if (!supabase) return;

    const { data: inventoryData, error: inventoryError } = await supabase
      .from('telas_inventario')
      .select('*, proveedores(nombre_proveedor)')
      .order('fecha_ingreso', { ascending: false });
    if (inventoryError) toast({ title: "Error", description: `No se pudo cargar el inventario de telas: ${inventoryError.message}`, variant: "destructive" });
    else setFabricInventory(inventoryData || []);

    const { data: cutsData, error: cutsError } = await supabase
      .from('telas_cortes')
      .select('*, telas_inventario(id, nombre_tela, color, codigo_rollo)')
      .order('fecha_corte', { ascending: false });
    if (cutsError) toast({ title: "Error", description: `No se pudieron cargar los cortes de tela: ${cutsError.message}`, variant: "destructive" });
    else setFabricCuts(cutsData || []);

    const { data: suppliersData, error: suppliersError } = await supabase.from('proveedores').select('id, nombre_proveedor').order('nombre_proveedor');
    if (suppliersError) toast({ title: "Error", description: "No se pudieron cargar los proveedores.", variant: "destructive" });
    else setSuppliers(suppliersData || []);
  };

  useEffect(() => {
    if (supabase && !supabaseLoading && !supabaseError) {
      fetchData();
    }
  }, [supabase, supabaseLoading, supabaseError]);

  const handleEntrySubmit = async (entryData) => {
    if (!supabase) return;
    
    let savedEntry;
    const dataToSave = { ...entryData };
    delete dataToSave.proveedores; 

    if (editingFabricEntry) {
      const { data, error } = await supabase.from('telas_inventario').update(dataToSave).eq('id', editingFabricEntry.id).select().single();
      if (error) { toast({ title: "Error", description: `No se pudo actualizar la entrada de tela: ${error.message}`, variant: "destructive" }); return; }
      savedEntry = data;
      toast({ title: "¡Entrada de tela actualizada!", description: "La entrada de tela se ha actualizado." });
    } else {
      const { data, error } = await supabase.from('telas_inventario').insert(dataToSave).select().single();
      if (error) { toast({ title: "Error", description: `No se pudo registrar la entrada de tela: ${error.message}`, variant: "destructive" }); return; }
      savedEntry = data;
      toast({ title: "¡Entrada de tela registrada!", description: "La nueva tela se ha añadido al inventario." });
    }

    if (savedEntry.metodo_pago === 'Efectivo') {
        if (editingFabricEntry && editingFabricEntry.metodo_pago === 'Efectivo' && editingFabricEntry.id === savedEntry.id) {
            await supabase.from('caja_general_transacciones').delete().eq('referencia_id', savedEntry.id).eq('referencia_tabla', 'telas_inventario');
        }
        const { error: cashError } = await supabase.rpc('registrar_transaccion_caja', { 
            p_tipo_transaccion: 'EGRESO_COMPRA_TELA', 
            p_descripcion: `Compra Tela Rollo ${savedEntry.codigo_rollo} - ${savedEntry.nombre_tela}`, 
            p_monto: savedEntry.total_tela, 
            p_referencia_id: savedEntry.id, 
            p_referencia_tabla: 'telas_inventario' 
        });
        if (cashError) toast({ title: "Error en Caja", description: `No se pudo registrar el movimiento en caja: ${cashError.message}`, variant: "destructive" });
    } else if (editingFabricEntry && editingFabricEntry.metodo_pago === 'Efectivo' && savedEntry.metodo_pago !== 'Efectivo' && editingFabricEntry.id === savedEntry.id) {
        await supabase.from('caja_general_transacciones').delete().eq('referencia_id', savedEntry.id).eq('referencia_tabla', 'telas_inventario');
    }


    setEditingFabricEntry(null);
    setIsEntryFormOpen(false);
    fetchData();
  };

  const handleCutSubmit = async (cutData) => {
    if (!supabase) return;

    const fabricItem = fabricInventory.find(f => f.id === parseInt(cutData.tela_inventario_id));
    if (!fabricItem || fabricItem.metraje_saldo < parseFloat(cutData.metros_cortados)) {
      toast({ title: "Error", description: "Metraje insuficiente o tela no encontrada.", variant: "destructive" });
      return;
    }
    
    const dataToSave = { 
        ...cutData,
        metros_cortados: parseFloat(cutData.metros_cortados),
        tela_inventario_id: parseInt(cutData.tela_inventario_id)
    };
    delete dataToSave.telas_inventario; 

    if (editingFabricCut) {
      const originalCut = fabricCuts.find(fc => fc.id === editingFabricCut.id);
      
      if (originalCut) {
        const oldFabricItem = fabricInventory.find(f => f.id === parseInt(originalCut.tela_inventario_id));
        if (oldFabricItem) {
          await supabase.from('telas_inventario').update({ metraje_saldo: oldFabricItem.metraje_saldo + parseFloat(originalCut.metros_cortados) }).eq('id', oldFabricItem.id);
        }
      }
      
      const { error } = await supabase.from('telas_cortes').update(dataToSave).eq('id', editingFabricCut.id);
      if (error) { 
        toast({ title: "Error", description: `No se pudo actualizar el corte: ${error.message}`, variant: "destructive" }); 
        if (originalCut) {
            const oldFabricItem = fabricInventory.find(f => f.id === parseInt(originalCut.tela_inventario_id));
            if (oldFabricItem) {
                await supabase.from('telas_inventario').update({ metraje_saldo: oldFabricItem.metraje_saldo - parseFloat(originalCut.metros_cortados) }).eq('id', oldFabricItem.id);
            }
        }
        return; 
      }
      toast({ title: "¡Corte actualizado!", description: "El registro de corte de tela se ha actualizado." });
      
      const newFabricItemForCut = fabricInventory.find(f => f.id === parseInt(dataToSave.tela_inventario_id));
      if (newFabricItemForCut) {
          const { data: currentNewFabricData, error: currentNewFabricError } = await supabase.from('telas_inventario').select('metraje_saldo').eq('id', newFabricItemForCut.id).single();
          if (currentNewFabricError) { /* handle error */ }
          else {
            await supabase.from('telas_inventario').update({ metraje_saldo: currentNewFabricData.metraje_saldo - parseFloat(dataToSave.metros_cortados) }).eq('id', newFabricItemForCut.id);
          }
      }

    } else { 
      const { error } = await supabase.from('telas_cortes').insert(dataToSave);
      if (error) { toast({ title: "Error", description: `No se pudo registrar el corte: ${error.message}`, variant: "destructive" }); return; }
      toast({ title: "¡Corte registrado!", description: "El corte de tela se ha registrado." });
      await supabase.from('telas_inventario').update({ metraje_saldo: fabricItem.metraje_saldo - parseFloat(cutData.metros_cortados) }).eq('id', fabricItem.id);
    }

    setEditingFabricCut(null);
    setIsCutFormOpen(false);
    fetchData();
  };
  
  const handleEditEntry = (entry) => {
    setEditingFabricEntry(entry);
    setIsEntryFormOpen(true);
  };

  const handleDeleteEntry = async (entryId) => {
    const confirmed = await confirm({ title: 'Confirmar Eliminación', description: '¿Eliminar esta entrada de tela? Se eliminarán los cortes asociados y movimientos de caja.'});
    if (!confirmed || !supabase) return;
    
    const entryToDelete = fabricInventory.find(e => e.id === entryId);

    await supabase.from('telas_cortes').delete().eq('tela_inventario_id', entryId);
    if (entryToDelete && entryToDelete.metodo_pago === 'Efectivo') {
        await supabase.from('caja_general_transacciones').delete().eq('referencia_id', entryId).eq('referencia_tabla', 'telas_inventario');
    }
    const { error } = await supabase.from('telas_inventario').delete().eq('id', entryId);
    if (error) toast({ title: "Error", description: `No se pudo eliminar la entrada: ${error.message}`, variant: "destructive" });
    else toast({ title: "Entrada Eliminada", description: "La entrada de tela se ha eliminado." });
    fetchData();
  };

  const handleEditCut = (cut) => {
    const cutToEdit = {
        ...cut,
        tela_inventario_id: String(cut.telas_inventario.id), // Ensure it's a string for Select component
        metros_cortados: String(cut.metros_cortados) // Ensure it's a string for Input component
    };
    setEditingFabricCut(cutToEdit);
    setIsCutFormOpen(true);
  };

  const handleDeleteCut = async (cutId) => {
    const confirmed = await confirm({ title: 'Confirmar Eliminación', description: '¿Eliminar este registro de corte? Se devolverá el metraje al inventario.'});
    if (!confirmed || !supabase) return;

    const cutToDelete = fabricCuts.find(c => c.id === cutId);
    if (cutToDelete) {
      const fabricItem = fabricInventory.find(f => f.id === cutToDelete.telas_inventario.id);
      if (fabricItem) {
        await supabase.from('telas_inventario').update({ metraje_saldo: fabricItem.metraje_saldo + parseFloat(cutToDelete.metros_cortados) }).eq('id', fabricItem.id);
      }
    }
    const { error } = await supabase.from('telas_cortes').delete().eq('id', cutId);
    if (error) toast({ title: "Error", description: `No se pudo eliminar el corte: ${error.message}`, variant: "destructive" });
    else toast({ title: "Corte Eliminado", description: "El corte de tela se ha eliminado y el metraje devuelto." });
    fetchData();
  };

  if (supabaseLoading) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-pink-600 animate-pulse">Cargando Módulo de Telas...</p></div>;
  if (supabaseError) return <div className="flex flex-col justify-center items-center h-screen p-8 text-center"><h2 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Módulo</h2><p className="text-gray-700 mb-2">{supabaseError.message}</p></div>;


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Scissors className="h-8 w-8 mr-3 text-pink-500"/>
            Gestión de Telas y Corte
          </h1>
          <p className="text-gray-600 mt-1">Controla tu inventario de telas y los cortes realizados.</p>
        </div>
        <div className="flex space-x-3">
           <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" onClick={() => { setEditingFabricEntry(null); setIsEntryFormOpen(true); }}>
            <PackagePlus className="h-4 w-4 mr-2" />
            Registrar Compra Tela
          </Button>
          <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600" onClick={() => { setEditingFabricCut(null); setIsCutFormOpen(true); }} disabled={fabricInventory.filter(f => f.metraje_saldo > 0).length === 0}>
            <Scissors className="h-4 w-4 mr-2" />
            Registrar Salida a Corte
          </Button>
        </div>
      </div>

      {isEntryFormOpen && (
        <FabricEntryForm 
          isOpen={isEntryFormOpen} 
          onOpenChange={(isOpen) => { setIsEntryFormOpen(isOpen); if (!isOpen) setEditingFabricEntry(null); }} 
          onSubmit={handleEntrySubmit} 
          editingFabricEntry={editingFabricEntry}
          suppliers={suppliers}
          paymentMethods={paymentMethods}
        />
      )}
      {isCutFormOpen && (
        <FabricCutForm 
          isOpen={isCutFormOpen} 
          onOpenChange={(isOpen) => { setIsCutFormOpen(isOpen); if (!isOpen) setEditingFabricCut(null); }} 
          onSubmit={handleCutSubmit} 
          editingFabricCut={editingFabricCut}
          fabricInventory={fabricInventory.filter(f => f.metraje_saldo > 0)}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-pink-100/60">
          <TabsTrigger value="inventory" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
            <ListOrdered className="mr-2 h-5 w-5" />Inventario de Telas
          </TabsTrigger>
          <TabsTrigger value="cuts" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
            <LayoutList className="mr-2 h-5 w-5" />Historial de Cortes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">Inventario de Telas</CardTitle>
            </CardHeader>
            <CardContent>
              <FabricInventoryList fabricInventory={fabricInventory} onEdit={handleEditEntry} onDelete={handleDeleteEntry} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cuts">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">Historial de Cortes</CardTitle>
            </CardHeader>
            <CardContent>
              <FabricCutList fabricCuts={fabricCuts} onEdit={handleEditCut} onDelete={handleDeleteCut} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FabricCutting;