-- Fix fabric purchase cash transaction registration and cleanup orphaned transactions

-- 1. Update the fabric purchase cash transaction trigger to reference the correct table
CREATE OR REPLACE FUNCTION public.register_fabric_purchase_cash_transaction()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    -- Solo registrar en caja si es pago en efectivo y está pagada
    IF NEW.forma_pago = 'Efectivo' AND NEW.estado = 'Pagada' THEN
        -- Si es INSERT o si cambió de no pagada a pagada
        IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.estado != 'Pagada') THEN
            PERFORM registrar_transaccion_caja(
                'EGRESO_COMPRA_TELA',
                'Compra Tela Factura ' || NEW.numero_factura,
                NEW.monto_total,
                NEW.id,
                'facturas_compra_tela'  -- Corregido: usar la tabla de facturas, no inventario
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;

-- 2. Update the cleanup function to handle all orphaned cash transactions
CREATE OR REPLACE FUNCTION public.limpiar_datos_huerfanos()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Limpiar transacciones de caja huérfanas (sin facturas correspondientes)
    DELETE FROM caja_general_transacciones 
    WHERE referencia_tabla = 'facturas_venta' 
    AND referencia_id NOT IN (SELECT id FROM facturas_venta);
    
    DELETE FROM caja_general_transacciones 
    WHERE referencia_tabla = 'facturas_compra' 
    AND referencia_id NOT IN (SELECT id FROM facturas_compra);
    
    DELETE FROM caja_general_transacciones 
    WHERE referencia_tabla = 'facturas_compra_tela' 
    AND referencia_id NOT IN (SELECT id FROM facturas_compra_tela);
    
    DELETE FROM caja_general_transacciones 
    WHERE referencia_tabla = 'pagos_recibidos' 
    AND referencia_id NOT IN (SELECT id FROM pagos_recibidos);
    
    DELETE FROM caja_general_transacciones 
    WHERE referencia_tabla = 'pagos_realizados' 
    AND referencia_id NOT IN (SELECT id FROM pagos_realizados);
    
    DELETE FROM caja_general_transacciones 
    WHERE referencia_tabla = 'pagos_facturas_compra_tela' 
    AND referencia_id NOT IN (SELECT id FROM pagos_facturas_compra_tela);
    
    -- NUEVO: Limpiar transacciones que referencian telas_inventario pero que deberían ser facturas_compra_tela
    DELETE FROM caja_general_transacciones 
    WHERE referencia_tabla = 'telas_inventario' 
    AND referencia_id NOT IN (SELECT id FROM telas_inventario);
    
    -- Resetear el stock de productos a cero si no tienen facturas de compra válidas
    UPDATE productos SET cantidad_actual = 0 
    WHERE id NOT IN (
        SELECT DISTINCT fcd.producto_id 
        FROM facturas_compra_detalles fcd 
        JOIN facturas_compra fc ON fcd.factura_compra_id = fc.id
        WHERE fcd.producto_id IS NOT NULL
    ) OR id IN (
        SELECT DISTINCT fvd.producto_id 
        FROM facturas_venta_detalles fvd 
        JOIN facturas_venta fv ON fvd.factura_venta_id = fv.id
        WHERE fvd.producto_id IS NOT NULL
    );
    
    -- Limpiar movimientos de inventario huérfanos
    DELETE FROM movimientos_inventario 
    WHERE descripcion_movimiento LIKE '%Factura FV-%' 
    AND producto_id NOT IN (
        SELECT DISTINCT fvd.producto_id 
        FROM facturas_venta_detalles fvd 
        JOIN facturas_venta fv ON fvd.factura_venta_id = fv.id
        WHERE fvd.producto_id IS NOT NULL
    );
    
    DELETE FROM movimientos_inventario 
    WHERE descripcion_movimiento LIKE '%Factura FC-%' 
    AND producto_id NOT IN (
        SELECT DISTINCT fcd.producto_id 
        FROM facturas_compra_detalles fcd 
        JOIN facturas_compra fc ON fcd.factura_compra_id = fc.id
        WHERE fcd.producto_id IS NOT NULL
    );
END;
$function$;

-- 3. Ejecutar limpieza inmediata para remover transacciones huérfanas actuales
SELECT public.limpiar_datos_huerfanos();