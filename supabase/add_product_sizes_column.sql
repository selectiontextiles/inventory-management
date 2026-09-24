-- Migration: Add customizable product-level sizes array to products table
alter table public.products 
  add column if not exists sizes text[] not null default array['36', '38', '40', '42', '44']::text[];
