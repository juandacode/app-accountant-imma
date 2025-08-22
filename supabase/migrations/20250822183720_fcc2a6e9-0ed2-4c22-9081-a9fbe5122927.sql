-- Agregar triggers para limpiar transacciones de caja al eliminar pagos
DROP TRIGGER IF EXISTS trigger_cleanup_cash_on_pagos_recibidos_delete ON pagos_recibidos;
CREATE TRIGGER trigger_cleanup_cash_on_pagos_recibidos_delete
    BEFORE DELETE ON pagos_recibidos
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_cash_transactions_on_invoice_delete();

DROP TRIGGER IF EXISTS trigger_cleanup_cash_on_pagos_realizados_delete ON pagos_realizados;
CREATE TRIGGER trigger_cleanup_cash_on_pagos_realizados_delete
    BEFORE DELETE ON pagos_realizados
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_cash_transactions_on_invoice_delete();