
-- Messages table for chat between buyer and broker on accepted proposals
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Buyers (request owners) can view messages on their proposals
CREATE POLICY "Request owners can view messages"
ON public.messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM proposals p
    JOIN property_requests r ON r.id = p.request_id
    WHERE p.id = messages.proposal_id
    AND (r.user_id = auth.uid() OR p.broker_id = auth.uid())
    AND p.status = 'accepted'
  )
);

-- Both parties can insert messages on accepted proposals
CREATE POLICY "Participants can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM proposals p
    JOIN property_requests r ON r.id = p.request_id
    WHERE p.id = messages.proposal_id
    AND (r.user_id = auth.uid() OR p.broker_id = auth.uid())
    AND p.status = 'accepted'
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
