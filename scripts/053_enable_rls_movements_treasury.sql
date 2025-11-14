-- Script para habilitar RLS y crear políticas de seguridad para movements y treasury_accounts
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- TABLA: movements
-- ============================================

-- Habilitar RLS
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view movements of their tenant" ON public.movements;
DROP POLICY IF EXISTS "Users can insert movements in their tenant" ON public.movements;
DROP POLICY IF EXISTS "Users can update movements of their tenant" ON public.movements;
DROP POLICY IF EXISTS "Users can delete movements of their tenant" ON public.movements;

-- Política: Los usuarios solo pueden ver movimientos de su tenant
CREATE POLICY "Users can view movements of their tenant"
ON public.movements
FOR SELECT
USING (
  tenant_id = (
    SELECT tenant_id 
    FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Política: Los usuarios solo pueden insertar movimientos en su tenant
CREATE POLICY "Users can insert movements in their tenant"
ON public.movements
FOR INSERT
WITH CHECK (
  tenant_id = (
    SELECT tenant_id 
    FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Política: Los usuarios solo pueden actualizar movimientos de su tenant
CREATE POLICY "Users can update movements of their tenant"
ON public.movements
FOR UPDATE
USING (
  tenant_id = (
    SELECT tenant_id 
    FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Política: Los usuarios solo pueden eliminar movimientos de su tenant
CREATE POLICY "Users can delete movements of their tenant"
ON public.movements
FOR DELETE
USING (
  tenant_id = (
    SELECT tenant_id 
    FROM public.users 
    WHERE id = auth.uid()
  )
);

-- ============================================
-- TABLA: treasury_accounts
-- ============================================

-- Habilitar RLS
ALTER TABLE public.treasury_accounts ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view treasury accounts of their tenant" ON public.treasury_accounts;
DROP POLICY IF EXISTS "Users can insert treasury accounts in their tenant" ON public.treasury_accounts;
DROP POLICY IF EXISTS "Users can update treasury accounts of their tenant" ON public.treasury_accounts;
DROP POLICY IF EXISTS "Users can delete treasury accounts of their tenant" ON public.treasury_accounts;

-- Política: Los usuarios solo pueden ver cuentas de tesorería de su tenant
CREATE POLICY "Users can view treasury accounts of their tenant"
ON public.treasury_accounts
FOR SELECT
USING (
  tenant_id = (
    SELECT tenant_id 
    FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Política: Los usuarios solo pueden insertar cuentas de tesorería en su tenant
CREATE POLICY "Users can insert treasury accounts in their tenant"
ON public.treasury_accounts
FOR INSERT
WITH CHECK (
  tenant_id = (
    SELECT tenant_id 
    FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Política: Los usuarios solo pueden actualizar cuentas de tesorería de su tenant
CREATE POLICY "Users can update treasury accounts of their tenant"
ON public.treasury_accounts
FOR UPDATE
USING (
  tenant_id = (
    SELECT tenant_id 
    FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Política: Los usuarios solo pueden eliminar cuentas de tesorería de su tenant
CREATE POLICY "Users can delete treasury accounts of their tenant"
ON public.treasury_accounts
FOR DELETE
USING (
  tenant_id = (
    SELECT tenant_id 
    FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Comentarios
COMMENT ON POLICY "Users can view movements of their tenant" ON public.movements IS 'Permite a los usuarios ver solo los movimientos de su tenant';
COMMENT ON POLICY "Users can insert movements in their tenant" ON public.movements IS 'Permite a los usuarios insertar movimientos solo en su tenant';
COMMENT ON POLICY "Users can update movements of their tenant" ON public.movements IS 'Permite a los usuarios actualizar solo los movimientos de su tenant';
COMMENT ON POLICY "Users can delete movements of their tenant" ON public.movements IS 'Permite a los usuarios eliminar solo los movimientos de su tenant';

COMMENT ON POLICY "Users can view treasury accounts of their tenant" ON public.treasury_accounts IS 'Permite a los usuarios ver solo las cuentas de tesorería de su tenant';
COMMENT ON POLICY "Users can insert treasury accounts in their tenant" ON public.treasury_accounts IS 'Permite a los usuarios insertar cuentas de tesorería solo en su tenant';
COMMENT ON POLICY "Users can update treasury accounts of their tenant" ON public.treasury_accounts IS 'Permite a los usuarios actualizar solo las cuentas de tesorería de su tenant';
COMMENT ON POLICY "Users can delete treasury accounts of their tenant" ON public.treasury_accounts IS 'Permite a los usuarios eliminar solo las cuentas de tesorería de su tenant';

