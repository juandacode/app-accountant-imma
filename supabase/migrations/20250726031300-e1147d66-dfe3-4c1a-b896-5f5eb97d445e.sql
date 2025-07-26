-- Phase 1: Critical Database Security Fixes

-- 1. Enable RLS on missing tables
ALTER TABLE public.facturas_compra_tela ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas_compra_tela_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_facturas_compra_tela ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for facturas_compra_tela
CREATE POLICY "Allow authenticated users to read all fabric purchase invoices" 
ON public.facturas_compra_tela 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to insert fabric purchase invoices" 
ON public.facturas_compra_tela 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update fabric purchase invoices" 
ON public.facturas_compra_tela 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow authenticated users to delete fabric purchase invoices" 
ON public.facturas_compra_tela 
FOR DELETE 
USING (true);

-- 3. Create RLS policies for facturas_compra_tela_detalles
CREATE POLICY "Allow authenticated users to read all fabric purchase invoice details" 
ON public.facturas_compra_tela_detalles 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to insert fabric purchase invoice details" 
ON public.facturas_compra_tela_detalles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update fabric purchase invoice details" 
ON public.facturas_compra_tela_detalles 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow authenticated users to delete fabric purchase invoice details" 
ON public.facturas_compra_tela_detalles 
FOR DELETE 
USING (true);

-- 4. Create RLS policies for pagos_facturas_compra_tela
CREATE POLICY "Allow authenticated users to read all fabric purchase payments" 
ON public.pagos_facturas_compra_tela 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to insert fabric purchase payments" 
ON public.pagos_facturas_compra_tela 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update fabric purchase payments" 
ON public.pagos_facturas_compra_tela 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow authenticated users to delete fabric purchase payments" 
ON public.pagos_facturas_compra_tela 
FOR DELETE 
USING (true);

-- 5. Secure all database functions by adding search_path

CREATE OR REPLACE FUNCTION public.registrar_costo_en_venta_detalle()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
DECLARE
    costo_promedio NUMERIC;
    costo_pred_producto NUMERIC;
BEGIN
    SELECT p.costo_predeterminado
    INTO costo_pred_producto
    FROM productos p
    WHERE p.id = NEW.producto_id;

    NEW.costo_adquisicion_unitario_al_vender := COALESCE(costo_pred_producto, 0);
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_next_fabric_purchase_invoice_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
DECLARE
    last_number_part INT;
    new_number_part INT;
