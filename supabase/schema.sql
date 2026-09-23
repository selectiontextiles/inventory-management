-- ==============================================================================
-- Selection Textiles Inventory Management Database Schema
-- Optimized per Supabase & PostgreSQL Production Best Practices
-- ==============================================================================

-- 1. Automatic Timestamp Update Trigger Function (with secure search_path)
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = clock_timestamp();
  return new;
end;
$$;

-- 2. Products / Collection Catalog Table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  subtitle text not null default '',
  category text not null default 'General',
  image_url text not null default '',
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp()
);

-- Trigger for products updated_at
drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row
  execute function public.handle_updated_at();

-- 3. Color / Shade Variants Table with Size Quantities (36 to 44)
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color_name text not null,
  color_hex text not null default '',
  size_36 integer not null default 0 check (size_36 >= 0),
  size_38 integer not null default 0 check (size_38 >= 0),
  size_40 integer not null default 0 check (size_40 >= 0),
  size_42 integer not null default 0 check (size_42 >= 0),
  size_44 integer not null default 0 check (size_44 >= 0),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  constraint uq_product_color unique (product_id, color_name)
);

-- Trigger for product_variants updated_at
drop trigger if exists set_variants_updated_at on public.product_variants;
create trigger set_variants_updated_at
  before update on public.product_variants
  for each row
  execute function public.handle_updated_at();

-- 4. Stock Movement Audit Ledger Table
create table if not exists public.stock_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  size text not null,
  change_amount integer not null,
  resulting_quantity integer not null,
  reason text not null default 'Manual Adjustment',
  created_at timestamptz not null default clock_timestamp()
);

-- ==============================================================================
-- Foreign Key & Performance Indexes (Prevents Table Scans & Joins Bottlenecks)
-- ==============================================================================

-- Index Foreign Keys explicitly (Postgres best practice: FKs are not indexed by default)
create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create index if not exists idx_stock_history_product_id on public.stock_history(product_id);
create index if not exists idx_stock_history_variant_id on public.stock_history(variant_id);

-- Query & sorting performance indexes
create index if not exists idx_products_name on public.products(name);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_stock_history_product_created on public.stock_history(product_id, created_at desc);
create index if not exists idx_stock_history_created_at on public.stock_history(created_at desc);

-- ==============================================================================
-- Row-Level Security (RLS) & Role Policies
-- ==============================================================================

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.stock_history enable row level security;

-- Products Policies
create policy "Allow read access to products" on public.products
  for select to anon, authenticated using (true);

create policy "Allow insert access to products" on public.products
  for insert to anon, authenticated with check (true);

create policy "Allow update access to products" on public.products
  for update to anon, authenticated using (true) with check (true);

create policy "Allow delete access to products" on public.products
  for delete to anon, authenticated using (true);

-- Product Variants Policies
create policy "Allow read access to product_variants" on public.product_variants
  for select to anon, authenticated using (true);

create policy "Allow insert access to product_variants" on public.product_variants
  for insert to anon, authenticated with check (true);

create policy "Allow update access to product_variants" on public.product_variants
  for update to anon, authenticated using (true) with check (true);

create policy "Allow delete access to product_variants" on public.product_variants
  for delete to anon, authenticated using (true);

-- Stock History Policies
create policy "Allow read access to stock_history" on public.stock_history
  for select to anon, authenticated using (true);

create policy "Allow insert access to stock_history" on public.stock_history
  for insert to anon, authenticated with check (true);

-- ==============================================================================
-- Storage Setup Instructions (Supabase Storage Bucket: product-images)
-- ==============================================================================
-- 1. Create a public storage bucket named 'product-images':
--    insert into storage.buckets (id, name, public) 
--    values ('product-images', 'product-images', true) 
--    on conflict (id) do nothing;
--
-- 2. Storage RLS policies for product-images:
--    create policy "Public Access" on storage.objects 
--      for select to anon, authenticated 
--      using (bucket_id = 'product-images');
--
--    create policy "Public Upload" on storage.objects 
--      for insert to anon, authenticated 
--      with check (bucket_id = 'product-images');
