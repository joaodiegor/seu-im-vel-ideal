-- Admin can view ALL property_requests (not just active)
CREATE POLICY "Admins can view all requests"
ON public.property_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete any request
CREATE POLICY "Admins can delete any request"
ON public.property_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL proposals
CREATE POLICY "Admins can view all proposals"
ON public.proposals
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete any proposal
CREATE POLICY "Admins can delete proposals"
ON public.proposals
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));