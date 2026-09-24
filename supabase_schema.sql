-- ==============================================================================
-- GroupBuy Wholesale - Complete Production Database Schema
-- Compatible with PostgreSQL 13+ & Supabase
-- ==============================================================================
-- নির্দেশনা: এই সম্পূর্ণ কোডটি কপি করে Supabase ড্যাশবোর্ডের "SQL Editor"-এ পেস্ট 
-- করে "Run" বাটনে ক্লিক করুন। আগের টেবিলগুলো ড্রপ হয়ে নতুন করে সবকিছু তৈরি হবে।
-- ==============================================================================

-- ১. পুরনো টেবিলগুলো সম্পূর্ণ ডিলিট (Clean Reset)
DROP TABLE IF EXISTS public.courier_shipments CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.bundle_slots CASCADE;
DROP TABLE IF EXISTS public.bundles CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.admin_settings CASCADE;

-- ২. কাস্টমার ও ইউজার টেবিল (Customers Table)
CREATE TABLE public.customers (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    delivery_address TEXT,
    district TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'moderator')),
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৩. পণ্য টেবিল (Products Table - Wholesale Bundles)
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT,
    category TEXT NOT NULL DEFAULT 'জুতা',
    description TEXT,
    image_url TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT '{}',
    additional_image_urls TEXT[] DEFAULT '{}',
    youtube_video_url TEXT,
    retail_price NUMERIC NOT NULL,
    group_price NUMERIC NOT NULL,
    wholesale_price NUMERIC NOT NULL,
    full_bundle_price_per_piece NUMERIC NOT NULL,
    bundle_size INTEGER NOT NULL DEFAULT 6,
    available_sizes TEXT[] NOT NULL DEFAULT '{}',
    min_slots_to_confirm INTEGER DEFAULT 6,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৪. বান্ডিল / ব্যাচ টেবিল (Bundles / Batches Table)
CREATE TABLE public.bundles (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_number INTEGER NOT NULL DEFAULT 1,
    total_slots INTEGER NOT NULL DEFAULT 6,
    filled_slots INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed', 'ordered', 'shipped', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৫. বান্ডিল স্লট টেবিল (Bundle Slots - Size Wise Slot Booking)
CREATE TABLE public.bundle_slots (
    id TEXT PRIMARY KEY,
    bundle_id TEXT NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    slot_number INTEGER DEFAULT 1,
    size TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    user_phone_masked TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'reserved')),
    booked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৬. অর্ডার টেবিল (Orders Table)
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_phone TEXT NOT NULL,
    contact_phone TEXT,
    bundle_id TEXT REFERENCES public.bundles(id) ON DELETE SET NULL,
    slot_id TEXT,
    batch_number INTEGER DEFAULT 1,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    product_image TEXT,
    size TEXT NOT NULL,
    is_full_bundle BOOLEAN DEFAULT FALSE,
    total_pieces INTEGER DEFAULT 1,
    retail_price NUMERIC,
    wholesale_price NUMERIC,
    group_price NUMERIC NOT NULL,
    advance_amount NUMERIC NOT NULL DEFAULT 150,
    due_amount NUMERIC NOT NULL,
    delivery_address TEXT NOT NULL,
    district TEXT,
    payment_method TEXT DEFAULT 'bKash' CHECK (payment_method IN ('bKash', 'Nagad', 'Rocket', 'COD', 'Bank')),
    payment_status TEXT DEFAULT 'advance_paid' CHECK (payment_status IN ('pending', 'advance_paid', 'fully_paid', 'refunded', 'failed')),
    transaction_id TEXT,
    courier_name TEXT,
    courier_tracking_id TEXT,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'ordered_wholesale', 'in_transit', 'delivered', 'cancelled', 'refunded')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৭. পেমেন্ট ট্রানজেকশন লগ (Payments Log Table - Future Payment Gateway)
