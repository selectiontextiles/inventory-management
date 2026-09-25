-- ==============================================================================
-- Migration: Move image_url from products to product_variants
-- ==============================================================================

-- 1. Add image_url to product_variants
alter table public.product_variants
add column if not exists image_url text not null default '';

-- 2. Drop image_url from products
alter table public.products
drop column if exists image_url;
