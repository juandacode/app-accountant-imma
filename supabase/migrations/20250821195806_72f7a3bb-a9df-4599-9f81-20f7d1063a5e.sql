-- Función para limpiar datos huérfanos después de eliminar facturas
CREATE OR REPLACE FUNCTION limpiar_datos_huerfanos()
RETURNS void
LANGUAGE plpgsql
AS $$
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
$$;

-- Trigger para limpiar transacciones de caja al eliminar facturas de venta
CREATE OR REPLACE FUNCTION cleanup_cash_transactions_on_invoice_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Eliminar transacciones de caja relacionadas con la factura eliminada
    DELETE FROM caja_general_transacciones 
    WHERE referencia_tabla = TG_TABLE_NAME 
    AND referencia_id = OLD.id;
    
    RETURN OLD;
END;
$$;

-- Trigger para revertir movimientos de inventario al eliminar facturas
CREATE OR REPLACE FUNCTION cleanup_inventory_movements_on_invoice_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    detalle_record RECORD;
BEGIN
    -- Para facturas de venta: revertir las salidas de inventario
    IF TG_TABLE_NAME = 'facturas_venta' THEN
        FOR detalle_record IN 
            SELECT producto_id, cantidad 
            FROM facturas_venta_detalles 
            WHERE factura_venta_id = OLD.id
        LOOP
            -- Revertir la salida sumando de vuelta al stock
            UPDATE productos 
            SET cantidad_actual = cantidad_actual + detalle_record.cantidad
            WHERE id = detalle_record.producto_id;
            
            -- Eliminar movimientos relacionados
            DELETE FROM movimientos_inventario 
            WHERE descripcion_movimiento LIKE '%Factura ' || OLD.numero_factura || '%'
            AND producto_id = detalle_record.producto_id;
        END LOOP;
    END IF;
    
    -- Para facturas de compra: revertir las entradas de inventario  
    IF TG_TABLE_NAME = 'facturas_compra' THEN
        FOR detalle_record IN 
            SELECT producto_id, cantidad 
            FROM facturas_compra_detalles 
            WHERE factura_compra_id = OLD.id
        LOOP
            -- Revertir la entrada restando del stock
            UPDATE productos 
            SET cantidad_actual = GREATEST(0, cantidad_actual - detalle_record.cantidad)
            WHERE id = detalle_record.producto_id;
            
            -- Eliminar movimientos relacionados
            DELETE FROM movimientos_inventario 
            WHERE descripcion_movimiento LIKE '%Factura ' || OLD.numero_factura || '%'
            AND producto_id = detalle_record.producto_id;
        END LOOP;
    END IF;
    
    RETURN OLD;
END;
$$;

-- Crear triggers para facturas de venta
DROP TRIGGER IF EXISTS trigger_cleanup_cash_on_factura_venta_delete ON facturas_venta;
CREATE TRIGGER trigger_cleanup_cash_on_factura_venta_delete
    BEFORE DELETE ON facturas_venta
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_cash_transactions_on_invoice_delete();

DROP TRIGGER IF EXISTS trigger_cleanup_inventory_on_factura_venta_delete ON facturas_venta;
CREATE TRIGGER trigger_cleanup_inventory_on_factura_venta_delete
    BEFORE DELETE ON facturas_venta
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_inventory_movements_on_invoice_delete();

-- Crear triggers para facturas de compra
DROP TRIGGER IF EXISTS trigger_cleanup_cash_on_factura_compra_delete ON facturas_compra;
CREATE TRIGGER trigger_cleanup_cash_on_factura_compra_delete
    BEFORE DELETE ON facturas_compra
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_cash_transactions_on_invoice_delete();

DROP TRIGGER IF EXISTS trigger_cleanup_inventory_on_factura_compra_delete ON facturas_compra;
CREATE TRIGGER trigger_cleanup_inventory_on_factura_compra_delete
    BEFORE DELETE ON facturas_compra
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_inventory_movements_on_invoice_delete();

-- Crear triggers para facturas de compra de tela
DROP TRIGGER IF EXISTS trigger_cleanup_cash_on_factura_compra_tela_delete ON facturas_compra_tela;
CREATE TRIGGER trigger_cleanup_cash_on_factura_compra_tela_delete
    BEFORE DELETE ON facturas_compra_tela
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_cash_transactions_on_invoice_delete();

-- Ejecutar limpieza de datos huérfanos actuales
SELECT limpiar_datos_huerfanos();