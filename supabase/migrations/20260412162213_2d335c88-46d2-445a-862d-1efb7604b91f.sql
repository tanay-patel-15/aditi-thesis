CREATE TABLE public.coworking_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  date DATE NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 1,
  seats INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coworking_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a coworking booking"
ON public.coworking_bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view coworking bookings"
ON public.coworking_bookings
FOR SELECT
TO anon, authenticated
USING (true);