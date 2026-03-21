
ALTER TABLE public.property_requests
ADD COLUMN bathrooms integer DEFAULT NULL,
ADD COLUMN min_area numeric DEFAULT NULL;
