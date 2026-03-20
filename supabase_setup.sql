-- ==========================================
-- Eigyo Shitsuji: phase 20 Database Setup
-- Run this completely in your Supabase SQL Editor
-- ==========================================

-- 1. Create the `orders` table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    sns_link TEXT,
    category TEXT NOT NULL,
    usage TEXT,
    details TEXT,
    deadline TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Policy A: Allow anyone (anon) to insert a new order (from the public order page)
CREATE POLICY "Allow anonymous users to insert orders"
ON public.orders FOR INSERT
TO public
WITH CHECK (true);

-- Policy B: Allow authenticated admins to read all orders (Admin dashboard list/details)
CREATE POLICY "Allow authenticated users to read orders"
ON public.orders FOR SELECT
TO authenticated
USING (true);

-- Policy C: Allow authenticated admins to update orders (Admin status & notes edit)
CREATE POLICY "Allow authenticated users to update orders"
ON public.orders FOR UPDATE
TO authenticated
USING (true);

-- Note: Because this is a simple Admin setup, 'authenticated' broadly means 
-- any user who has logged in to your Supabase project. If you add standard 
-- customers later, you'll need to tighten the `USING` checks.
