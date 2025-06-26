import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarSearch } from 'lucide-react';

const MonthlyIncomeStatement = () => {
    const { supabase } = useSupabase();
    const [statement, setStatement] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('es', { month: 'long' }) }));

    const fetchStatement = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_monthly_income_statement', {
                p_year: selectedYear,
                p_month: selectedMonth
            });
            if (error) throw error;
            setStatement(data);
        } catch (error) {
            toast({ title: "Error", description: `No se pudo generar el estado de resultados: ${error.message}`, variant: "destructive" });
            setStatement(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatement();
    }, [selectedYear, selectedMonth, supabase]);

    const formatCurrency = (value) => {
        return `$${Number(value).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Estado de Resultados Mensual (PyG)
                    <div className="flex items-center space-x-2">
                        <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Mes" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map(month => (
                                    <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(year => (
                                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={fetchStatement} disabled={loading} size="icon">
                            <CalendarSearch className="h-4 w-4" />
                        </Button>
                    </div>
                </CardTitle>
                <CardDescription>
                    Detalle de ingresos, costos y gastos para el período seleccionado.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading && <p className="text-center text-purple-600 animate-pulse">Cargando estado de resultados...</p>}
                {!loading && !statement && <p className="text-center text-gray-500">No hay datos para mostrar para el período seleccionado.</p>}
                {!loading && statement && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div className="font-medium text-gray-700">Ingresos por Ventas:</div>
                            <div className="text-right font-semibold text-green-600">{formatCurrency(statement.total_revenue)}</div>

                            <div className="font-medium text-gray-700">Costo de Mercancía Vendida (CMV):</div>
                            <div className="text-right font-semibold text-orange-600">({formatCurrency(statement.total_cogs)})</div>
                            
                            <div className="col-span-2 border-b my-1"></div>

                            <div className="font-bold text-gray-800">Utilidad Bruta:</div>
                            <div className={`text-right font-bold ${statement.gross_profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(statement.gross_profit)}</div>
                            
                            <div className="col-span-2 mt-2"></div>

                            <div className="font-medium text-gray-700">Gastos Operativos:</div>
                            <div className="text-right font-semibold text-red-600">({formatCurrency(statement.total_operating_expenses)})</div>

                            <div className="col-span-2 border-b my-1"></div>

                            <div className="font-extrabold text-lg text-gray-900">Utilidad Neta del Mes:</div>
                            <div className={`text-right font-extrabold text-lg ${statement.net_income >= 0 ? 'text-blue-700' : 'text-pink-700'}`}>{formatCurrency(statement.net_income)}</div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default MonthlyIncomeStatement;