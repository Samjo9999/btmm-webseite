-- Add is_test column to services table
ALTER TABLE services
ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT false NOT NULL;
