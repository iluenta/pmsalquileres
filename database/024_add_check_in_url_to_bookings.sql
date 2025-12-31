-- Migration: Add check_in_url to bookings
-- Description: Adds a column to store the online check-in application link for a guest stay.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='check_in_url') THEN
        ALTER TABLE public.bookings ADD COLUMN check_in_url text;
    END IF;
END $$;
