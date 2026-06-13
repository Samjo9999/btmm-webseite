-- Add referred_by column to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.customers(id) ON DELETE SET NULL;

-- Add index for referral tracking
CREATE INDEX IF NOT EXISTS customers_referred_by_idx ON public.customers(referred_by);
