import { createClient } from '@supabase/supabase-js';
import { Customer, Order, Product, Bundle, BundleSlot } from '../types';

const getConfig = () => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');
  
  const customUrl = (typeof window !== 'undefined' ? localStorage.getItem('custom_supabase_url') || '' : '').trim().replace(/^["']|["']$/g, '');
  const customKey = (typeof window !== 'undefined' ? localStorage.getItem('custom_supabase_key') || '' : '').trim().replace(/^["']|["']$/g, '');

  return {
    url: envUrl || customUrl,
    key: envKey || customKey,
  };
};

const config = getConfig();
export const SUPABASE_URL = config.url;
export const SUPABASE_ANON_KEY = config.key;

export const isSupabaseConfigured = () => {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL.startsWith('https://') &&
    SUPABASE_ANON_KEY.length > 20
  );
};

export const supabase = (() => {
  try {
    if (!isSupabaseConfigured()) return null;
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn('Supabase safe init notice (client disabled):', err);
    return null;
  }
})();

// ======================= CUSTOMERS DB =======================

export async function dbGetCustomerByPhone(phone: string): Promise<Customer | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone.trim())
      .maybeSingle();

    if (error) {
      console.warn('Supabase getCustomerByPhone notice:', error.message);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      phone: data.phone,
      password: data.password,
      fullName: data.full_name || data.fullName,
      deliveryAddress: data.delivery_address || data.deliveryAddress || '',
      district: data.district || '',
      createdAt: data.created_at,
    };
  } catch (err) {
    console.warn('Supabase customer query notice:', err);
    return null;
  }
}

export async function dbSaveCustomer(customer: Customer): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return {
      success: false,
      error: 'ডাটাবেজ কানেক্টেড নেই (VITE_SUPABASE_URL অথবা VITE_SUPABASE_ANON_KEY পাওয়া যায়নি)।',
    };
  }
  try {
    const payload = {
      id: customer.id,
      phone: customer.phone.trim(),
      password: customer.password,
      full_name: customer.fullName.trim(),
      delivery_address: customer.deliveryAddress || '',
      district: customer.district || '',
      created_at: customer.createdAt || new Date().toISOString(),
    };

    // 1. Try direct insert
    const { error: insertError } = await supabase.from('customers').insert(payload);
    if (!insertError) {
      return { success: true };
    }

    console.warn('Direct insert notice, trying upsert:', insertError.message);

    // 2. If phone conflict, try upsert with onConflict phone
    const { error: upsertError } = await supabase
      .from('customers')
      .upsert(payload, { onConflict: 'phone' });

    if (!upsertError) {
      return { success: true };
    }

    // 3. Fallback: upsert on primary key (id)
    const { error: fallbackError } = await supabase
      .from('customers')
      .upsert(payload);

    if (fallbackError) {
      console.error('Supabase customer save error:', fallbackError.message);
      return { success: false, error: fallbackError.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Supabase save error:', err);
    return { success: false, error: err?.message || 'ডাটাবেজে সেভ হতে সমস্যা হয়েছে।' };
  }
}

// ======================= ORDERS DB =======================

export async function dbDeleteOrderBySlot(bundleId: string, slotId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('bundle_id', bundleId)
      .eq('slot_id', slotId);

    return !error;
  } catch {
    return false;
  }
}

export async function dbDeleteOrder(orderId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    return !error;
  } catch {
    return false;
  }
}

export async function dbSaveOrder(order: Order): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'ডাটাবেজ কানেক্টেড নেই।' };
  }
  try {
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
      color: order.color || null,
      is_full_bundle: Boolean(order.isFullBundle),
      total_pieces: order.totalPieces || 1,
      group_price: order.groupPrice,
      advance_amount: order.advanceAmount,
      due_amount: order.dueAmount,
      delivery_address: order.deliveryAddress,
      payment_method: order.paymentMethod,
      transaction_id: order.transactionId || null,
      status: order.status,
      created_at: order.createdAt || new Date().toISOString(),
    };

    const { error: insertError } = await supabase.from('orders').insert(payload);
    if (!insertError) return { success: true };

    const { error: upsertError } = await supabase.from('orders').upsert(payload);
    if (upsertError) {
      console.warn('Supabase saveOrder error:', upsertError.message);
      return { success: false, error: upsertError.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase order insert error:', err);
    return { success: false, error: err?.message || 'অর্ডার ডাটাবেজে সংরক্ষণ করা যায়নি।' };
  }
}

