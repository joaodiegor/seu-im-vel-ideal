
DROP VIEW IF EXISTS public.active_requests_public;

CREATE VIEW public.active_requests_public
WITH (security_invoker = true)
AS
SELECT 
  id, property_type, neighborhood, bedrooms, bathrooms,
  min_area, max_budget, details, status, created_at, updated_at, user_id,
  CASE WHEN name_visible THEN requester_name ELSE 'Nome oculto' END AS requester_name,
  CASE WHEN phone_visible THEN requester_phone ELSE NULL END AS requester_phone,
  name_visible, phone_visible
FROM public.property_requests
WHERE status = 'active';
