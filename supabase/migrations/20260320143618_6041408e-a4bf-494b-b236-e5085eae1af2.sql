
-- Create proposal_images table
CREATE TABLE public.proposal_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.proposal_images ENABLE ROW LEVEL SECURITY;

-- Brokers can insert images for their own proposals
CREATE POLICY "Brokers can insert proposal images"
ON public.proposal_images FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.proposals
    WHERE proposals.id = proposal_images.proposal_id
    AND proposals.broker_id = auth.uid()
  )
);

-- Brokers can view their own proposal images
CREATE POLICY "Brokers can view own proposal images"
ON public.proposal_images FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.proposals
    WHERE proposals.id = proposal_images.proposal_id
    AND proposals.broker_id = auth.uid()
  )
);

-- Request owners can view proposal images
CREATE POLICY "Request owners can view proposal images"
ON public.proposal_images FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.proposals p
    JOIN public.property_requests r ON r.id = p.request_id
    WHERE p.id = proposal_images.proposal_id
    AND r.user_id = auth.uid()
  )
);

-- Brokers can delete their own proposal images
CREATE POLICY "Brokers can delete own proposal images"
ON public.proposal_images FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.proposals
    WHERE proposals.id = proposal_images.proposal_id
    AND proposals.broker_id = auth.uid()
  )
);

-- Create storage bucket for proposal images
INSERT INTO storage.buckets (id, name, public) VALUES ('proposal-images', 'proposal-images', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload proposal images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'proposal-images');

CREATE POLICY "Anyone can view proposal images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'proposal-images');

CREATE POLICY "Users can delete own proposal images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'proposal-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow brokers to update their own proposals
CREATE POLICY "Brokers can update own proposals"
ON public.proposals FOR UPDATE TO authenticated
USING (broker_id = auth.uid())
WITH CHECK (broker_id = auth.uid());
