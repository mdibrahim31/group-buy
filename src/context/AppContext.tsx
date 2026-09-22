import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Bundle, Order, BundleSlot } from '../types';
import { INITIAL_PRODUCTS, INITIAL_BUNDLES } from '../data/initialData';

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
  login: (phone: string, pass: string) => { success: boolean; message: string };
  register: (phone: string, pass: string, name: string, address: string, district: string) => { success: boolean; message: string };
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER = 'groupbuy_user_session';
const LOCAL_STORAGE_KEY_BUNDLES = 'groupbuy_bundles_data';
const LOCAL_STORAGE_KEY_PRODUCTS = 'groupbuy_products_data';
const LOCAL_STORAGE_KEY_ORDERS = 'groupbuy_orders_data';
const LOCAL_STORAGE_KEY_USERS_DB = 'groupbuy_registered_users';

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
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [bundles, setBundles] = useState<Bundle[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BUNDLES);
      return saved ? JSON.parse(saved) : INITIAL_BUNDLES;
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

  // Auth: Phone + Password
  const login = (phone: string, pass: string) => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || !pass) {
      return { success: false, message: 'ফোন নম্বর ও পাসওয়ার্ড প্রদান করুন।' };
    }

    try {
      const usersDbRaw = localStorage.getItem(LOCAL_STORAGE_KEY_USERS_DB);
      const usersDb: Record<string, { user: User; pass: string }> = usersDbRaw ? JSON.parse(usersDbRaw) : {};
      
      // Check if user exists in custom db
      if (usersDb[cleanPhone]) {
        if (usersDb[cleanPhone].pass === pass) {
          setUser(usersDb[cleanPhone].user);
          return { success: true, message: 'সফলভাবে লগইন হয়েছে।' };
        } else {
          return { success: false, message: 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।' };
        }
      }

      // Default quick test login if new
      const newUser: User = {
        id: 'user-' + Date.now(),
        phone: cleanPhone,
        fullName: 'কাস্টমার (' + cleanPhone.slice(-4) + ')',
        deliveryAddress: 'ঢাকা, বাংলাদেশ',
        district: 'ঢাকা'
      };
      usersDb[cleanPhone] = { user: newUser, pass };
      localStorage.setItem(LOCAL_STORAGE_KEY_USERS_DB, JSON.stringify(usersDb));
      setUser(newUser);
      return { success: true, message: 'লগইন সফল হয়েছে।' };
    } catch (err) {
      return { success: false, message: 'লগইনে সমস্যা হয়েছে।' };
    }
  };

  const register = (phone: string, pass: string, name: string, address: string, district: string) => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || !pass || !name) {
      return { success: false, message: 'সব প্রয়োজনীয় তথ্য পূরণ করুন।' };
    }

    try {
      const usersDbRaw = localStorage.getItem(LOCAL_STORAGE_KEY_USERS_DB);
      const usersDb: Record<string, { user: User; pass: string }> = usersDbRaw ? JSON.parse(usersDbRaw) : {};

      const newUser: User = {
        id: 'user-' + Date.now(),
        phone: cleanPhone,
        fullName: name.trim(),
        deliveryAddress: address.trim(),
        district: district.trim() || 'ঢাকা'
      };

      usersDb[cleanPhone] = { user: newUser, pass };
      localStorage.setItem(LOCAL_STORAGE_KEY_USERS_DB, JSON.stringify(usersDb));
      setUser(newUser);
      return { success: true, message: 'রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে।' };
    } catch (err) {
      return { success: false, message: 'রেজিস্ট্রেশনে সমস্যা হয়েছে।' };
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

    const bookedSlot: BundleSlot = {
      ...targetSlot,
      status: 'booked',
      userId: user?.id || 'guest-' + Date.now(),
      userName: buyerName || user?.fullName || 'গ্রাহক',
      userPhoneMasked: maskPhone(contactPhone || user?.phone || '01700000000'),
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

    // Create Order record
    const newOrder: Order = {
      id: 'ord-' + Date.now(),
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
      contactPhone,
      paymentMethod,
      status: isNowCompleted ? 'ordered_wholesale' : 'confirmed',
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);

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

    // Determine current max batch number for this product
    const existingBatches = bundles.filter(b => b.productId === productId);
    const nextBatchNumber = existingBatches.length > 0
      ? Math.max(...existingBatches.map(b => b.batchNumber)) + 1
      : 1;

    const newBundleId = `bundle-${productId}-batch-${nextBatchNumber}`;

    // Create slots based on product available sizes or repeat to match bundleSize
    const slots: BundleSlot[] = [];
    let slotCounter = 1;
    
    // Fill slots up to product.bundleSize
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

    // If customer selected a desired size to join this new batch immediately
    if (desiredSize) {
      const matchingSlot = slots.find(s => s.size === desiredSize && s.status === 'available');
      if (matchingSlot) {
        matchingSlot.status = 'booked';
        matchingSlot.userId = user?.id || 'guest-' + Date.now();
        matchingSlot.userName = buyerName || user?.fullName || 'গ্রাহক';
        matchingSlot.userPhoneMasked = maskPhone(contactPhone || user?.phone || '01700000000');
        matchingSlot.bookedAt = new Date().toISOString();
        initialFilled = 1;

        initialOrder = {
          id: 'ord-' + Date.now(),
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
          contactPhone: contactPhone || user?.phone || '01700000000',
          paymentMethod,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        };
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
        userId: user?.id || 'guest-' + Date.now(),
        userName: buyerName || user?.fullName || 'সম্পূর্ণ বান্ডিল ক্রেতা',
        userPhoneMasked: maskPhone(contactPhone || user?.phone || '01700000000'),
        bookedAt: new Date().toISOString(),
      });
    }

    const newBundle: Bundle = {
      id: newBundleId,
      productId: product.id,
      batchNumber: nextBatchNumber,
      totalSlots: product.bundleSize,
      filledSlots: product.bundleSize,
      status: 'completed', // Immediately completed
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 48).toISOString(),
      slots,
    };

    const newOrder: Order = {
      id: 'ord-bundle-' + Date.now(),
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
      contactPhone,
      paymentMethod,
      status: 'ordered_wholesale',
      createdAt: new Date().toISOString(),
    };

    setBundles(prev => [newBundle, ...prev]);
    setOrders(prev => [newOrder, ...prev]);

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
        login,
        register,
        logout,
        bookSlot,
        createNewBatchForProduct,
        buyWholeBundle,
        updateBatchStatus,
        addProduct,
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
