import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const StatementControls = ({ customers, suppliers, onGenerate, isLoading, disabled }) => {
    const [entityType, setEntityType] = useState('');
    const [entityId, setEntityId] = useState('');
    
    const handleGenerateClick = () => {
        onGenerate(entityType, entityId);
    };

    const handleEntityTypeChange = (type) => {
        setEntityType(type);
        setEntityId(''); // Reset entity selection when type changes
    };

    const entityList = entityType === 'cliente' ? customers : suppliers;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <Label htmlFor="entityType">Tipo de Entidad</Label>
                        <Select onValueChange={handleEntityTypeChange} value={entityType} disabled={disabled || isLoading}>
                            <SelectTrigger id="entityType">
                                <SelectValue placeholder="Seleccionar tipo..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cliente">Cliente</SelectItem>
                                <SelectItem value="proveedor">Proveedor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="md:col-span-1">
                        <Label htmlFor="entityId">Seleccionar Entidad</Label>
                         <Select onValueChange={setEntityId} value={entityId} disabled={!entityType || disabled || isLoading || entityList.length === 0}>
                            <SelectTrigger id="entityId">
                                <SelectValue placeholder={entityType ? (entityList.length === 0 ? `No hay ${entityType}s` : `Seleccionar ${entityType}...`): 'Primero elije un tipo'} />
                            </SelectTrigger>
                            <SelectContent>
                                {entityList.map(entity => (
                                    <SelectItem key={entity.id} value={String(entity.id)}>
                                        {entity.nombre_completo || entity.nombre_proveedor}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Button onClick={handleGenerateClick} disabled={!entityId || isLoading || disabled} className="w-full">
                            <Search className="h-4 w-4 mr-2" />
                            {isLoading ? 'Generando...' : 'Generar Estado de Cuenta'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default StatementControls;