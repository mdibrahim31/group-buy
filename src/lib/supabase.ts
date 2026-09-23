import { createClient } from '@supabase/supabase-js';
import { Customer, Order } from '../types';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('https://'));
};

export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

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

export async function dbSaveCustomer(customer: Customer): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('customers').upsert({
      id: customer.id,
      phone: customer.phone.trim(),
      password: customer.password,
      full_name: customer.fullName.trim(),
      delivery_address: customer.deliveryAddress,
      district: customer.district,
      created_at: customer.createdAt || new Date().toISOString(),
    }, { onConflict: 'phone' });

    if (error) {
      console.warn('Supabase saveCustomer error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase save error:', err);
    return false;
  }
}

// ======================= ORDERS DB =======================

export async function dbSaveOrder(order: Order): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('orders').upsert({
      id: order.id,
      customer_id: order.customerId || null,
      customer_name: order.customerName || '',
      customer_phone: order.customerPhone || order.contactPhone || '',
      bundle_id: order.bundleId,
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
      status: order.status,
      created_at: order.createdAt || new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase saveOrder error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase order insert error:', err);
    return false;
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
      batchNumber: data.batch_number,
      productId: data.product_id,
      productTitle: data.product_title,
      productImage: data.product_image,
      size: data.size,
      isFullBundle: data.is_full_bundle,
      totalPieces: data.total_pieces,
      groupPrice: Number(data.group_price),
      advanceAmount: Number(data.advance_amount),
      dueAmount: Number(data.due_amount),
      deliveryAddress: data.delivery_address,
      contactPhone: data.customer_phone,
      paymentMethod: data.payment_method,
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
      status: d.status,
      createdAt: d.created_at,
    }));
  } catch {
    return [];
  }
}
