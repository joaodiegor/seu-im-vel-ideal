
-- 1. Fix privacy bypass: Create a secure view that enforces name_visible/phone_visible
CREATE OR REPLACE VIEW public.active_requests_public AS
SELECT 
  id, property_type, neighborhood, bedrooms, bathrooms,
  min_area, max_budget, details, status, created_at, updated_at, user_id,
  CASE WHEN name_visible THEN requester_name ELSE 'Nome oculto' END AS requester_name,
  CASE WHEN phone_visible THEN requester_phone ELSE NULL END AS requester_phone,
  name_visible, phone_visible
FROM public.property_requests
WHERE status = 'active';

-- 2. Fix push_subscriptions exposure: Drop the overly permissive policy
DROP POLICY IF EXISTS "Service can read all subscriptions" ON public.push_subscriptions;

-- 3. Fix proposal-images upload scope: Replace unscoped policy with folder-scoped one
DROP POLICY IF EXISTS "Authenticated users can upload proposal images" ON storage.objects;

CREATE POLICY "Brokers upload own proposal images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'proposal-images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);
