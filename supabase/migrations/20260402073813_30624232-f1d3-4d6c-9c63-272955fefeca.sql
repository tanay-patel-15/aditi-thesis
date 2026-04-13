
CREATE POLICY "Anyone can submit events"
ON public.events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
