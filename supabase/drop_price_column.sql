-- ==============================================================================
-- Migration: Remove price column from products table
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ornofygkriafvkvkxolj/sql/new
-- ==============================================================================

alter table public.products drop column if exists price;
