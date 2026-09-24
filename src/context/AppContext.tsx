import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Bundle, Order, BundleSlot, Customer, AppNotification } from '../types';
import { INITIAL_PRODUCTS, INITIAL_BUNDLES, INITIAL_NOTIFICATIONS } from '../data/initialData';
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
  dbGetAllCategories,
  dbSaveCategory,
  dbDeleteCategory,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';

interface AppContextType {
  user: User | null;
  products: Product[];
  bundles: Bundle[];
  orders: Order[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  notificationModalOpen: boolean;
  setNotificationModalOpen: (open: boolean) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  categories: string[];
  addCategory: (name: string) => { success: boolean; message: string };
  deleteCategory: (name: string) => { success: boolean; message: string };
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSizeFilter: string;
  setSelectedSizeFilter: (size: string) => void;
  onlyLastSlotFilter: boolean;
  setOnlyLastSlotFilter: (value: boolean | ((prev: boolean) => boolean)) => void;
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
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'COD',
    deliveryAddress: string,
    contactPhone: string,
    buyerName: string,
    transactionId?: string
  ) => { success: boolean; order?: Order; message: string };
  createNewBatchForProduct: (
    productId: string,
    desiredSize?: string,
    advanceAmount?: number,
    paymentMethod?: 'bKash' | 'Nagad' | 'Rocket' | 'COD',
    deliveryAddress?: string,
    contactPhone?: string,
    buyerName?: string,
    transactionId?: string
  ) => { success: boolean; newBatchNumber: number; message: string };
  buyWholeBundle: (
    productId: string,
    advanceAmount: number,
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'COD',
    deliveryAddress: string,
    contactPhone: string,
    buyerName: string,
    transactionId?: string
  ) => { success: boolean; order?: Order; message: string };
  singleBuyProduct: (
    productId: string,
    selectedSize: string,
    advanceAmount: number,
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'COD',
    deliveryAddress: string,
    contactPhone: string,
    buyerName: string,
    transactionId?: string,
    quantity?: number
  ) => { success: boolean; order?: Order; message: string };
  updateBatchStatus: (bundleId: string, status: Bundle['status']) => void;
  removeCustomerSlot: (bundleId: string, slotId: string, reason?: string) => { success: boolean; message: string };
  addProduct: (product: Omit<Product, 'id'>) => void;
  findOrderByIdOrCustomer: (query: string) => Promise<Order[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER = 'groupbuy_user_session';
const LOCAL_STORAGE_KEY_BUNDLES = 'groupbuy_bundles_data_v2';
const LOCAL_STORAGE_KEY_ORDERS = 'groupbuy_user_orders_v2';
const LOCAL_STORAGE_KEY_PRODUCTS = 'groupbuy_products_data_v2';
const LOCAL_STORAGE_KEY_USERS_DB = 'groupbuy_registered_customers_db';
const LOCAL_STORAGE_KEY_NOTIFICATIONS = 'groupbuy_notifications_data_v2';
const LOCAL_STORAGE_KEY_CATEGORIES = 'groupbuy_categories_v2';

const DEFAULT_CATEGORIES = ['জুতা', 'কাপড়'];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CATEGORIES);
      if (!saved) return DEFAULT_CATEGORIES;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(p => !['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5'].includes(p.id));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [bundles, setBundles] = useState<Bundle[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BUNDLES);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(b => !b.id.startsWith('bundle-prod-1') && !b.id.startsWith('bundle-prod-2') && !b.id.startsWith('bundle-prod-3'));
      }
      return [];
    } catch {
      return [];
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

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFICATIONS);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('সব');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('all');
  const [onlyLastSlotFilter, setOnlyLastSlotFilter] = useState(false);

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

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

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

  // Load products, bundles, and categories from Supabase on launch
  useEffect(() => {
    const loadSupabaseCatalog = async () => {
      if (!isSupabaseConfigured()) return;
      try {
        const [remoteProducts, remoteBundles, remoteCategories] = await Promise.all([
          dbGetAllProducts(),
          dbGetAllBundles(),
          dbGetAllCategories(),
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

        if (remoteCategories.length > 0) {
          setCategories(prev => {
            const combined = Array.from(new Set([...prev, ...remoteCategories]));
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY_CATEGORIES, JSON.stringify(combined));
            } catch (e) {
              console.error(e);
            }
            return combined;
          });
        }
      } catch (err) {
        console.warn('Catalog sync notice:', err);
      }
    };
    loadSupabaseCatalog();
  }, []);

  // Supabase Realtime listener for bundles table
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('public:bundles-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bundles' },
        async () => {
          try {
            const remoteBundles = await dbGetAllBundles();
            if (remoteBundles.length > 0) {
              setBundles(remoteBundles);
            }
          } catch (e) {
            console.warn('Realtime bundle sync error:', e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        setOrders(remoteOrders);
        localStorage.setItem(LOCAL_STORAGE_KEY_ORDERS, JSON.stringify(remoteOrders));

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
          const remoteOrders = await dbGetOrdersByCustomerId(localUser.id, cleanPhone);
          setOrders(remoteOrders);
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
            message: `ডাটাবেজ ত্রুটি: ${dbResult.error || 'তথ্য সংরক্ষণ করা যায়নি।'} (Supabase RLS বা টেবিল চেক করুন)`,
          };
        }
      }

      // Save to localStorage cache
      usersDb[cleanPhone] = { user: newCustomer, pass };
      localStorage.setItem(LOCAL_STORAGE_KEY_USERS_DB, JSON.stringify(usersDb));

      setUser(newCustomer);
      setOrders([]);
      return { success: true, message: 'রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে।' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'রেজিস্ট্রেশনে সমস্যা হয়েছে।' };
    }
  };

  const logout = () => {
    setUser(null);
    setOrders([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ORDERS);
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
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'COD',
    deliveryAddress: string,
    contactPhone: string,
    buyerName: string,
    transactionId?: string
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

    const currentCustomerId = user?.id || (user?.phone ? `cust-${user.phone}` : `cust-${Date.now()}`);
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

    // Unique slot and order identification
    const effectiveAdvance = Math.min(advanceAmount, product.groupPrice);
    const effectiveDue = Math.max(0, product.groupPrice - effectiveAdvance);

    const newOrder: Order = {
      id: `ord-${targetBundle.id.replace('bundle-', '')}-${targetSlot.size}-${Date.now().toString().slice(-6)}`,
      customerId: currentCustomerId,
      customerName: currentCustomerName,
      customerPhone: currentPhone,
      bundleId: targetBundle.id,
      slotId: targetSlot.id,
      batchNumber: targetBundle.batchNumber,
      productId: product.id,
      productTitle: product.title,
      productImage: product.imageUrl,
      size: targetSlot.size,
      groupPrice: product.groupPrice,
      advanceAmount: effectiveAdvance,
      dueAmount: effectiveDue,
      deliveryAddress,
      contactPhone: currentPhone,
      paymentMethod,
      transactionId: transactionId?.trim() || undefined,
      status: isNowCompleted ? 'ordered_wholesale' : 'confirmed',
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);

    // 1. Notification for the customer who booked
    addNotification({
      title: '✅ স্লট বুকিং সফল হয়েছে!',
      message: `${product.title} (সাইজ: ${targetSlot.size}, ব্যাচ #${targetBundle.batchNumber}) এর জন্য আপনার স্লট সংরক্ষিত হয়েছে। অগ্রিম ৳${effectiveAdvance} পরিশোধিত।`,
      type: 'order',
      linkAction: 'my_bookings',
      bundleId: targetBundle.id,
      productId: product.id,
    });

    // 2. Notification for same bundle participants (when a co-buyer joins a slot)
    if (!isNowCompleted) {
      addNotification({
        title: '👥 আপনার বান্ডিলে নতুন ক্রেতা যুক্ত হয়েছেন!',
        message: `${product.title} (ব্যাচ #${targetBundle.batchNumber}) এ সাইজ ${targetSlot.size} এর আরও ১টি স্লট বুক হয়েছে! বাকি আছে মাত্র ${targetBundle.totalSlots - newFilledSlots}টি স্লট।`,
        type: 'slot_booked',
        linkAction: 'bundle',
        bundleId: targetBundle.id,
        productId: product.id,
      });
    }

    // 3. When the bundle becomes 100% full
    if (isNowCompleted) {
      // Customer notification
      addNotification({
        title: '🎉 স্লট সম্পূর্ণ হয়েছে (Slot Completed)!',
        message: `অভিনন্দন! ${product.title} (ব্যাচ #${targetBundle.batchNumber}) এর সবকটি (${targetBundle.totalSlots}টি) স্লট পূর্ণ হয়েছে! হোলসেলার অর্ডার সফলভাবে প্রস্তুত।`,
        type: 'bundle_complete',
        linkAction: 'bundle',
        bundleId: targetBundle.id,
        productId: product.id,
      });

      // Admin alert notification
      addNotification({
        title: '🚨 [অ্যাডমিন অ্যালার্ট] বান্ডিল ১০০% পূরণ হয়েছে!',
        message: `${product.title} (ব্যাচ #${targetBundle.batchNumber}) এর সবকটি (${targetBundle.totalSlots}টি) স্লট বুক সম্পন্ন হয়েছে। হোলসেলার অর্ডার ও প্যাকেজিং প্রসেস শুরু করুন।`,
        type: 'system',
        linkAction: 'bundle',
        bundleId: targetBundle.id,
        productId: product.id,
      });
    }

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
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'COD' = 'bKash',
    deliveryAddress = '',
    contactPhone = '',
    buyerName = '',
    transactionId?: string
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
          slotId: matchingSlot.id,
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
          transactionId: transactionId?.trim() || undefined,
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
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'COD',
    deliveryAddress: string,
    contactPhone: string,
    buyerName: string,
    transactionId?: string
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
      transactionId: transactionId?.trim() || undefined,
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

  // Single Buy (Direct Instant Purchase at Retail Price without group/batch waiting)
  const singleBuyProduct = (
    productId: string,
    selectedSize: string,
    advanceAmount: number,
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'COD',
    deliveryAddress: string,
    contactPhone: string,
    buyerName: string,
    transactionId?: string,
    quantity = 1
  ) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return { success: false, message: 'পণ্য খুঁজে পাওয়া যায়নি।' };
    }

    const currentCustomerId = user?.id || `guest-${Date.now()}`;
    const currentCustomerName = buyerName || user?.fullName || 'একক ক্রেতা';
    const currentPhone = contactPhone || user?.phone || '01700000000';
    const qty = Math.max(1, quantity);
    const totalAmount = product.retailPrice * qty;
    const effectiveAdvance = Math.min(advanceAmount, totalAmount);
    const dueAmount = Math.max(0, totalAmount - effectiveAdvance);

    const newOrder: Order = {
      id: 'ord-single-' + Date.now(),
      customerId: currentCustomerId,
      customerName: currentCustomerName,
      customerPhone: currentPhone,
      bundleId: 'single-buy',
      batchNumber: 0,
      productId: product.id,
      productTitle: `${product.title} (একক ক্রয় - ${qty} পিস)`,
      productImage: product.imageUrl,
      size: selectedSize,
      isSingleBuy: true,
      orderType: 'single_buy',
      totalPieces: qty,
      groupPrice: totalAmount,
      advanceAmount: effectiveAdvance,
      dueAmount: dueAmount,
      deliveryAddress,
      contactPhone: currentPhone,
      paymentMethod,
      transactionId: transactionId?.trim() || undefined,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);

    // Customer Notification
    addNotification({
      title: '🛍️ একক অর্ডার নিশ্চিত হয়েছে (Single Buy)!',
      message: `আপনার "${product.title}" (সাইজ: ${selectedSize}, ${qty} পিস) একক অর্ডারটি গৃহীত হয়েছে। কোনো গ্রুপ অপেক্ষার প্রয়োজন নেই, দ্রুত পার্সেল পাঠানো হবে।`,
      type: 'order',
      linkAction: 'my_bookings',
      productId: product.id,
    });

    // Admin Notification
    addNotification({
      title: '🚨 [নতুন একক ক্রয়] Single Buy Order!',
      message: `${currentCustomerName} (${currentPhone}) "${product.title}" এর ${qty} পিস (সাইজ: ${selectedSize}) এককভাবে অর্ডার করেছেন।`,
      type: 'system',
      linkAction: 'my_bookings',
      productId: product.id,
    });

    // Save to Supabase
    dbSaveOrder(newOrder);

    return {
      success: true,
      order: newOrder,
      message: `অভিনন্দন! আপনার একক অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।`
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

  const addProduct = async (newProdData: Omit<Product, 'id'>) => {
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

    // Save to Supabase so all customers see it
    const productSaved = await dbSaveProduct(product);
    const bundleSaved = await dbSaveBundle(firstBundle);

    if (!productSaved || !bundleSaved) {
      console.warn('Warning: Product or bundle saved locally but Supabase sync returned false.');
    }

    // Broadcast notification to all customers that a new wholesale bundle is posted
    addNotification({
      title: '🔥 নতুন হোলসেল বান্ডিল যুক্ত হয়েছে!',
      message: `${product.title} এর নতুন হোলসেল বান্ডিল শপে উন্মুক্ত করা হয়েছে! দ্রুত পাইকারি মূল্যে সাইজ স্লট বুক করুন।`,
      type: 'promo',
      linkAction: 'product',
      productId: product.id,
    });

    return { success: true, message: 'বান্ডিল সফলভাবে পোস্ট হয়েছে!' };
  };

  // Admin remove customer from a slot
  const removeCustomerSlot = (
    bundleId: string,
    slotId: string,
    reason?: string
  ): { success: boolean; message: string } => {
    const targetBundle = bundles.find(b => b.id === bundleId);
    if (!targetBundle) {
      return { success: false, message: 'বান্ডিল খুঁজে পাওয়া যায়নি।' };
    }

    const targetSlot = targetBundle.slots.find(s => s.id === slotId);
    if (!targetSlot || targetSlot.status !== 'booked') {
      return { success: false, message: 'এই স্লটটি বুক করা অবস্থায় পাওয়া যায়নি।' };
    }

    const product = products.find(p => p.id === targetBundle.productId);
    const removedUserName = targetSlot.userName || 'গ্রাহক';
    const removedSize = targetSlot.size;

    const clearedSlot: BundleSlot = {
      id: targetSlot.id,
      bundleId: targetSlot.bundleId,
      size: targetSlot.size,
      status: 'available',
      userId: undefined,
      userName: undefined,
      userPhoneMasked: undefined,
      bookedAt: undefined,
    };

    const updatedSlots = targetBundle.slots.map(s => (s.id === slotId ? clearedSlot : s));
    const newFilledSlots = updatedSlots.filter(s => s.status === 'booked').length;

    const updatedBundle: Bundle = {
      ...targetBundle,
      slots: updatedSlots,
      filledSlots: newFilledSlots,
      status: targetBundle.status === 'completed' || targetBundle.status === 'ordered' ? 'open' : targetBundle.status,
    };

    setBundles(prev => prev.map(b => (b.id === bundleId ? updatedBundle : b)));

    // Remove or cancel the order associated with this slot
    setOrders(prev => prev.filter(o => !(o.bundleId === bundleId && (o.slotId === slotId || (o.size === removedSize && o.customerId === targetSlot.userId)))));

    // Send notification about slot cancellation
    addNotification({
      title: '⚠️ স্লট বুকিং বাতিল করা হয়েছে',
      message: `${product?.title || 'পণ্য'} (সাইজ: ${removedSize}, ব্যাচ #${targetBundle.batchNumber}) এর স্লট থেকে কাস্টমার (${removedUserName}) কে রিমুভ করা হয়েছে। ${reason ? `কারণ: ${reason}` : ''}`,
      type: 'system',
      linkAction: 'bundle',
      bundleId: targetBundle.id,
      productId: product?.id,
    });

    // Update Supabase
    dbUpdateBundleSlot(clearedSlot);
    dbUpdateBundleStatus(updatedBundle.id, updatedBundle.status, updatedBundle.filledSlots);

    return {
      success: true,
      message: `সাইজ ${removedSize} এর স্লটটি সফলভাবে খালি করা হয়েছে এবং কাস্টমারকে রিমুভ করা হয়েছে।`
    };
  };

  // Add new category
  const addCategory = (name: string): { success: boolean; message: string } => {
    const clean = name.trim();
    if (!clean) return { success: false, message: 'ক্যাটাগরির নাম লিখুন' };
    if (categories.includes(clean)) {
      return { success: false, message: 'এই ক্যাটাগরি ইতিমধ্যে বিদ্যমান আছে' };
    }
    const updated = [...categories, clean];
    setCategories(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    // Save to Supabase Database
    dbSaveCategory(clean);

    return { success: true, message: `"${clean}" ক্যাটাগরি সফলভাবে যুক্ত ও সেভ হয়েছে` };
  };

  // Delete category
  const deleteCategory = (name: string): { success: boolean; message: string } => {
    const clean = name.trim();
    if (!clean) return { success: false, message: 'ক্যাটাগরির নাম পাওয়া যায়নি' };
    const updated = categories.filter(c => c !== clean);
    setCategories(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    // Delete from Supabase Database
    dbDeleteCategory(clean);

    if (selectedCategory === clean) {
      setSelectedCategory('সব');
    }
    return { success: true, message: `"${clean}" ক্যাটাগরি মুছে ফেলা হয়েছে` };
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
        notifications,
        unreadNotificationsCount,
        notificationModalOpen,
        setNotificationModalOpen,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        addNotification,
        authModalOpen,
        setAuthModalOpen,
        categories,
        addCategory,
        deleteCategory,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedSizeFilter,
        setSelectedSizeFilter,
        onlyLastSlotFilter,
        setOnlyLastSlotFilter,
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
        singleBuyProduct,
        updateBatchStatus,
        removeCustomerSlot,
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
