
CREATE TABLE public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.property_requests(id) ON DELETE CASCADE,
  broker_id uuid NOT NULL,
  message text NOT NULL,
  price numeric,
  property_link text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Brokers can insert proposals (only broker user_type)
CREATE POLICY "Brokers can insert proposals"
  ON public.proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = broker_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND user_type = 'broker'
    )
  );

-- Brokers can view their own proposals
CREATE POLICY "Brokers can view own proposals"
  ON public.proposals FOR SELECT
  TO authenticated
  USING (broker_id = auth.uid());

-- Request owners can view proposals on their requests
CREATE POLICY "Request owners can view proposals"
  ON public.proposals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.property_requests
      WHERE id = request_id AND user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
