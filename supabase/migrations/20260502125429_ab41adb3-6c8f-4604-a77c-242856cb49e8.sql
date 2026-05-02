-- Drop the overly permissive SELECT policy that exposed requester_name/phone bypassing visibility flags.
-- Brokers and other users must read active requests via the active_requests_public view which enforces flag-based masking.
DROP POLICY IF EXISTS "Authenticated users can view active requests" ON public.property_requests;