-- Add extra fields to guide_places for richer information
ALTER TABLE public.guide_places 
ADD COLUMN IF NOT EXISTS phone character varying,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS opening_hours jsonb;

-- Comment on columns for clarity
COMMENT ON COLUMN public.guide_places.opening_hours IS 'Store opening hours from Google Places API as JSON';
COMMENT ON COLUMN public.guide_places.phone IS 'Contact phone number for the place';
COMMENT ON COLUMN public.guide_places.website IS 'Official website URL for the place';
