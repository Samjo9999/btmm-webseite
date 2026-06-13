-- Track how many successful referrals each customer has made
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS referral_count integer DEFAULT 0;

-- Index for referral eligibility checks
CREATE INDEX IF NOT EXISTS customers_referral_count_idx ON public.customers(referral_count);
