
-- Fix Orders Table Schema
-- Adding missing shippingExchangeRate column reported by user

ALTER TABLE orders_v4 
ADD COLUMN IF NOT EXISTS "shippingExchangeRate" NUMERIC(15, 5);

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload config';