export async function dbGetOrdersByCustomerId(customerId: string, phone?: string): Promise<Order[]> {
  if (!supabase || (!customerId && !phone)) return [];
  try {
    let query = supabase.from('orders').select('*');

    if (customerId && phone) {
      query = query.or(`customer_id.eq.${customerId},customer_phone.eq.${phone.trim()}`);
    } else if (customerId) {
      query = query.eq('customer_id', customerId);
    } else if (phone) {
      query = query.eq('customer_phone', phone.trim());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase getOrdersByCustomerId error:', error.message);
      return [];
    }
    if (!data) return [];

    return data.map((d: any) => ({
      id: d.id,
      customerId: d.customer_id,
      customerName: d.customer_name,
      customerPhone: d.customer_phone,
      bundleId: d.bundle_id,
      slotId: d.slot_id,
      batchNumber: d.batch_number,
      productId: d.product_id,
      productTitle: d.product_title,
      productImage: d.product_image,
      size: d.size,
      isFullBundle: d.is_full_bundle,
      totalPieces: d.total_pieces,
      groupPrice: Number(d.group_price),
      advanceAmount: Number(d.advance_amount),
      dueAmount: Number(d.due_amount),
      deliveryAddress: d.delivery_address,
      contactPhone: d.customer_phone,
      paymentMethod: d.payment_method,
      transactionId: d.transaction_id || d.transactionId || '',
      status: d.status,
      createdAt: d.created_at,
    }));
  } catch (err) {
    console.warn('Supabase fetch error:', err);
    return [];
  }
}

export async function dbFindOrderById(orderId: string): Promise<Order | null> {
  if (!supabase || !orderId) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId.trim())
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      customerId: data.customer_id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      bundleId: data.bundle_id,
      slotId: data.slot_id,
      batchNumber: data.batch_number,
      productId: data.product_id,
      productTitle: data.product_title,
      productImage: data.product_image,
      size: data.size,
      color: data.color || undefined,
      isFullBundle: data.is_full_bundle,
      totalPieces: data.total_pieces,
      groupPrice: Number(data.group_price),
      advanceAmount: Number(data.advance_amount),
      dueAmount: Number(data.due_amount),
      deliveryAddress: data.delivery_address,
      contactPhone: data.customer_phone,
      paymentMethod: data.payment_method,
      transactionId: data.transaction_id || data.transactionId || '',
      status: data.status,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

export async function dbGetAllCustomers(): Promise<Customer[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((d: any) => ({
      id: d.id,
      phone: d.phone,
      password: d.password,
      fullName: d.full_name || d.fullName || '',
      deliveryAddress: d.delivery_address || d.deliveryAddress || '',
      district: d.district || '',
      createdAt: d.created_at,
    }));
  } catch {
    return [];
  }
}

export async function dbGetAllOrders(): Promise<Order[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((d: any) => ({
      id: d.id,
      customerId: d.customer_id,
      customerName: d.customer_name,
      customerPhone: d.customer_phone,
      bundleId: d.bundle_id,
      slotId: d.slot_id,
      batchNumber: d.batch_number,
      productId: d.product_id,
      productTitle: d.product_title,
      productImage: d.product_image,
      size: d.size,
      color: d.color || undefined,
      isFullBundle: d.is_full_bundle,
      totalPieces: d.total_pieces,
      groupPrice: Number(d.group_price),
      advanceAmount: Number(d.advance_amount),
      dueAmount: Number(d.due_amount),
      deliveryAddress: d.delivery_address,
      contactPhone: d.customer_phone,
      paymentMethod: d.payment_method,
      transactionId: d.transaction_id || d.transactionId || '',
      status: d.status,
      createdAt: d.created_at,
    }));
  } catch {
    return [];
  }
}

// ======================= PRODUCTS & BUNDLES DB =======================

export async function dbGetAllProducts(): Promise<Product[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((p: any) => {
      let colors: string[] = [];
      if (Array.isArray(p.available_colors) && p.available_colors.length > 0) {
        colors = p.available_colors;
      } else if (Array.isArray(p.colors) && p.colors.length > 0) {
        colors = p.colors;
      } else if (Array.isArray(p.availableColors) && p.availableColors.length > 0) {
        colors = p.availableColors;
      } else if (typeof p.color === 'string' && p.color.trim()) {
        colors = p.color.split(',').map((c: string) => c.trim()).filter(Boolean);
      } else if (typeof p.available_color === 'string' && p.available_color.trim()) {
        colors = p.available_color.split(',').map((c: string) => c.trim()).filter(Boolean);
      }

      return {
        id: p.id,
        title: p.title,
        category: p.category || 'জুতা',
        description: p.description || '',
        imageUrl: p.image_url,
        additionalImageUrls: p.additional_image_urls || p.additionalImageUrls || p.gallery_images || [],
        youtubeVideoUrl: p.youtube_video_url || p.youtubeVideoUrl || '',
        retailPrice: Number(p.retail_price),
        groupPrice: Number(p.group_price),
        wholesalePrice: Number(p.wholesale_price),
        fullBundlePricePerPiece: Number(p.full_bundle_price_per_piece || p.group_price),
        bundleSize: Number(p.bundle_size || 6),
        availableSizes: Array.isArray(p.available_sizes) ? p.available_sizes : [],
        availableColors: colors,
      };
    });
  } catch (err) {
    console.warn('Supabase dbGetAllProducts error:', err);
    return [];
  }
}

