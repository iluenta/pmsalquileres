-- Script para crear la tabla de cuentas de tesorería
-- Ejecutar en Supabase SQL Editor

-- Crear tabla treasury_accounts
CREATE TABLE IF NOT EXISTS public.treasury_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100),
  bank_name VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT treasury_accounts_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_treasury_accounts_tenant_id 
ON public.treasury_accounts(tenant_id);

CREATE INDEX IF NOT EXISTS idx_treasury_accounts_active 
ON public.treasury_accounts(tenant_id, is_active) 
WHERE is_active = true;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_treasury_accounts_updated_at
BEFORE UPDATE ON public.treasury_accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE public.treasury_accounts IS 'Cuentas de tesorería donde se registran los movimientos financieros';
COMMENT ON COLUMN public.treasury_accounts.name IS 'Nombre de la cuenta de tesorería';
COMMENT ON COLUMN public.treasury_accounts.account_number IS 'Número de cuenta bancaria';
COMMENT ON COLUMN public.treasury_accounts.bank_name IS 'Nombre del banco';
COMMENT ON COLUMN public.treasury_accounts.is_active IS 'Indica si la cuenta está activa';

