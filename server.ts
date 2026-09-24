import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Supabase Server Client
const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// ======================= API ROUTES (Data Input & Output) =======================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', supabaseConnected: Boolean(supabase), timestamp: new Date().toISOString() });
});

// 1. PRODUCTS
app.get('/api/products', async (req, res) => {
  if (!supabase) return res.json([]);
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  if (!supabase) return res.status(400).json({ success: false, error: 'Database not configured' });
  try {
    const product = req.body;
    const { error } = await supabase.from('products').upsert({
      id: product.id,
      title: product.title,
      category: product.category,
      description: product.description,
      image_url: product.imageUrl,
      retail_price: product.retailPrice,
      group_price: product.groupPrice,
      wholesale_price: product.wholesalePrice,
      full_bundle_price_per_piece: product.fullBundlePricePerPiece,
      bundle_size: product.bundleSize,
      available_sizes: product.availableSizes,
      status: product.status || 'active',
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. BUNDLES & SLOTS
app.get('/api/bundles', async (req, res) => {
  if (!supabase) return res.json([]);
  try {
    const { data: bundlesData, error } = await supabase.from('bundles').select('*').order('batch_number', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });

    const { data: slotsData } = await supabase.from('bundle_slots').select('*');
    res.json({ bundles: bundlesData || [], slots: slotsData || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bundles', async (req, res) => {
  if (!supabase) return res.status(400).json({ success: false, error: 'Database not configured' });
  try {
    const bundle = req.body;
    const { error: bundleErr } = await supabase.from('bundles').upsert({
      id: bundle.id,
      product_id: bundle.productId,
      batch_number: bundle.batchNumber,
      total_slots: bundle.totalSlots,
      filled_slots: bundle.filledSlots,
      status: bundle.status,
      expires_at: bundle.expiresAt,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    if (bundleErr) return res.status(500).json({ success: false, error: bundleErr.message });

    if (bundle.slots && bundle.slots.length > 0) {
      const slotRecords = bundle.slots.map((s: any) => ({
        id: s.id,
        bundle_id: bundle.id,
        product_id: bundle.productId,
        size: s.size,
        status: s.status || 'available',
        user_id: s.userId || null,
        user_name: s.userName || null,
        user_phone_masked: s.userPhoneMasked || null,
        booked_at: s.bookedAt || null
      }));
      await supabase.from('bundle_slots').upsert(slotRecords, { onConflict: 'id' });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/bundles/slot', async (req, res) => {
  if (!supabase) return res.status(400).json({ success: false, error: 'Database not configured' });
  try {
    const slot = req.body;
    const { error } = await supabase.from('bundle_slots').update({
      status: slot.status,
      user_id: slot.userId || null,
      user_name: slot.userName || null,
      user_phone_masked: slot.userPhoneMasked || null,
      booked_at: slot.bookedAt || null
    }).eq('id', slot.id);

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/bundles/status', async (req, res) => {
  if (!supabase) return res.status(400).json({ success: false, error: 'Database not configured' });
  try {
    const { bundleId, status, filledSlots } = req.body;
    const payload: any = { status, updated_at: new Date().toISOString() };
    if (typeof filledSlots === 'number') payload.filled_slots = filledSlots;

    const { error } = await supabase.from('bundles').update(payload).eq('id', bundleId);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. ORDERS
app.get('/api/orders', async (req, res) => {
  if (!supabase) return res.json([]);
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  if (!supabase) return res.status(400).json({ success: false, error: 'Database not configured' });
  try {
    const order = req.body;
    const payload = {
      id: order.id,
      customer_id: order.customerId || null,
      customer_name: order.customerName || '',
      customer_phone: order.customerPhone || order.contactPhone || '',
      bundle_id: order.bundleId,
      slot_id: order.slotId || null,
      batch_number: order.batchNumber,
      product_id: order.productId,
      product_title: order.productTitle,
      product_image: order.productImage,
      size: order.size,
      is_full_bundle: Boolean(order.isFullBundle),
      total_pieces: order.totalPieces || 1,
      group_price: order.groupPrice,
      advance_amount: order.advanceAmount,
      due_amount: order.dueAmount,
      delivery_address: order.deliveryAddress,
      payment_method: order.paymentMethod,
      transaction_id: order.transactionId || null,
      status: order.status,
      created_at: order.createdAt || new Date().toISOString()
    };

    const { error } = await supabase.from('orders').insert(payload);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. CUSTOMERS
app.post('/api/customers', async (req, res) => {
  if (!supabase) return res.status(400).json({ success: false, error: 'Database not configured' });
  try {
    const customer = req.body;
    const payload = {
      id: customer.id,
      phone: customer.phone.trim(),
      password: customer.password,
      full_name: customer.fullName.trim(),
      delivery_address: customer.deliveryAddress || '',
      district: customer.district || '',
      created_at: customer.createdAt || new Date().toISOString()
    };

    const { error } = await supabase.from('customers').upsert(payload, { onConflict: 'phone' });
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve static frontend build in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Also serve admin.html as a separate route if requested
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// SPA fallback for React Router / client routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
