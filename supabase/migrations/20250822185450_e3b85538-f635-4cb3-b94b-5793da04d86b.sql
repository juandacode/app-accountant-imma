-- Agregar triggers para limpiar transacciones de caja al eliminar facturas principales
DROP TRIGGER IF EXISTS trigger_cleanup_cash_on_facturas_venta_delete ON facturas_venta;
CREATE TRIGGER trigger_cleanup_cash_on_facturas_venta_delete
    BEFORE DELETE ON facturas_venta
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_cash_transactions_on_invoice_delete();

DROP TRIGGER IF EXISTS trigger_cleanup_cash_on_facturas_compra_delete ON facturas_compra;
CREATE TRIGGER trigger_cleanup_cash_on_facturas_compra_delete
    BEFORE DELETE ON facturas_compra
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_cash_transactions_on_invoice_delete();

DROP TRIGGER IF EXISTS trigger_cleanup_cash_on_facturas_compra_tela_delete ON facturas_compra_tela;
CREATE TRIGGER trigger_cleanup_cash_on_facturas_compra_tela_delete
    BEFORE DELETE ON facturas_compra_tela
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_cash_transactions_on_invoice_delete();

-- Agregar triggers para limpiar transacciones de caja al eliminar pagos de telas
DROP TRIGGER IF EXISTS trigger_cleanup_cash_on_pagos_facturas_compra_tela_delete ON pagos_facturas_compra_tela;
CREATE TRIGGER trigger_cleanup_cash_on_pagos_facturas_compra_tela_delete
    BEFORE DELETE ON pagos_facturas_compra_tela
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_cash_transactions_on_invoice_delete();

-- Ejecutar limpieza de datos huérfanos existentes
SELECT limpiar_datos_huerfanos();