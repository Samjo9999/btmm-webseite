-- Add account_holder (Kontoinhaber) to companies.
-- The bank account holder is the legal recipient of SEPA transfers and may differ
-- from the brand name (company_name). Used on invoices and EPC QR codes.
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS account_holder text;

COMMENT ON COLUMN companies.account_holder IS
  'Kontoinhaber / Empfänger für SEPA-Überweisungen. Falls leer, wird company_name verwendet.';
