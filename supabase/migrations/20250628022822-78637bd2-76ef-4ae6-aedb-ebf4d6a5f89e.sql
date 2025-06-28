
-- Crear tabla para facturas de compra de tela (similar a facturas_compra pero específica para telas)
CREATE TABLE public.facturas_compra_tela (
    id SERIAL PRIMARY KEY,
    numero_factura VARCHAR NOT NULL UNIQUE,
    proveedor_id INTEGER REFERENCES proveedores(id),
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE,
    forma_pago VARCHAR NOT NULL CHECK (forma_pago IN ('Crédito', 'Efectivo', 'Transferencia')),
    estado VARCHAR NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Pagada')),
    monto_total NUMERIC NOT NULL DEFAULT 0,
    monto_pagado NUMERIC DEFAULT 0,
    descripcion_factura TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla para detalles de facturas de compra de tela
CREATE TABLE public.facturas_compra_tela_detalles (
    id SERIAL PRIMARY KEY,
    factura_compra_tela_id INTEGER NOT NULL REFERENCES facturas_compra_tela(id) ON DELETE CASCADE,
    codigo_rollo VARCHAR NOT NULL,
    nombre_tela VARCHAR NOT NULL,
    color VARCHAR NOT NULL,
    metraje_cantidad NUMERIC NOT NULL,
    ancho_tela NUMERIC,
    precio_metro NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL,
    notas TEXT
);

-- Crear tabla para pagos de facturas de compra de tela
CREATE TABLE public.pagos_facturas_compra_tela (
    id SERIAL PRIMARY KEY,
    factura_compra_tela_id INTEGER NOT NULL REFERENCES facturas_compra_tela(id),
    fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
    monto_pago NUMERIC NOT NULL,
    descripcion_pago TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Función para obtener el próximo número de factura de compra de tela
CREATE OR REPLACE FUNCTION get_next_fabric_purchase_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
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
$$;

-- Trigger para actualizar automáticamente el estado de facturas de compra de tela cuando forma_pago es Efectivo o Transferencia
CREATE OR REPLACE FUNCTION auto_update_fabric_purchase_invoice_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.forma_pago IN ('Efectivo', 'Transferencia') THEN
        NEW.estado := 'Pagada';
        NEW.monto_pagado := NEW.monto_total;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_update_fabric_purchase_invoice_status
    BEFORE INSERT OR UPDATE ON facturas_compra_tela
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_fabric_purchase_invoice_status();

-- Trigger para registrar transacciones en caja cuando se paga con Efectivo
CREATE OR REPLACE FUNCTION register_fabric_purchase_cash_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
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
$$;

CREATE TRIGGER trigger_register_fabric_purchase_cash_transaction
    AFTER INSERT OR UPDATE ON facturas_compra_tela
    FOR EACH ROW
    EXECUTE FUNCTION register_fabric_purchase_cash_transaction();

-- Actualizar función get_financial_summary para incluir cuentas por pagar de telas y corregir cálculos
CREATE OR REPLACE FUNCTION public.get_financial_summary()
RETURNS json
LANGUAGE plpgsql
AS $$
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
$$;

-- Corregir función get_account_statement eliminando columnas problemáticas
CREATE OR REPLACE FUNCTION public.get_account_statement(p_entity_type text, p_entity_id integer)
RETURNS json
LANGUAGE plpgsql
AS $$
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
$$;
