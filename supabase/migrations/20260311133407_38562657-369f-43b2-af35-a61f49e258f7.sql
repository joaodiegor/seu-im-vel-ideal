
CREATE TABLE public.property_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_type text NOT NULL,
  neighborhood text NOT NULL,
  bedrooms integer,
  max_budget numeric,
  details text,
  requester_name text NOT NULL,
  requester_phone text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.property_requests ENABLE ROW LEVEL SECURITY;

-- Buyers can insert their own requests
CREATE POLICY "Users can insert their own requests"
  ON public.property_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Anyone authenticated can view active requests
CREATE POLICY "Authenticated users can view active requests"
  ON public.property_requests FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Users can update their own requests
CREATE POLICY "Users can update their own requests"
  ON public.property_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own requests
CREATE POLICY "Users can delete their own requests"
  ON public.property_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_property_requests_updated_at
  BEFORE UPDATE ON public.property_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
