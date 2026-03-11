
CREATE TABLE public.broker_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  broker_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(proposal_id)
);

ALTER TABLE public.broker_reviews ENABLE ROW LEVEL SECURITY;

-- Buyers can insert a review for accepted proposals they own
CREATE POLICY "Buyers can insert reviews"
  ON public.broker_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.proposals p
      JOIN public.property_requests r ON r.id = p.request_id
      WHERE p.id = proposal_id
        AND p.status = 'accepted'
        AND r.user_id = auth.uid()
    )
  );

-- Anyone can read reviews (for public ranking)
CREATE POLICY "Anyone can view reviews"
  ON public.broker_reviews FOR SELECT
  TO public
  USING (true);

-- Create a function to get broker average rating
CREATE OR REPLACE FUNCTION public.get_broker_stats(broker_uuid uuid)
RETURNS TABLE(avg_rating numeric, review_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as avg_rating,
    COUNT(*) as review_count
  FROM public.broker_reviews
  WHERE broker_id = broker_uuid;
$$;
