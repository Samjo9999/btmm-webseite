-- Track intro package usage for referral eligibility
-- Counts both Kennenlern-Sitzung (single) and 3er Kennenlern-Paket together
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS intro_usage_count integer DEFAULT 0;

-- Index for intro status checks
CREATE INDEX IF NOT EXISTS customers_intro_usage_idx ON public.customers(intro_usage_count);
