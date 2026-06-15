-- Add intro pricing status to customers for referral system
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS has_intro_status boolean DEFAULT false;

-- Index for finding customers with intro status
CREATE INDEX IF NOT EXISTS customers_intro_status_idx ON public.customers(has_intro_status) WHERE has_intro_status = true;
