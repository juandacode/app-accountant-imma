-- Attach cleanup triggers for cash transactions and run orphan cleanup
-- 1) Ensure cleanup triggers exist on delete for related tables
DROP TRIGGER IF EXISTS trg_cleanup_cash_on_delete_facturas_compra_tela ON public.facturas_compra_tela;
CREATE TRIGGER trg_cleanup_cash_on_delete_facturas_compra_tela
AFTER DELETE ON public.facturas_compra_tela
FOR EACH ROW EXECUTE FUNCTION public.cleanup_cash_transactions_on_invoice_delete();

DROP TRIGGER IF EXISTS trg_cleanup_cash_on_delete_facturas_compra ON public.facturas_compra;
CREATE TRIGGER trg_cleanup_cash_on_delete_facturas_compra
AFTER DELETE ON public.facturas_compra
FOR EACH ROW EXECUTE FUNCTION public.cleanup_cash_transactions_on_invoice_delete();

DROP TRIGGER IF EXISTS trg_cleanup_cash_on_delete_facturas_venta ON public.facturas_venta;
CREATE TRIGGER trg_cleanup_cash_on_delete_facturas_venta
AFTER DELETE ON public.facturas_venta
FOR EACH ROW EXECUTE FUNCTION public.cleanup_cash_transactions_on_invoice_delete();

DROP TRIGGER IF EXISTS trg_cleanup_cash_on_delete_pagos_recibidos ON public.pagos_recibidos;
CREATE TRIGGER trg_cleanup_cash_on_delete_pagos_recibidos
AFTER DELETE ON public.pagos_recibidos
FOR EACH ROW EXECUTE FUNCTION public.cleanup_cash_transactions_on_invoice_delete();

DROP TRIGGER IF EXISTS trg_cleanup_cash_on_delete_pagos_realizados ON public.pagos_realizados;
CREATE TRIGGER trg_cleanup_cash_on_delete_pagos_realizados
AFTER DELETE ON public.pagos_realizados
FOR EACH ROW EXECUTE FUNCTION public.cleanup_cash_transactions_on_invoice_delete();

DROP TRIGGER IF EXISTS trg_cleanup_cash_on_delete_pagos_fct ON public.pagos_facturas_compra_tela;
CREATE TRIGGER trg_cleanup_cash_on_delete_pagos_fct
AFTER DELETE ON public.pagos_facturas_compra_tela
FOR EACH ROW EXECUTE FUNCTION public.cleanup_cash_transactions_on_invoice_delete();

-- 2) Immediate cleanup to remove any existing orphan cash rows
SELECT public.limpiar_datos_huerfanos();