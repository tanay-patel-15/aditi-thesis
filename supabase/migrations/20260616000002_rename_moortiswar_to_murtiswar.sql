-- Correct spelling: rename route_key from 'moortiswar' to 'murtiswar'.
UPDATE public.walk_routes
SET route_key = 'murtiswar'
WHERE route_key = 'moortiswar';
