-- Flip payment-screenshots to public. The app uses getPublicUrl() to link
-- admins to uploaded proofs; a private bucket returns 404 from that endpoint.
-- Ref IDs are random (6 chars of a 26-char alphabet) so enumeration is impractical.
UPDATE storage.buckets
SET public = true
WHERE id = 'payment-screenshots';