export async function dbSaveProduct(product: Product): Promise<boolean> {
  if (!supabase) return false;
  try {
    const colorsList = product.availableColors || [];
    const colorsJoined = colorsList.join(', ');

    const payload: any = {
      id: product.id,
      title: product.title,
      category: product.category,
      description: product.description,
      image_url: product.imageUrl,
      additional_image_urls: product.additionalImageUrls || [],
      gallery_images: product.additionalImageUrls || [],
      youtube_video_url: product.youtubeVideoUrl || null,
      retail_price: product.retailPrice,
      group_price: product.groupPrice,
      wholesale_price: product.wholesalePrice,
      full_bundle_price_per_piece: product.fullBundlePricePerPiece,
      bundle_size: product.bundleSize,
      available_sizes: product.availableSizes,
      available_colors: colorsList,
      available_color: colorsJoined || null,
      color: colorsJoined || null,
      colors: colorsList,
      status: 'active',
      updated_at: new Date().toISOString(),
    };

    let { error } = await supabase
      .from('products')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase dbSaveProduct notice:', error.message);
      delete payload.available_color;
      delete payload.color;
      delete payload.colors;
      const fallbackResult = await supabase
        .from('products')
        .upsert(payload, { onConflict: 'id' });

      if (fallbackResult.error) {
        console.warn('Supabase dbSaveProduct fallback error:', fallbackResult.error.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.warn('Supabase dbSaveProduct exception:', err);
    return false;
  }
}

export async function dbGetAllBundles(): Promise<Bundle[]> {
  if (!supabase) return [];
  try {
    const { data: bundlesData, error: bundlesError } = await supabase
      .from('bundles')
      .select('*')
      .order('batch_number', { ascending: true });

    if (bundlesError || !bundlesData) return [];

    const [{ data: slotsData }, { data: ordersData }] = await Promise.all([
      supabase.from('bundle_slots').select('*'),
      supabase.from('orders').select('*')
    ]);

    const ordersList = ordersData || [];
    const slotsByBundleId: Record<string, BundleSlot[]> = {};

    if (slotsData) {
      for (const s of slotsData) {
        let isBooked = s.status === 'booked';
        if (isBooked) {
          const hasOrder = ordersList.some((o: any) => 
            o.bundle_id === s.bundle_id && (o.slot_id === s.id || (o.size === s.size && (o.customer_id === s.user_id || o.customer_phone === s.user_phone_masked)))
          );
          if (!hasOrder) {
            // Order was deleted from database orders table! Free this slot automatically.
            s.status = 'available';
            s.user_id = null;
            s.user_name = null;
            s.user_phone_masked = null;
            s.booked_at = null;
            supabase.from('bundle_slots').update({
              status: 'available',
              user_id: null,
              user_name: null,
              user_phone_masked: null,
              booked_at: null,
            }).eq('id', s.id).then();
          }
        }

        if (!slotsByBundleId[s.bundle_id]) slotsByBundleId[s.bundle_id] = [];
        slotsByBundleId[s.bundle_id].push({
          id: s.id,
          bundleId: s.bundle_id,
          size: s.size,
          color: s.color || undefined,
          status: s.status,
          userId: s.user_id,
          userName: s.user_name,
          userPhoneMasked: s.user_phone_masked,
          bookedAt: s.booked_at,
        });
      }
    }

    return bundlesData.map((b: any) => {
      const bundleSlots = slotsByBundleId[b.id] || [];
      const filledCount = bundleSlots.filter(s => s.status === 'booked').length;
      return {
        id: b.id,
        productId: b.product_id,
        batchNumber: Number(b.batch_number),
        totalSlots: Number(b.total_slots),
        filledSlots: filledCount,
        status: b.status === 'completed' && filledCount < Number(b.total_slots) ? 'open' : b.status,
        createdAt: b.created_at,
        expiresAt: b.expires_at || new Date(Date.now() + 3600000 * 48).toISOString(),
        slots: bundleSlots,
        color: b.color || (bundleSlots.length > 0 ? bundleSlots[0].color : undefined),
        availableColors: b.available_colors || undefined,
      };
    });
  } catch (err) {
    console.warn('Supabase dbGetAllBundles error:', err);
    return [];
  }
}

export async function dbSaveBundle(bundle: Bundle): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload: any = {
      id: bundle.id,
      product_id: bundle.productId,
      batch_number: bundle.batchNumber,
      total_slots: bundle.totalSlots,
      filled_slots: bundle.filledSlots,
      status: bundle.status,
      expires_at: bundle.expiresAt,
      updated_at: new Date().toISOString(),
    };

    if (bundle.color) {
      payload.color = bundle.color;
    }
    if (bundle.availableColors) {
      payload.available_colors = bundle.availableColors;
    }

    const { error: bundleErr } = await supabase
      .from('bundles')
      .upsert(payload, { onConflict: 'id' });

    if (bundleErr) {
      console.warn('Supabase dbSaveBundle with color notice, retrying fallback:', bundleErr.message);
      // Fallback in case columns don't exist yet
      if (payload.color || payload.available_colors) {
        delete payload.color;
        delete payload.available_colors;
        const { error: retryErr } = await supabase
          .from('bundles')
          .upsert(payload, { onConflict: 'id' });
        if (retryErr) {
          console.error('Supabase dbSaveBundle retry error:', retryErr.message);
          return false;
        }
      } else {
        return false;
      }
    }

    if (bundle.slots && bundle.slots.length > 0) {
      const slotRecords = bundle.slots.map((s, index) => ({
        id: s.id,
        bundle_id: bundle.id,
        product_id: bundle.productId,
        slot_number: index + 1,
        size: s.size,
        color: s.color || bundle.color || null,
        status: s.status,
        user_id: s.userId || null,
        user_name: s.userName || null,
        user_phone_masked: s.userPhoneMasked || null,
        booked_at: s.bookedAt || null,
      }));

      await supabase.from('bundle_slots').upsert(slotRecords, { onConflict: 'id' });
    }

    return true;
  } catch (err) {
    console.warn('Supabase dbSaveBundle exception:', err);
    return false;
  }
}

