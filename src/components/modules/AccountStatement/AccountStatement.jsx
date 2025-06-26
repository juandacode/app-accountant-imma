import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import { BookUser } from 'lucide-react';
import StatementControls from './StatementControls';
import StatementView from './StatementView';

const AccountStatement = () => {
    const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();
    const [customers, setCustomers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [statementData, setStatementData] = useState(null);
    const [loading, setLoading] = useState(false); 
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);


    const fetchEntities = async () => {
        if (!supabase) {
            toast({ title: "Supabase no disponible", description: "No se pueden cargar clientes/proveedores.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const { data: customersData, error: customersError } = await supabase.from('clientes').select('id, nombre_completo').order('nombre_completo');
            if (customersError) throw customersError;
            setCustomers(customersData || []);
            
            const { data: suppliersData, error: suppliersError } = await supabase.from('proveedores').select('id, nombre_proveedor').order('nombre_proveedor');
            if (suppliersError) throw suppliersError;
            setSuppliers(suppliersData || []);
            setInitialDataLoaded(true);
        } catch (error) {
            toast({ title: "Error al Cargar Entidades", description: `No se pudieron cargar clientes/proveedores: ${error.message}`, variant: "destructive" });
            setCustomers([]);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (supabase && !supabaseLoading && !supabaseError) {
             fetchEntities();
        }
    }, [supabase, supabaseLoading, supabaseError]);
    
    const handleGenerateStatement = async (entityType, entityId) => {
        if (!supabase || !entityType || !entityId) {
            toast({ title: "Información incompleta", description: "Por favor, selecciona un tipo y una entidad.", variant: "destructive"});
            setStatementData(null); 
            return;
        };
        setLoading(true);
        setStatementData(null); 

        try {
            const { data, error } = await supabase.rpc('get_account_statement', {
                p_entity_type: entityType,
                p_entity_id: parseInt(entityId)
            });

            if (error) throw error;
            
            const entityName = entityType === 'cliente'
                ? customers.find(c => c.id === parseInt(entityId))?.nombre_completo
                : suppliers.find(s => s.id === parseInt(entityId))?.nombre_proveedor;

            if (data && data.transactions !== undefined && data.balance !== undefined) {
                 setStatementData({ ...data, entityName, entityType });
                 if(data.transactions.length === 0) {
                    toast({ title: "Sin datos", description: "No se encontraron transacciones para esta entidad.", variant: "default"});
                 }
            } else {
                setStatementData({ transactions: [], balance: 0, entityName, entityType });
                toast({ title: "Respuesta inesperada", description: "No se pudo obtener el estado de cuenta completo o no hay datos.", variant: "default"});
            }

        } catch(error) {
            toast({ title: "Error al generar estado de cuenta", description: error.message, variant: "destructive"});
            setStatementData(null); 
        } finally {
            setLoading(false);
        }
    };

    if (supabaseLoading || (loading && !initialDataLoaded)) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-pink-600 animate-pulse">Cargando Módulo de Estado de Cuenta...</p></div>;
    if (supabaseError) return <div className="flex flex-col justify-center items-center h-screen p-8 text-center"><h2 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Módulo</h2><p className="text-gray-700 mb-2">{supabaseError.message}</p><p>Recarga la página o verifica tu conexión.</p></div>;
    if (!initialDataLoaded && !loading) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-orange-600">Esperando datos iniciales...</p></div>;


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <BookUser className="h-8 w-8 mr-3 text-pink-600"/>
                    Estado de Cuenta
                </h1>
                <p className="text-gray-600 mt-1">Consulta el historial de transacciones de clientes y proveedores</p>
                </div>
            </div>
            
            <StatementControls
                customers={customers}
                suppliers={suppliers}
                onGenerate={handleGenerateStatement}
                isLoading={loading}
                disabled={!initialDataLoaded}
            />

            {loading && initialDataLoaded && ( 
                 <div className="flex justify-center items-center h-64"><p className="text-lg text-pink-600 animate-pulse">Generando estado de cuenta...</p></div>
            )}

            {!loading && statementData && (
                <StatementView data={statementData} />
            )}

            {!loading && !statementData && initialDataLoaded && (
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg shadow">
                    <p className="text-lg">Selecciona un cliente o proveedor y haz clic en "Generar Estado de Cuenta" para ver los detalles.</p>
                </div>
            )}
        </div>
    );
}

export default AccountStatement;