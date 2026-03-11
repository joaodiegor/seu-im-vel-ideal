
-- Allow request owners to update proposal status (accept/reject)
CREATE POLICY "Request owners can update proposal status"
  ON public.proposals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.property_requests
      WHERE id = request_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.property_requests
      WHERE id = request_id AND user_id = auth.uid()
    )
  );