export async function dbUpdateBundleSlot(slot: BundleSlot): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('bundle_slots')
      .upsert({
        id: slot.id,
        bundle_id: slot.bundleId,
        size: slot.size,
        color: slot.color || null,
        status: slot.status,
        user_id: slot.userId || null,
        user_name: slot.userName || null,
        user_phone_masked: slot.userPhoneMasked || null,
        booked_at: slot.bookedAt || new Date().toISOString(),
      }, { onConflict: 'id' });

    return !error;
  } catch {
    return false;
  }
}

export async function dbUpdateBundleStatus(bundleId: string, status: string, filledSlots?: number): Promise<boolean> {
  if (!supabase) return false;
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (typeof filledSlots === 'number') {
      updateData.filled_slots = filledSlots;
    }

    const { error } = await supabase
      .from('bundles')
      .update(updateData)
      .eq('id', bundleId);

    return !error;
  } catch {
    return false;
  }
}

// ======================= CATEGORIES DB =======================

export async function dbGetAllCategories(): Promise<string[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('name', { ascending: true });

    if (error || !data) return [];
    return data.map((d: any) => d.name).filter(Boolean);
  } catch (err) {
    console.warn('Supabase categories fetch notice:', err);
    return [];
  }
}

export async function dbSaveCategory(name: string): Promise<boolean> {
  if (!supabase || !name.trim()) return false;
  try {
    const cleanName = name.trim();
    const { error } = await supabase
      .from('categories')
      .upsert({ name: cleanName }, { onConflict: 'name' });

    if (error) {
      console.warn('Supabase dbSaveCategory error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase dbSaveCategory exception:', err);
    return false;
  }
}

export async function dbDeleteCategory(name: string): Promise<boolean> {
  if (!supabase || !name.trim()) return false;
  try {
    const cleanName = name.trim();
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('name', cleanName);

    if (error) {
      console.warn('Supabase dbDeleteCategory error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase dbDeleteCategory exception:', err);
    return false;
  }
}

// ======================= COLORS DB =======================

export async function dbGetAllColors(): Promise<string[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('colors')
      .select('name')
      .order('name', { ascending: true });

    if (error || !data) return [];
    return data.map((d: any) => d.name).filter(Boolean);
  } catch (err) {
    console.warn('Supabase colors fetch notice:', err);
    return [];
  }
}

export async function dbSaveColor(name: string): Promise<boolean> {
  if (!supabase || !name.trim()) return false;
  try {
    const cleanName = name.trim();
    const { error } = await supabase
      .from('colors')
      .upsert({ name: cleanName }, { onConflict: 'name' });

    if (error) {
      console.warn('Supabase dbSaveColor error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase dbSaveColor exception:', err);
    return false;
  }
}

export async function dbDeleteColor(name: string): Promise<boolean> {
  if (!supabase || !name.trim()) return false;
  try {
    const cleanName = name.trim();
    const { error } = await supabase
      .from('colors')
      .delete()
      .eq('name', cleanName);

    if (error) {
      console.warn('Supabase dbDeleteColor error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase dbDeleteColor exception:', err);
    return false;
  }
}


