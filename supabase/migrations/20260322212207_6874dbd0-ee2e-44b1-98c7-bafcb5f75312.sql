ALTER TABLE public.property_requests
ADD COLUMN name_visible boolean NOT NULL DEFAULT true,
ADD COLUMN phone_visible boolean NOT NULL DEFAULT true;