-- ==============================================================================
-- GroupBuy Wholesale - Supabase Schema for Customers & Orders
-- ==============================================================================
-- এই SQL স্ক্রিপ্টটি Supabase ড্যাশবোর্ডের "SQL Editor"-এ পেস্ট করে "Run" করুন।
-- ==============================================================================

-- ১. কাস্টমার টেবিল (Customers Table)
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    delivery_address TEXT,
    district TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ২. অর্ডার টেবিল (Orders Table - Linked by customer_id)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_phone TEXT NOT NULL,
    bundle_id TEXT,
    batch_number INTEGER,
    product_id TEXT,
    product_title TEXT,
    product_image TEXT,
    size TEXT,
    is_full_bundle BOOLEAN DEFAULT FALSE,
    total_pieces INTEGER DEFAULT 1,
    group_price NUMERIC,
    advance_amount NUMERIC,
    due_amount NUMERIC,
    delivery_address TEXT,
    payment_method TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৩. ইনডেক্সিং (দ্রুত কাস্টমার আইডি ও ফোন দিয়ে অর্ডার খুঁজে পাওয়ার জন্য)
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- ৪. Row Level Security (RLS) এবং পারমিশন পলিসি
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- কাস্টমার টেবিল পারমিশন
DROP POLICY IF EXISTS "Allow anon read customers" ON public.customers;
CREATE POLICY "Allow anon read customers" ON public.customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert customers" ON public.customers;
CREATE POLICY "Allow anon insert customers" ON public.customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update customers" ON public.customers;
CREATE POLICY "Allow anon update customers" ON public.customers FOR UPDATE USING (true);

-- অর্ডার টেবিল পারমিশন
DROP POLICY IF EXISTS "Allow anon read orders" ON public.orders;
CREATE POLICY "Allow anon read orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert orders" ON public.orders;
CREATE POLICY "Allow anon insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update orders" ON public.orders;
CREATE POLICY "Allow anon update orders" ON public.orders FOR UPDATE USING (true);
