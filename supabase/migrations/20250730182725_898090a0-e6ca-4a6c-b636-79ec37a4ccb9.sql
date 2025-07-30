-- Agregar campo tipo_ingreso a aportes_sociales para especificar si es efectivo o banco
ALTER TABLE aportes_sociales 
ADD COLUMN tipo_ingreso VARCHAR(20) DEFAULT 'Efectivo' CHECK (tipo_ingreso IN ('Efectivo', 'Banco'));