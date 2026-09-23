import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Bundle, Order, BundleSlot, Customer } from '../types';
import { INITIAL_PRODUCTS, INITIAL_BUNDLES } from '../data/initialData';
import {
  dbGetCustomerByPhone,
  dbSaveCustomer,
  dbSaveOrder,
  dbGetOrdersByCustomerId,
  dbFindOrderById,
  dbGetAllProducts,
  dbSaveProduct,
  dbGetAllBundles,
  dbSaveBundle,
  dbUpdateBundleSlot,
  dbUpdateBundleStatus,
  isSupabaseConfigured,
} from '../lib/supabase';

interface AppContextType {
  user: User | null;
  products: Product[];
  bundles: Bundle[];
  orders: Order[];
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  myBookingsOpen: boolean;
  setMyBookingsOpen: (open: boolean) => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  login: (phone: string, pass: string) => Promise<{ success: boolean; message: string }>;
  register: (phone: string, pass: string, name: string, address: string, district: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  bookSlot: (
    bundleId: string,
    slotId: string,
    advanceAmount: number,
    paymentMethod: 'bKash' | 'Nagad' | 'COD',
    deliveryAddress: string,
    contactPhone: string,
    buyerName: string
  ) => { success: boolean; order?: Order; message: string };
  createNewBatchForProduct: (
    productId: string,
    desiredSize?: string,
    advanceAmount?: number,
    paymentMethod?: 'bKash' | 'Nagad' | 'COD',
    deliveryAddress?: string,
    contactPhone?: string,
    buyerName?: string
  ) => { success: boolean; newBatchNumber: number; message: string };
  buyWholeBundle: (
    productId: string,
    advanceAmount: number,
    paymentMethod: 'bKash' | 'Nagad' | 'COD',
    deliveryAddress: string,
    contactPhone: string,
    buyerName: string
  ) => { success: boolean; order?: Order; message: string };
  updateBatchStatus: (bundleId: string, status: Bundle['status']) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  findOrderByIdOrCustomer: (query: string) => Promise<Order[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER = 'groupbuy_user_session';
const LOCAL_STORAGE_KEY_BUNDLES = 'groupbuy_bundles_data';
const LOCAL_STORAGE_KEY_ORDERS = 'groupbuy_user_orders';
const LOCAL_STORAGE_KEY_PRODUCTS = 'groupbuy_products_data';
const LOCAL_STORAGE_KEY_USERS_DB = 'groupbuy_registered_customers_db';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
      if (!saved) return INITIAL_PRODUCTS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [bundles, setBundles] = useState<Bundle[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BUNDLES);
      if (!saved) return INITIAL_BUNDLES;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BUNDLES;
    } catch {
      return INITIAL_BUNDLES;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('সব');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state to local storage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_BUNDLES, JSON.stringify(bundles));
    } catch (e) {
      console.error(e);
    }
  }, [bundles]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // Sync user's orders from Supabase on launch
  useEffect(() => {
    if (!user) return;
    const fetchRemoteUserOrders = async () => {
      try {
        const remoteOrders = await dbGetOrdersByCustomerId(user.id, user.phone);
        if (remoteOrders.length > 0) {
          setOrders(prev => {
            const map = new Map<string, Order>();
            remoteOrders.forEach(o => map.set(o.id, o));
            prev.forEach(o => {
              if (!map.has(o.id)) map.set(o.id, o);
            });
            return Array.from(map.values());
          });
        }
      } catch (e) {
        console.warn('Orders sync notice:', e);
      }
    };
    fetchRemoteUserOrders();
  }, [user?.id]);

  // Load products and bundles from Supabase on launch
  useEffect(() => {
    const loadSupabaseCatalog = async () => {
      if (!isSupabaseConfigured()) return;
      try {
        const [remoteProducts, remoteBundles] = await Promise.all([
          dbGetAllProducts(),
          dbGetAllBundles(),
        ]);

        if (remoteProducts.length > 0) {
          setProducts(prev => {
            const map = new Map<string, Product>();
            prev.forEach(p => map.set(p.id, p));
            remoteProducts.forEach(p => map.set(p.id, p));
            return Array.from(map.values());
          });
        }

        if (remoteBundles.length > 0) {
          setBundles(prev => {
            const map = new Map<string, Bundle>();
            prev.forEach(b => map.set(b.id, b));
            remoteBundles.forEach(b => map.set(b.id, b));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('Catalog sync notice:', err);
      }
    };
    loadSupabaseCatalog();
  }, []);

  // Auth: Phone + Password with Supabase Customers table
  const login = async (phone: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || !pass) {
      return { success: false, message: 'ফোন নম্বর ও পাসওয়ার্ড প্রদান করুন।' };
    }

    try {
      // 1. Try Supabase customers table first
      const remoteCustomer = await dbGetCustomerByPhone(cleanPhone);
      if (remoteCustomer) {
        if (remoteCustomer.password && remoteCustomer.password !== pass) {
          return { success: false, message: 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।' };
        }
        setUser(remoteCustomer);

        // Fetch their orders from Supabase
        const remoteOrders = await dbGetOrdersByCustomerId(remoteCustomer.id, cleanPhone);
        if (remoteOrders.length > 0) {
          setOrders(prev => {
            const map = new Map<string, Order>();
            remoteOrders.forEach(o => map.set(o.id, o));
            prev.forEach(o => {
              if (!map.has(o.id)) map.set(o.id, o);
            });
            return Array.from(map.values());
          });
        }

        return { success: true, message: 'সফলভাবে লগইন হয়েছে।' };
      }

      // 2. Fallback to local storage database
      const usersDbRaw = localStorage.getItem(LOCAL_STORAGE_KEY_USERS_DB);
      const usersDb: Record<string, { user: User; pass: string }> = usersDbRaw ? JSON.parse(usersDbRaw) : {};

      if (usersDb[cleanPhone]) {
        if (usersDb[cleanPhone].pass === pass) {
          const localUser = usersDb[cleanPhone].user;
          setUser(localUser);
          // Sync to Supabase in background
          dbSaveCustomer({ ...localUser, password: pass });
          return { success: true, message: 'সফলভাবে লগইন হয়েছে।' };
        } else {
          return { success: false, message: 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।' };
        }
      }

      // Account not found - Must register first
      return {
        success: false,
        message: 'এই ফোন নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে আগে রেজিস্ট্রেশন করুন।',
      };
    } catch (err) {
      return { success: false, message: 'লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।' };
    }
  };

  const register = async (
    phone: string,
    pass: string,
    name: string,
    address: string,
    district: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || !pass || !name) {
      return { success: false, message: 'সব প্রয়োজনীয় তথ্য পূরণ করুন।' };
    }

    try {
      // 1. Check if customer already exists in Supabase
      const existingRemote = await dbGetCustomerByPhone(cleanPhone);
      if (existingRemote) {
        return { success: false, message: 'এই ফোন নম্বরে ইতোমধ্যে অ্যাকাউন্ট রয়েছে। দয়া করে লগইন করুন।' };
      }

      // 2. Check local database
      const usersDbRaw = localStorage.getItem(LOCAL_STORAGE_KEY_USERS_DB);
      const usersDb: Record<string, { user: User; pass: string }> = usersDbRaw ? JSON.parse(usersDbRaw) : {};

      if (usersDb[cleanPhone]) {
        return { success: false, message: 'এই ফোন নম্বরে ইতোমধ্যে অ্যাকাউন্ট রয়েছে। দয়া করে লগইন করুন।' };
      }

      const newCustomer: Customer = {
        id: 'cust-' + Date.now(),
        phone: cleanPhone,
        password: pass,
        fullName: name.trim(),
        deliveryAddress: address.trim(),
        district: district.trim() || 'ঢাকা',
        createdAt: new Date().toISOString(),
      };

      // 3. Save to Supabase customers table if configured
      if (isSupabaseConfigured()) {
        const dbResult = await dbSaveCustomer(newCustomer);
        if (!dbResult.success) {
          console.error('Supabase customer registration failed:', dbResult.error);
          return {
            success: false,
            message: `ডাটাবেজ ত্রুটি: ${dbResult.error || 'তথ্য সংরক্ষণ করা যায়নি।'} (Supabase RLS বা টেবিল পারমিশন চেক করুন)`,
          };
        }
      } else {
        console.warn('VITE_SUPABASE_URL অথবা VITE_SUPABASE_ANON_KEY অনুপস্থিত! তথ্য শুধু লোকাল ব্রাউজারে সংরক্ষিত হচ্ছে।');
      }

      // Save to localStorage cache
      usersDb[cleanPhone] = { user: newCustomer, pass };
      localStorage.setItem(LOCAL_STORAGE_KEY_USERS_DB, JSON.stringify(usersDb));

      setUser(newCustomer);
      return { success: true, message: 'রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে।' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'রেজিস্ট্রেশনে সমস্যা হয়েছে।' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  // Mask phone number for public slot visibility (e.g. 0171****82)
  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return '018****';
    return phone.slice(0, 4) + '****' + phone.slice(-2);
  };

  // Book a slot in an existing bundle
  const bookSlot = (
    bundleId: string,
    slotId: string,
    advanceAmount: number,
    paymentMethod: 'bKash' | 'Nagad' | 'COD',
    deliveryAddress: string,
    contactPhone: string,
    buyerName: string
  ) => {
    const targetBundle = bundles.find(b => b.id === bundleId);
    if (!targetBundle) {
      return { success: false, message: 'বান্ডিল খুঁজে পাওয়া যায়নি।' };
    }

    const targetSlot = targetBundle.slots.find(s => s.id === slotId);
    if (!targetSlot || targetSlot.status !== 'available') {
      return { success: false, message: 'এই সাইজের স্লটটি ইতোমধ্যে বুক হয়ে গেছে।' };
    }

    const product = products.find(p => p.id === targetBundle.productId);
    if (!product) {
      return { success: false, message: 'পণ্য খুঁজে পাওয়া যায়নি।' };
    }

    const currentCustomerId = user?.id || `guest-${Date.now()}`;
    const currentCustomerName = buyerName || user?.fullName || 'গ্রাহক';
    const currentPhone = contactPhone || user?.phone || '01700000000';

    const bookedSlot: BundleSlot = {
      ...targetSlot,
      status: 'booked',
      userId: currentCustomerId,
      userName: currentCustomerName,
      userPhoneMasked: maskPhone(currentPhone),
      bookedAt: new Date().toISOString(),
    };

    const updatedSlots = targetBundle.slots.map(s => s.id === slotId ? bookedSlot : s);
    const newFilledSlots = updatedSlots.filter(s => s.status === 'booked').length;
    const isNowCompleted = newFilledSlots >= targetBundle.totalSlots;

    const updatedBundle: Bundle = {
      ...targetBundle,
      slots: updatedSlots,
      filledSlots: newFilledSlots,
      status: isNowCompleted ? 'completed' : targetBundle.status,
    };

    setBundles(prev => prev.map(b => b.id === bundleId ? updatedBundle : b));

    // Create Order record linked with customer ID
    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      customerId: currentCustomerId,
      customerName: currentCustomerName,
      customerPhone: currentPhone,
      bundleId: targetBundle.id,
      batchNumber: targetBundle.batchNumber,
      productId: product.id,
      productTitle: product.title,
      productImage: product.imageUrl,
      size: targetSlot.size,
      groupPrice: product.groupPrice,
      advanceAmount: advanceAmount,
      dueAmount: product.groupPrice - advanceAmount,
      deliveryAddress,
      contactPhone: currentPhone,
      paymentMethod,
      status: isNowCompleted ? 'ordered_wholesale' : 'confirmed',
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);

    // Save to Supabase
    dbSaveOrder(newOrder);
    dbUpdateBundleSlot(bookedSlot);
    dbUpdateBundleStatus(updatedBundle.id, updatedBundle.status, updatedBundle.filledSlots);

    return {
      success: true,
      order: newOrder,
      message: isNowCompleted
        ? 'অভিনন্দন! এই বান্ডিলের সবকটি স্লট পূর্ণ হয়েছে! হোলসেলারকে অর্ডার করা হচ্ছে।'
        : 'সফলভাবে স্লট বুক হয়েছে! বান্ডিল পূর্ণ হলে ডেলিভারি প্রসেস শুরু হবে।'
    };
  };

  // If a slot is booked or customer wants to start another batch
  const createNewBatchForProduct = (
    productId: string,
    desiredSize?: string,
    advanceAmount = 150,
    paymentMethod: 'bKash' | 'Nagad' | 'COD' = 'bKash',
    deliveryAddress = '',
    contactPhone = '',
    buyerName = ''
  ) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return { success: false, newBatchNumber: 0, message: 'পণ্য খুঁজে পাওয়া যায়নি।' };
    }

    const currentCustomerId = user?.id || `guest-${Date.now()}`;
    const currentCustomerName = buyerName || user?.fullName || 'গ্রাহক';
    const currentPhone = contactPhone || user?.phone || '01700000000';

    // Determine current max batch number for this product
    const existingBatches = bundles.filter(b => b.productId === productId);
    const nextBatchNumber = existingBatches.length > 0
      ? Math.max(...existingBatches.map(b => b.batchNumber)) + 1
      : 1;

    const newBundleId = `bundle-${productId}-batch-${nextBatchNumber}`;

    // Create slots based on product available sizes or repeat to match bundleSize
    const slots: BundleSlot[] = [];
    let slotCounter = 1;
    
    for (let i = 0; i < product.bundleSize; i++) {
      const sizeIndex = i % product.availableSizes.length;
      const size = product.availableSizes[sizeIndex];
      const slotId = `${newBundleId}-slot-${slotCounter++}`;

      slots.push({
        id: slotId,
        bundleId: newBundleId,
        size: size,
        status: 'available',
      });
    }

    let initialFilled = 0;
    let initialOrder: Order | undefined;

    if (desiredSize) {
      const matchingSlot = slots.find(s => s.size === desiredSize && s.status === 'available');
      if (matchingSlot) {
        matchingSlot.status = 'booked';
        matchingSlot.userId = currentCustomerId;
        matchingSlot.userName = currentCustomerName;
        matchingSlot.userPhoneMasked = maskPhone(currentPhone);
        matchingSlot.bookedAt = new Date().toISOString();
        initialFilled = 1;

        initialOrder = {
          id: 'ord-' + Date.now(),
          customerId: currentCustomerId,
          customerName: currentCustomerName,
          customerPhone: currentPhone,
          bundleId: newBundleId,
          batchNumber: nextBatchNumber,
          productId: product.id,
          productTitle: product.title,
          productImage: product.imageUrl,
          size: desiredSize,
          groupPrice: product.groupPrice,
          advanceAmount: advanceAmount,
          dueAmount: product.groupPrice - advanceAmount,
          deliveryAddress: deliveryAddress || user?.deliveryAddress || 'ঠিকানা পরে যোগ করা হবে',
          contactPhone: currentPhone,
          paymentMethod,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        };

        dbSaveOrder(initialOrder);
      }
    }

    const newBundle: Bundle = {
      id: newBundleId,
      productId: product.id,
      batchNumber: nextBatchNumber,
      totalSlots: product.bundleSize,
      filledSlots: initialFilled,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 48).toISOString(),
      slots,
    };

    setBundles(prev => [newBundle, ...prev]);

    // Save new batch to Supabase
    dbSaveBundle(newBundle);

    if (initialOrder) {
      setOrders(prev => [initialOrder!, ...prev]);
    }

    return {
      success: true,
      newBatchNumber: nextBatchNumber,
      message: `ব্যাচ #${nextBatchNumber} সফলভাবে চালু হয়েছে এবং আপনার সাইজ ${desiredSize || ''} বুক করা হয়েছে!`
    };
  };

  const buyWholeBundle = (
    productId: string,
    advanceAmount: number,
    paymentMethod: 'bKash' | 'Nagad' | 'COD',
    deliveryAddress: string,
    contactPhone: string,
    buyerName: string
  ) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return { success: false, message: 'পণ্য খুঁজে পাওয়া যায়নি।' };
    }

    const currentCustomerId = user?.id || `guest-${Date.now()}`;
    const currentCustomerName = buyerName || user?.fullName || 'সম্পূর্ণ বান্ডিল ক্রেতা';
    const currentPhone = contactPhone || user?.phone || '01700000000';

    const existingBatches = bundles.filter(b => b.productId === productId);
    const nextBatchNumber = existingBatches.length > 0
      ? Math.max(...existingBatches.map(b => b.batchNumber)) + 1
      : 1;

    const newBundleId = `bundle-${productId}-batch-${nextBatchNumber}-full`;
    const pricePerPiece = product.fullBundlePricePerPiece || product.groupPrice;
    const totalAmount = pricePerPiece * product.bundleSize;

    // All slots are reserved for this one buyer
    const slots: BundleSlot[] = [];
    for (let i = 0; i < product.bundleSize; i++) {
      const sizeIndex = i % product.availableSizes.length;
      const size = product.availableSizes[sizeIndex];
      slots.push({
        id: `${newBundleId}-slot-${i + 1}`,
        bundleId: newBundleId,
        size: size,
        status: 'booked',
        userId: currentCustomerId,
        userName: currentCustomerName,
        userPhoneMasked: maskPhone(currentPhone),
        bookedAt: new Date().toISOString(),
      });
    }

    const newBundle: Bundle = {
      id: newBundleId,
      productId: product.id,
      batchNumber: nextBatchNumber,
      totalSlots: product.bundleSize,
      filledSlots: product.bundleSize,
      status: 'completed',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 48).toISOString(),
      slots,
    };

    const newOrder: Order = {
      id: 'ord-bundle-' + Date.now(),
      customerId: currentCustomerId,
      customerName: currentCustomerName,
      customerPhone: currentPhone,
      bundleId: newBundleId,
      batchNumber: nextBatchNumber,
      productId: product.id,
      productTitle: `${product.title} (সম্পূর্ণ বান্ডিল - ${product.bundleSize} পিস)`,
      productImage: product.imageUrl,
      size: `সমস্ত সাইজ (${product.availableSizes.join(', ')})`,
      isFullBundle: true,
      totalPieces: product.bundleSize,
      groupPrice: totalAmount,
      advanceAmount: advanceAmount,
      dueAmount: totalAmount - advanceAmount,
      deliveryAddress,
      contactPhone: currentPhone,
      paymentMethod,
      status: 'ordered_wholesale',
      createdAt: new Date().toISOString(),
    };

    setBundles(prev => [newBundle, ...prev]);
    setOrders(prev => [newOrder, ...prev]);

    // Save to Supabase orders & bundles table
    dbSaveOrder(newOrder);
    dbSaveBundle(newBundle);

    return {
      success: true,
      order: newOrder,
      message: `অভিনন্দন! আপনি সম্পূর্ণ বান্ডিল (${product.bundleSize} পিস) আরও কম পাইকারি মূল্যে সফলভাবে অর্ডার করেছেন!`
    };
  };

  const updateBatchStatus = (bundleId: string, status: Bundle['status']) => {
    setBundles(prev => prev.map(b => b.id === bundleId ? { ...b, status } : b));
    setOrders(prev => prev.map(o => o.bundleId === bundleId ? {
      ...o,
      status: status === 'shipped' ? 'in_transit' : status === 'ordered' ? 'ordered_wholesale' : o.status
    } : o));
    dbUpdateBundleStatus(bundleId, status);
  };

  const addProduct = (newProdData: Omit<Product, 'id'>) => {
    const newId = 'prod-' + Date.now();
    const product: Product = {
      ...newProdData,
      id: newId,
    };
    setProducts(prev => [product, ...prev]);

    // Automatically create Batch 1 for this new product
    const newBundleId = `bundle-${newId}-batch-1`;
    const slots: BundleSlot[] = [];
    for (let i = 0; i < product.bundleSize; i++) {
      const sizeIndex = i % product.availableSizes.length;
      slots.push({
        id: `${newBundleId}-slot-${i + 1}`,
        bundleId: newBundleId,
        size: product.availableSizes[sizeIndex],
        status: 'available',
      });
    }

    const firstBundle: Bundle = {
      id: newBundleId,
      productId: newId,
      batchNumber: 1,
      totalSlots: product.bundleSize,
      filledSlots: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 48).toISOString(),
      slots,
    };

    setBundles(prev => [firstBundle, ...prev]);

    // Save directly to Supabase products and bundles tables
    dbSaveProduct(product);
    dbSaveBundle(firstBundle);
  };

  // Find order by Order ID or Customer ID
  const findOrderByIdOrCustomer = async (query: string): Promise<Order[]> => {
    const clean = query.trim();
    if (!clean) return [];

    // Search local orders state first
    const localMatches = orders.filter(
      o => o.id.toLowerCase().includes(clean.toLowerCase()) ||
           o.customerId?.toLowerCase().includes(clean.toLowerCase()) ||
           o.customerPhone?.includes(clean) ||
           o.contactPhone?.includes(clean)
    );

    // Also search Supabase if available
    try {
      const singleOrder = await dbFindOrderById(clean);
      const customerOrders = await dbGetOrdersByCustomerId(clean, clean);
      
      const merged = new Map<string, Order>();
      localMatches.forEach(o => merged.set(o.id, o));
      if (singleOrder) merged.set(singleOrder.id, singleOrder);
      customerOrders.forEach(o => merged.set(o.id, o));
      return Array.from(merged.values());
    } catch {
      return localMatches;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        products,
        bundles,
        orders,
        authModalOpen,
        setAuthModalOpen,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        myBookingsOpen,
        setMyBookingsOpen,
        profileModalOpen,
        setProfileModalOpen,
        login,
        register,
        logout,
        bookSlot,
        createNewBatchForProduct,
        buyWholeBundle,
        updateBatchStatus,
        addProduct,
        findOrderByIdOrCustomer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
