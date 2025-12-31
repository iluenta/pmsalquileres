-- Migration: Add theme column to property_guides
-- Description: Adds a column to store the selected color palette for the guide

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_guides' AND column_name='theme') THEN
        ALTER TABLE public.property_guides ADD COLUMN theme character varying DEFAULT 'default';
    END IF;
END $$;
