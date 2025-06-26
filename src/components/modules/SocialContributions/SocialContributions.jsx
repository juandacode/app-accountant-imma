import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { HeartHandshake as Handshake, Plus, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ContributionForm from './ContributionForm';
import ContributionList from './ContributionList';
import { useConfirmationDialog } from '@/components/providers/ConfirmationDialogProvider';

const SocialContributions = () => {
  const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();
  const { confirm } = useConfirmationDialog();
  const [contributions, setContributions] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContribution, setEditingContribution] = useState(null);

  const fetchData = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('aportes_sociales').select('*').order('fecha_aporte', { ascending: false });
    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los aportes sociales.", variant: "destructive" });
    } else {
      setContributions(data || []);
    }
  };

  useEffect(() => {
    if (supabase && !supabaseLoading && !supabaseError) {
      fetchData();
    }
  }, [supabase, supabaseLoading, supabaseError]);

  const handleSubmit = async (formData) => {
    if (!supabase) return;
    
    let result = {};
    if (editingContribution) {
      const { error } = await supabase.from('aportes_sociales').update(formData).eq('id', editingContribution.id);
      if (error) {
        toast({ title: "Error", description: `No se pudo actualizar el aporte: ${error.message}`, variant: "destructive" });
        return;
      }
      toast({ title: "¡Aporte actualizado!", description: "El aporte social se ha actualizado correctamente." });
    } else {
      const { data, error } = await supabase.from('aportes_sociales').insert(formData).select().single();
       if (error) {
        toast({ title: "Error", description: `No se pudo registrar el aporte: ${error.message}`, variant: "destructive" });
        return;
      }
      result = data;
      toast({ title: "¡Aporte registrado!", description: "El nuevo aporte social se ha registrado correctamente." });

      const { error: cashError } = await supabase.rpc('registrar_transaccion_caja', { 
        p_tipo_transaccion: 'INGRESO_APORTE_SOCIAL', 
        p_descripcion: `Aporte social de ${result.nombre_socio}`, 
        p_monto: result.monto_aporte,
        p_referencia_id: result.id,
        p_referencia_tabla: 'aportes_sociales'
      });
      if (cashError) toast({ title: "Error en Caja", description: `No se pudo registrar el movimiento en caja: ${cashError.message}`, variant: "destructive" });
    }
    
    setEditingContribution(null);
    setIsFormOpen(false);
    fetchData();
  };

  const handleEdit = (contribution) => {
    setEditingContribution(contribution);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
        title: 'Confirmar Eliminación',
        description: '¿Estás seguro de que quieres eliminar este aporte social? Esta acción es irreversible y eliminará el movimiento de caja asociado.',
        confirmText: 'Eliminar Aporte'
    });
    if (!confirmed) return;

    if (!supabase) return;

    const { error: cashDeleteError } = await supabase.from('caja_general_transacciones').delete().eq('referencia_id', id).eq('referencia_tabla', 'aportes_sociales');
     if (cashDeleteError && cashDeleteError.code !== 'PGRST116') { // PGRST116: No rows found
          toast({ title: "Error", description: `No se pudo eliminar el movimiento de caja asociado: ${cashDeleteError.message}`, variant: "destructive" });
     }

    const { error } = await supabase.from('aportes_sociales').delete().eq('id', id);
     if (error) {
      toast({ title: "Error", description: `No se pudo eliminar el aporte: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Aporte eliminado", description: "El aporte social y su movimiento de caja (si existía) se han eliminado." });
      fetchData();
    }
  };
  
  const totalContributions = contributions.reduce((sum, item) => sum + Number(item.monto_aporte), 0);
  const uniquePartners = new Set(contributions.map(item => item.nombre_socio)).size;

  if (supabaseLoading) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-purple-600 animate-pulse">Cargando Módulo...</p></div>;
  if (supabaseError) return <div className="flex flex-col justify-center items-center h-screen p-8 text-center"><h2 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Aportes Sociales</h2><p className="text-gray-700 mb-2">{supabaseError.message}</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Handshake className="h-8 w-8 mr-3 text-purple-600"/>
            Aportes Sociales
          </h1>
          <p className="text-gray-600 mt-1">Gestiona los aportes de capital de los socios</p>
        </div>
        <div>
           <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={() => { setEditingContribution(null); setIsFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Aporte
            </Button>
             <ContributionForm 
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleSubmit}
                editingContribution={editingContribution}
             />
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="card-hover">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Socios Aportantes</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniquePartners}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="card-hover">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capital Social Total</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(totalContributions).toLocaleString('es')}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <ContributionList 
        contributions={contributions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
export default SocialContributions;