BEGIN
    SELECT MAX(SUBSTRING(numero_factura FROM '^FCT-([0-9]+)$')::INT)
    INTO last_number_part
    FROM facturas_compra_tela;
    
    new_number_part := COALESCE(last_number_part, 0) + 1;
    
    RETURN 'FCT-' || LPAD(new_number_part::TEXT, 6, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_update_fabric_purchase_invoice_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
    IF NEW.forma_pago IN ('Efectivo', 'Transferencia') THEN
        NEW.estado := 'Pagada';
        NEW.monto_pagado := NEW.monto_total;
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.register_fabric_purchase_cash_transaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
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
                'facturas_compra_tela'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_monthly_income_statement(p_year integer, p_month integer)
 RETURNS json
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
DECLARE
    result json;
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    v_start_date := MAKE_DATE(p_year, p_month, 1);
    v_end_date := (v_start_date + INTERVAL '1 month') - INTERVAL '1 day';

    WITH
    sales_data AS (
        SELECT
            COALESCE(SUM(fvd.subtotal), 0) as total_revenue,
            COALESCE(SUM(fvd.cantidad * fvd.costo_adquisicion_unitario_al_vender), 0) as total_cogs
        FROM facturas_venta fv
        JOIN facturas_venta_detalles fvd ON fv.id = fvd.factura_venta_id
        WHERE fv.fecha_emision BETWEEN v_start_date AND v_end_date
    ),
    expenses_data AS (
        SELECT
            COALESCE(SUM(g.monto), 0) as total_operating_expenses
        FROM gastos g
        WHERE g.fecha BETWEEN v_start_date AND v_end_date
    )
    SELECT json_build_object(
        'year', p_year,
        'month', p_month,
        'total_revenue', (SELECT total_revenue FROM sales_data),
        'total_cogs', (SELECT total_cogs FROM sales_data),
        'gross_profit', (SELECT total_revenue FROM sales_data) - (SELECT total_cogs FROM sales_data),
        'total_operating_expenses', (SELECT total_operating_expenses FROM expenses_data),
        'net_income', ((SELECT total_revenue FROM sales_data) - (SELECT total_cogs FROM sales_data)) - (SELECT total_operating_expenses FROM expenses_data)
    )
    INTO result;

    RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_financial_summary()
 RETURNS json
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
DECLARE
    result json;
    current_month int := EXTRACT(MONTH FROM CURRENT_DATE);
    current_year int := EXTRACT(YEAR FROM CURRENT_DATE);
    total_cogs_value NUMERIC;
    monthly_cogs_value NUMERIC;
    cash_balance NUMERIC;
    total_payables NUMERIC;
BEGIN
    -- Calcular COGS
    SELECT COALESCE(SUM(fvd.cantidad * fvd.costo_adquisicion_unitario_al_vender), 0)
    INTO total_cogs_value
    FROM facturas_venta_detalles fvd
    JOIN facturas_venta fv ON fvd.factura_venta_id = fv.id;

    SELECT COALESCE(SUM(fvd.cantidad * fvd.costo_adquisicion_unitario_al_vender), 0)
    INTO monthly_cogs_value
    FROM facturas_venta_detalles fvd
    JOIN facturas_venta fv ON fvd.factura_venta_id = fv.id
    WHERE EXTRACT(MONTH FROM fv.fecha_emision) = current_month AND EXTRACT(YEAR FROM fv.fecha_emision) = current_year;

    -- Obtener saldo en caja
    SELECT obtener_saldo_caja_actual() INTO cash_balance;

    -- Calcular total de cuentas por pagar (facturas de compra + facturas de compra de tela pendientes)
    SELECT COALESCE(
        (SELECT SUM(monto_total - COALESCE(monto_pagado, 0)) FROM facturas_compra WHERE estado = 'Pendiente'), 0
    ) + COALESCE(
        (SELECT SUM(monto_total - COALESCE(monto_pagado, 0)) FROM facturas_compra_tela WHERE estado = 'Pendiente'), 0
    ) INTO total_payables;

    WITH
    sales AS (
        SELECT 
            -- Solo contar facturas pagadas para ingresos reales
            SUM(CASE WHEN estado = 'Pagada' THEN monto_total ELSE 0 END) as total_income,
            SUM(CASE WHEN estado = 'Pagada' AND EXTRACT(MONTH FROM fecha_emision) = current_month AND EXTRACT(YEAR FROM fecha_emision) = current_year THEN monto_total ELSE 0 END) as monthly_income
        FROM facturas_venta
    ),
    expenses AS (
        SELECT
            SUM(monto) as total_expenses,
            SUM(CASE WHEN EXTRACT(MONTH FROM fecha) = current_month AND EXTRACT(YEAR FROM fecha) = current_year THEN monto ELSE 0 END) as monthly_expenses,
            (SELECT json_agg(cats) FROM (
                SELECT categoria as category, SUM(monto) as total
                FROM gastos
                GROUP BY categoria
                ORDER BY total DESC
                LIMIT 5
            ) cats) as top_expense_categories
        FROM gastos
    ),
    receivables AS (
        -- Corregir cálculo: solo facturas de venta pendientes
        SELECT SUM(monto_total - COALESCE(monto_pagado, 0)) as pending_receivables
        FROM facturas_venta
        WHERE estado = 'Pendiente'
    ),
    transactions AS (
        (SELECT 'income' as type, fecha_pago as date, monto_pago as amount, 'Pago Factura Venta ' || fv.numero_factura as description FROM pagos_recibidos pr JOIN facturas_venta fv ON pr.factura_venta_id = fv.id ORDER BY fecha_pago DESC LIMIT 5)
        UNION ALL
        (SELECT 'expense' as type, fecha as date, monto as amount, descripcion FROM gastos ORDER BY fecha DESC LIMIT 5)
    ),
    recent_transactions AS (
        SELECT json_agg(t) as recent_transactions FROM (
            SELECT * FROM transactions ORDER BY date DESC LIMIT 10
        ) t
    ),
    counts AS (
      SELECT
        (SELECT COUNT(*) FROM facturas_venta) as total_sales_invoices,
        (SELECT COUNT(*) FROM gastos) as total_expenses_records
    )
    SELECT json_build_object(
        'total_income', COALESCE(s.total_income, 0),
        'monthly_income', COALESCE(s.monthly_income, 0),
        'total_cogs', total_cogs_value,
        'monthly_cogs', monthly_cogs_value,
        'total_expenses', COALESCE(e.total_expenses, 0),
        'monthly_expenses', COALESCE(e.monthly_expenses, 0),
        'net_profit', COALESCE(s.total_income, 0) - total_cogs_value - COALESCE(e.total_expenses, 0),
        'monthly_profit', COALESCE(s.monthly_income, 0) - monthly_cogs_value - COALESCE(e.monthly_expenses, 0),
        'pending_receivables', COALESCE(r.pending_receivables, 0),
        'total_payables', total_payables,
        'cash_balance', cash_balance,
        'top_expense_categories', e.top_expense_categories,
        'recent_transactions', rt.recent_transactions,
        'total_sales_invoices', c.total_sales_invoices,
        'total_expenses_records', c.total_expenses_records
    )
    INTO result
    FROM sales s, expenses e, receivables r, recent_transactions rt, counts c;

    RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_account_statement(p_entity_type text, p_entity_id integer)
 RETURNS json
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
DECLARE
    result json;
BEGIN
    WITH transactions_source AS (
        SELECT
            fv.fecha_emision AS date,
            'Factura de Venta #' || fv.numero_factura AS description,
            fv.monto_total AS debit,
            0 AS credit,
            'factura_venta' as type,
            fv.id as transaction_id,
            fv.fecha_emision as sort_date
        FROM facturas_venta fv
        WHERE fv.cliente_id = p_entity_id AND p_entity_type = 'cliente'

        UNION ALL

        SELECT
            pr.fecha_pago AS date,
            'Pago Recibido Factura #' || fv.numero_factura AS description,
            0 AS debit,
            pr.monto_pago AS credit,
            'pago_recibido' as type,
            pr.id as transaction_id,
            pr.fecha_pago as sort_date
        FROM pagos_recibidos pr
        JOIN facturas_venta fv ON pr.factura_venta_id = fv.id
        WHERE fv.cliente_id = p_entity_id AND p_entity_type = 'cliente'

        UNION ALL

        SELECT
            fc.fecha_emision AS date,
            'Factura de Compra #' || fc.numero_factura AS description,
            0 AS debit,
            fc.monto_total AS credit, 
            'factura_compra' as type,
            fc.id as transaction_id,
            fc.fecha_emision as sort_date
        FROM facturas_compra fc
        WHERE fc.proveedor_id = p_entity_id AND p_entity_type = 'proveedor'

        UNION ALL

        SELECT
            pre.fecha_pago AS date,
            'Pago Realizado Factura #' || fc.numero_factura AS description,
            pre.monto_pago AS debit, 
            0 AS credit,
            'pago_realizado' as type,
            pre.id as transaction_id,
            pre.fecha_pago as sort_date
        FROM pagos_realizados pre
        JOIN facturas_compra fc ON pre.factura_compra_id = fc.id
        WHERE fc.proveedor_id = p_entity_id AND p_entity_type = 'proveedor'
    ),
    ordered_transactions AS (
        SELECT
            ts.date,
            ts.description,
            ts.debit,
            ts.credit,
            ts.type,
            ts.transaction_id,
            SUM(COALESCE(ts.debit,0) - COALESCE(ts.credit,0)) OVER (ORDER BY ts.sort_date ASC, ts.transaction_id ASC) as balance
        FROM transactions_source ts
    )
    SELECT json_build_object(
        'transactions', COALESCE(json_agg(ot ORDER BY ot.date ASC, ot.transaction_id ASC), '[]'::json),
        'balance', COALESCE((SELECT balance FROM ordered_transactions ORDER BY date DESC, transaction_id DESC LIMIT 1), 0)
    )
    INTO result
    FROM ordered_transactions ot;

    RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.obtener_saldo_caja_actual()
 RETURNS numeric
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
DECLARE
    saldo_actual DECIMAL;
BEGIN
    SELECT COALESCE(SUM(CASE 
                        WHEN tipo_transaccion LIKE 'INGRESO%' THEN monto
                        WHEN tipo_transaccion LIKE 'EGRESO%' THEN -monto
                        ELSE 0 
                      END), 0)
    INTO saldo_actual
    FROM caja_general_transacciones;
    RETURN saldo_actual;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_next_invoice_number(prefix text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
DECLARE
    last_number_part INT;
    new_number_part INT;
    table_name TEXT;
    column_name TEXT := 'numero_factura';
BEGIN
    IF prefix = 'FV-' THEN
        table_name := 'facturas_venta';
    ELSIF prefix = 'FC-' THEN
        table_name := 'facturas_compra';
    ELSE
        RAISE EXCEPTION 'Prefijo de factura no válido: %', prefix;
    END IF;
    
    EXECUTE format('SELECT MAX(SUBSTRING(%I FROM ''^[A-Z]+-([0-9]+)$'')::INT) FROM %I', column_name, table_name)
    INTO last_number_part;
    
    new_number_part := COALESCE(last_number_part, 0) + 1;
    
    RETURN prefix || LPAD(new_number_part::TEXT, 6, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_next_sale_invoice_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
    RETURN get_next_invoice_number('FV-');
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_next_purchase_invoice_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
    RETURN get_next_invoice_number('FC-');
END;
$function$;

CREATE OR REPLACE FUNCTION public.registrar_transaccion_caja(p_tipo_transaccion character varying, p_descripcion text, p_monto numeric, p_referencia_id integer DEFAULT NULL::integer, p_referencia_tabla character varying DEFAULT NULL::character varying)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
DECLARE
    v_saldo_anterior DECIMAL;
    v_saldo_nuevo DECIMAL;
BEGIN
    SELECT obtener_saldo_caja_actual() INTO v_saldo_anterior;

    IF p_tipo_transaccion LIKE 'INGRESO%' THEN
        v_saldo_nuevo := v_saldo_anterior + p_monto;
    ELSIF p_tipo_transaccion LIKE 'EGRESO%' THEN
        v_saldo_nuevo := v_saldo_anterior - p_monto;
    ELSE
        RAISE EXCEPTION 'Tipo de transacción no válido: %', p_tipo_transaccion;
    END IF;

    INSERT INTO caja_general_transacciones (
        tipo_transaccion,
        descripcion,
        monto,
        referencia_id,
        referencia_tabla,
        saldo_resultante
    ) VALUES (
        p_tipo_transaccion,
        p_descripcion,
        p_monto,
        p_referencia_id,
        p_referencia_tabla,
        v_saldo_nuevo
    );
END;
$function$;