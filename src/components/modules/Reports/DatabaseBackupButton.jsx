import React, { useState } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const DatabaseBackupButton = () => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    if (!supabase) {
      toast({ title: "Error", description: "Supabase no está disponible.", variant: "destructive" });
      return;
    }
    setLoading(true);
    toast({ title: "Iniciando Backup", description: "Preparando la descarga de la base de datos..." });

    const tablesToBackup = [
      'aportes_sociales', 'caja_general_transacciones', 'clientes', 
      'facturas_compra', 'facturas_compra_detalles', 'facturas_venta', 
      'facturas_venta_detalles', 'gastos', 'movimientos_inventario', 
      'pagos_realizados', 'pagos_recibidos', 'productos', 'proveedores'
    ];

    const backupData = {};
    let hasError = false;

    for (const table of tablesToBackup) {
      try {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          throw new Error(`Error al obtener datos de la tabla ${table}: ${error.message}`);
        }
        backupData[table] = data;
      } catch (error) {
        toast({ title: "Error en Backup", description: error.message, variant: "destructive" });
        hasError = true;
        break; 
      }
    }

    setLoading(false);

    if (hasError) {
      return;
    }

    try {
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `contableapp_backup_${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Backup Completado", description: "La base de datos se ha descargado correctamente." });
    } catch (error) {
      toast({ title: "Error al Descargar", description: `No se pudo generar el archivo de backup: ${error.message}`, variant: "destructive" });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Copia de Seguridad</CardTitle>
        <CardDescription>Descarga una copia de seguridad de tu base de datos en formato JSON.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleBackup} disabled={loading} className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white">
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Generando Backup...' : 'Descargar Backup de Base de Datos'}
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Esto descargará todas las tablas principales. Para backups programados o más avanzados, considera las opciones de Supabase.
        </p>
      </CardContent>
    </Card>
  );
};

export default DatabaseBackupButton;