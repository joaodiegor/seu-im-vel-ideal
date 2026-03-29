
CREATE OR REPLACE FUNCTION public.check_proposal_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  active_count integer;
BEGIN
  SELECT COUNT(*) INTO active_count
  FROM public.proposals
  WHERE request_id = NEW.request_id
    AND status IN ('pending', 'accepted');

  IF active_count >= 20 THEN
    RAISE EXCEPTION 'Este pedido já atingiu o limite de 20 propostas ativas.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_proposal_limit
  BEFORE INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.check_proposal_limit();