CREATE TABLE public.payments (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    trx_id TEXT,
    payment_type TEXT DEFAULT 'advance' CHECK (payment_type IN ('advance', 'full', 'due_collection', 'refund')),
    status TEXT DEFAULT 'success' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    gateway_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৮. কুরিয়ার ও শিপমেন্ট ট্র্যাকিং (Courier Shipments - Pathao/Steadfast API Ready)
CREATE TABLE public.courier_shipments (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    courier_name TEXT NOT NULL,
    consignment_id TEXT,
    tracking_code TEXT,
    delivery_charge NUMERIC DEFAULT 0,
    cod_amount NUMERIC DEFAULT 0,
    shipment_status TEXT DEFAULT 'ready_for_pickup',
    dispatched_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৯. সিস্টেম সেটিংস ও কনফিগারেশন (Admin Settings Table)
CREATE TABLE public.admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ১০. পারফরম্যান্স ইনডেক্সিং (High Performance Indexes)
-- ==============================================================================
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_bundles_product_id ON public.bundles(product_id);
CREATE INDEX idx_bundles_status ON public.bundles(status);
CREATE INDEX idx_bundle_slots_bundle_id ON public.bundle_slots(bundle_id);
CREATE INDEX idx_bundle_slots_status ON public.bundle_slots(status);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX idx_orders_bundle_id ON public.orders(bundle_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_customers_phone ON public.customers(phone);

-- ==============================================================================
-- ১১. Row Level Security (RLS) পলিসি
-- ==============================================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Customers Policies
DROP POLICY IF EXISTS "Public read customers" ON public.customers;
CREATE POLICY "Public read customers" ON public.customers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert customers" ON public.customers;
CREATE POLICY "Public insert customers" ON public.customers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update customers" ON public.customers;
CREATE POLICY "Public update customers" ON public.customers FOR UPDATE USING (true);

-- Products Policies
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert products" ON public.products;
CREATE POLICY "Public insert products" ON public.products FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update products" ON public.products;
CREATE POLICY "Public update products" ON public.products FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete products" ON public.products;
CREATE POLICY "Public delete products" ON public.products FOR DELETE USING (true);

-- Bundles Policies
DROP POLICY IF EXISTS "Public read bundles" ON public.bundles;
CREATE POLICY "Public read bundles" ON public.bundles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert bundles" ON public.bundles;
CREATE POLICY "Public insert bundles" ON public.bundles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update bundles" ON public.bundles;
CREATE POLICY "Public update bundles" ON public.bundles FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete bundles" ON public.bundles;
CREATE POLICY "Public delete bundles" ON public.bundles FOR DELETE USING (true);

-- Bundle Slots Policies
DROP POLICY IF EXISTS "Public read bundle_slots" ON public.bundle_slots;
CREATE POLICY "Public read bundle_slots" ON public.bundle_slots FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert bundle_slots" ON public.bundle_slots;
CREATE POLICY "Public insert bundle_slots" ON public.bundle_slots FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update bundle_slots" ON public.bundle_slots;
CREATE POLICY "Public update bundle_slots" ON public.bundle_slots FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete bundle_slots" ON public.bundle_slots;
CREATE POLICY "Public delete bundle_slots" ON public.bundle_slots FOR DELETE USING (true);

-- Orders Policies
DROP POLICY IF EXISTS "Public read orders" ON public.orders;
CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update orders" ON public.orders;
CREATE POLICY "Public update orders" ON public.orders FOR UPDATE USING (true);

-- Payments & Courier Policies
DROP POLICY IF EXISTS "Public read payments" ON public.payments;
CREATE POLICY "Public read payments" ON public.payments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert payments" ON public.payments;
CREATE POLICY "Public insert payments" ON public.payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read courier" ON public.courier_shipments;
CREATE POLICY "Public read courier" ON public.courier_shipments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert courier" ON public.courier_shipments;
CREATE POLICY "Public insert courier" ON public.courier_shipments FOR INSERT WITH CHECK (true);

-- Admin Settings Policies
DROP POLICY IF EXISTS "Public read admin_settings" ON public.admin_settings;
CREATE POLICY "Public read admin_settings" ON public.admin_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert admin_settings" ON public.admin_settings;
CREATE POLICY "Public insert admin_settings" ON public.admin_settings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update admin_settings" ON public.admin_settings;
CREATE POLICY "Public update admin_settings" ON public.admin_settings FOR UPDATE USING (true);

-- ==============================================================================
-- ১২. প্রাথমিক পণ্যসমূহ সিড করা (Default Products & Batches Seed Data)
-- ==============================================================================
INSERT INTO public.products (
    id, title, category, description, image_url, retail_price, group_price, 
    wholesale_price, full_bundle_price_per_piece, bundle_size, available_sizes, status
) VALUES 
(
    'prod-1',
    'জেনুইন লেদার ফর্মাল ডার্বি শু',
    'জুতা',
    '১০০% খাঁটি চামড়ার তৈরি প্রিমিয়াম কোয়ালিটি ডার্বি সু। টেকসই রাবার সোল এবং আরামদায়ক ইনার মেমোরি ফোম কুশন। অফিস এবং ফর্মাল ব্যবহারের জন্য সেরা।',
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    2200, 890, 650, 750, 6,
    ARRAY['39', '40', '41', '42', '43', '44'],
    'active'
),
(
    'prod-2',
    'ইতালিয়ান ডিজাইন হ্যান্ডমেড লেদার লোফার',
    'জুতা',
    'হালকা, আরামদায়ক ও ক্লাসি লুকের অরিজিনাল সফট লেদার লোফার। স্লিপ-অন স্টাইল এবং নিখুঁত হ্যান্ডমেড স্টিচিং।',
    'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
    2500, 950, 700, 790, 6,
    ARRAY['39', '40', '41', '42', '43', '44'],
    'active'
),
(
    'prod-3',
    'ব্রেথেবল মেশ আল্ট্রা-লাইট রানিং স্নিকার্স',
    'জুতা',
    'দৈনন্দিন হাঁটাচলা ও জিমের জন্য হালকা ও বাতাস চলাচল উপযোগী মেশ ফেব্রিক। শক-অ্যাবজরবিং ইভা সোল।',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    1800, 750, 520, 620, 6,
    ARRAY['39', '40', '41', '42', '43', '44'],
    'active'
),
(
    'prod-4',
    '১০০% চিরুনি কটন ড্রপ-শোল্ডার ওভারসাইজড টি-শার্ট',
    'কাপড়',
    '২২০ জিএসএম হেভিওয়েট পিওর সুতি কাপড়। প্রিমিয়াম ফিনিশিং, আরামদায়ক ফিটিং এবং দীর্ঘস্থায়ী রং।',
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
    750, 320, 220, 260, 4,
    ARRAY['M', 'L', 'XL', 'XXL'],
    'active'
),
(
    'prod-5',
    'ডিজাইনার জ্যাকার্ড প্রিমিয়াম কটন পাঞ্জাবি',
    'কাপড়',
    'সূক্ষ্ম জ্যাকার্ড উইভিং কাজের এলিগ্যান্ট সেমি-লং পাঞ্জাবি। উৎসব বা জুমার নামাজের জন্য মানানসই ও শালীন।',
    'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
    1950, 850, 600, 700, 4,
    ARRAY['40', '42', '44', '46'],
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- প্রাথমিক ব্যাচ #১ সিড করা
INSERT INTO public.bundles (id, product_id, batch_number, total_slots, filled_slots, status, expires_at)
VALUES 
('bundle-prod-1-batch-1', 'prod-1', 1, 6, 3, 'open', timezone('utc'::text, now() + interval '48 hours')),
('bundle-prod-2-batch-1', 'prod-2', 1, 6, 4, 'open', timezone('utc'::text, now() + interval '36 hours')),
('bundle-prod-3-batch-1', 'prod-3', 1, 6, 2, 'open', timezone('utc'::text, now() + interval '44 hours')),
('bundle-prod-4-batch-1', 'prod-4', 1, 4, 1, 'open', timezone('utc'::text, now() + interval '40 hours')),
('bundle-prod-5-batch-1', 'prod-5', 1, 4, 2, 'open', timezone('utc'::text, now() + interval '42 hours'))
ON CONFLICT (id) DO NOTHING;

-- স্লট সিড করা
INSERT INTO public.bundle_slots (id, bundle_id, product_id, slot_number, size, status, user_id, user_name, user_phone_masked, booked_at)
VALUES 
('b1-s1', 'bundle-prod-1-batch-1', 'prod-1', 1, '39', 'booked', 'demo-1', 'তানভীর হাসান', '017****1234', now() - interval '2 hours'),
('b1-s2', 'bundle-prod-1-batch-1', 'prod-1', 2, '40', 'booked', 'demo-2', 'রাকিব আহমেদ', '018****5678', now() - interval '4 hours'),
('b1-s3', 'bundle-prod-1-batch-1', 'prod-1', 3, '41', 'booked', 'demo-3', 'মেহেদী জামান', '019****9012', now() - interval '1 hour'),
('b1-s4', 'bundle-prod-1-batch-1', 'prod-1', 4, '42', 'available', null, null, null, null),
('b1-s5', 'bundle-prod-1-batch-1', 'prod-1', 5, '43', 'available', null, null, null, null),
('b1-s6', 'bundle-prod-1-batch-1', 'prod-1', 6, '44', 'available', null, null, null, null)
ON CONFLICT (id) DO NOTHING;
