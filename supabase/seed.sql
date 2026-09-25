-- ==============================================================================
-- Selection Textiles Initial Seed Data for Supabase PostgreSQL
-- ==============================================================================

-- 1. Insert Products
insert into public.products (id, sku, name, subtitle, category)
values 
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'ST-001',
    'Uathayam 2in1 Sets',
    'Divine Fixit Full Shirt Dhoti Set',
    'Ethnic Sets'
  ),
  (
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'ST-002',
    'Selection Linen Classic Shirts',
    'Pure French Normandy Linen 60 Lea',
    'Linen'
  )
on conflict (sku) do nothing;

-- 2. Insert Color / Shade Variants for Uathayam 2in1 Sets
insert into public.product_variants (product_id, color_name, color_hex, image_url, size_36, size_38, size_40, size_42, size_44)
values
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'T.Blue / Sh No.02', '#38bdf8', 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80', 1, 2, 3, 2, 3),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Orange / Sh No.03', '#fb923c', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80', 1, 1, 0, 1, 2),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Green / Shade No. 04', '#4ade80', '', 3, 5, 1, 2, 1),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Meroon / Shade No. 6', '#881337', '', 3, 2, 1, 2, 2),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Mastard / Shade No.09', '#facc15', '', 2, 3, 2, 3, 2),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Pink / Shade No.10', '#f472b6', '', 2, 2, 3, 2, 2),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Silver / Shade No.11', '#94a3b8', '', 0, 3, 1, 2, 0),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Purple / Shade No.14', '#a855f7', '', 1, 1, 2, 2, 1),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Sea Blue / Shade No.16', '#0284c7', '', 1, 2, 2, 1, 1)
on conflict (product_id, color_name) do nothing;

-- 3. Insert Color / Shade Variants for Selection Linen Classic Shirts
insert into public.product_variants (product_id, color_name, color_hex, image_url, size_36, size_38, size_40, size_42, size_44)
values
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Sand Beige / Shade No.01', '#d6c7b2', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80', 3, 5, 6, 2, 1),
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Olive Sage / Shade No.05', '#65a30d', '', 2, 4, 5, 3, 1),
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Optic White / Shade No.08', '#ffffff', '', 1, 3, 4, 3, 2)
on conflict (product_id, color_name) do nothing;
