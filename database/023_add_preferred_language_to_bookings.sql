-- Migration: Add preferred_language to bookings
-- Description: Adds a column to store the guest's language preference for automated guide translation.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'preferred_language') THEN
        ALTER TABLE public.bookings ADD COLUMN preferred_language character varying DEFAULT 'es';
    END IF;
END $$;
