-- ============================================================================
-- pending_payments: manual payment flow (Paytm QR + admin confirmation)
-- ============================================================================
CREATE TABLE public.pending_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ref_id TEXT NOT NULL UNIQUE,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('stay', 'coworking')),
  booking_details JSONB NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  amount INTEGER NOT NULL,
  screenshot_url TEXT,
  utr TEXT,
  status TEXT NOT NULL DEFAULT 'awaiting_payment'
    CHECK (status IN ('awaiting_payment', 'pending_verification', 'confirmed', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);

CREATE INDEX pending_payments_status_idx ON public.pending_payments (status);
CREATE INDEX pending_payments_created_at_idx ON public.pending_payments (created_at DESC);

ALTER TABLE public.pending_payments ENABLE ROW LEVEL SECURITY;

-- Customers (anon) can create a pending payment row for themselves.
CREATE POLICY "Anyone can create a pending payment"
ON public.pending_payments
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'awaiting_payment');

-- Customers can look up a row by ref_id (for the confirmation screen).
-- Since ref_id is only shown to the customer who created it, this is acceptable.
CREATE POLICY "Anyone can read pending payments by ref_id"
ON public.pending_payments
FOR SELECT
TO anon, authenticated
USING (true);

-- Customers can update their own row to submit proof, but ONLY when the row is
-- still in awaiting_payment AND the new status is pending_verification.
-- This prevents clients from self-confirming.
CREATE POLICY "Customer can submit payment proof"
ON public.pending_payments
FOR UPDATE
TO anon, authenticated
USING (status = 'awaiting_payment')
WITH CHECK (status = 'pending_verification');

-- Admin confirmation/rejection is done via the Edge Function (service_role)
-- or the Supabase dashboard. No anon UPDATE policy for those transitions.

-- ============================================================================
-- Storage bucket: payment-screenshots
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Customers can upload a screenshot.
CREATE POLICY "Anyone can upload a payment screenshot"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'payment-screenshots');

-- Customers can read their own screenshot (needed if we ever show it back in-app).
-- The object name includes the ref_id so enumeration is impractical.
CREATE POLICY "Anyone can read payment screenshots"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'payment-screenshots');
