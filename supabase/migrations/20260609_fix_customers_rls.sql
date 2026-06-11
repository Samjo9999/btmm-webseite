-- Fix RLS for customers table to allow Edge Functions to insert
-- Service Role (Edge Functions) should be able to INSERT/SELECT/UPDATE/DELETE
-- Authenticated users should only see their own company's customers

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "customers_service_role" ON public.customers;
DROP POLICY IF EXISTS "customers_authenticated" ON public.customers;

-- Allow service_role (Edge Functions) full access
CREATE POLICY "customers_service_role"
  ON public.customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to see customers for their company
CREATE POLICY "customers_authenticated"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies
      WHERE user_id = auth.uid()
    )
  );
