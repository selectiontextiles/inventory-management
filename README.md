# Selection Textiles — Inventory Management System

A mobile-first, clean, and minimal inventory tracking web application built specifically for **Selection Textiles**. Designed for fast SKU tracking, size-quantity breakdown (sizes 36 to 44), product visual reference images, and instant stock adjustments on shop floors or warehouse tablets.

---

## 🌟 Key Features

- **Mobile-First Design**: Responsive and optimized for mobile devices with high touch targets, tactile counters, and easy navigation.
- **Product & Size Matrix Dashboard**:
  - Live SKU overview with fabric details, color tags, and unit pricing.
  - Dedicated **Size Matrix (36, 38, 40, 42, 44)** with direct `+` / `-` quick counters for instant stock changes.
  - Stock condition badges (Normal, Low Stock, Depleted).
- **Visual Product Images**: Visual reference photo for each product with instant full-screen preview.
- **Fast Search & Filter System**:
  - Search by SKU, product title, weave, or color.
  - Filter by Fabric category (Cotton, Linen, Denim, Silk & Ethnic, Suiting, etc.).
  - Filter by Size availability (36, 38, 40, 42, 44).
  - Filter by stock alerts (Low Stock, Out of Stock).
- **Movement & Activity Audit Log**:
  - Log inward receipts and outward dispatches with custom notes.
  - Export inventory snapshot to CSV.
- **Supabase Integration & Offline Fallback**:
  - Full PostgreSQL schema with RLS and Supabase Storage support.
  - Zero-config local offline demo mode with LocalStorage persistence when running before connecting Supabase.

---

## 🚀 Getting Started

### 1. Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Setup (Optional for Live DB)

1. Create a new project in [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the script in [`supabase/schema.sql`](supabase/schema.sql).
3. Go to **Storage** and create a public bucket named `product-images`.
4. Copy your Supabase Project URL and Anon Key into `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
5. Restart `npm run dev`. The dashboard status will automatically switch to **Supabase Live**!

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub / GitLab / Bitbucket.
2. Import the project in [Vercel](https://vercel.com).
3. In Project Settings > Environment Variables, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Click **Deploy**!
