import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldCheck,
  Search,
  Package,
  PlusCircle,
  Layers,
  CheckCircle2,
  ExternalLink,
  RefreshCcw,
  Lock,
  Image as ImageIcon,
  Tag,
  DollarSign,
  AlertCircle,
  Truck,
  Check,
  ChevronLeft,
  Phone,
  MapPin,
  CreditCard,
  Clock,
  Copy,
  Sparkles,
  Users,
  Eye,
  Trash2,
  FolderPlus,
  Folder,
  Palette,
} from 'lucide-react';
import { Order, Product, Bundle } from '../types';
import { dbGetAllOrders, isSupabaseConfigured } from '../lib/supabase';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SizeConfigItem {
  id: string;
  size: string;
  qty: number | '';
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const {
    orders: localOrders,
    products,
    bundles,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteBundle,
    cancelOrder,
    updateBatchStatus,
    removeCustomerSlot,
    categories,
    addCategory,
    deleteCategory,
    colors,
    addColor,
    deleteColor,
  } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Tabs: 'orders' | 'new-bundle' | 'bundles' | 'categories' | 'colors' | 'supabase-settings'
  const [activeTab, setActiveTab] = useState<'orders' | 'new-bundle' | 'bundles' | 'categories' | 'colors' | 'supabase-settings'>('bundles');
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => localStorage.getItem('custom_supabase_url') || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => localStorage.getItem('custom_supabase_key') || '');
  const [supabaseSaveMsg, setSupabaseSaveMsg] = useState<string | null>(null);

  const handleSaveSupabaseSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('custom_supabase_url', supabaseUrlInput.trim());
    localStorage.setItem('custom_supabase_key', supabaseKeyInput.trim());
    setSupabaseSaveMsg('সুপাবেস কানেকশন সফলভাবে সেভ হয়েছে! পেজ রিলোড হচ্ছে...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Category management state
  const [categoryInput, setCategoryInput] = useState('');
  const [categoryMsg, setCategoryMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [inlineCategoryInput, setInlineCategoryInput] = useState('');
  const [showInlineCatAdd, setShowInlineCatAdd] = useState(false);

  // Color management state
  const [colorInput, setColorInput] = useState('');
  const [colorMsg, setColorMsg] = useState<{ text: string; isError: boolean } | null>(null);


  // Selected Bundle for drill-down details view
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [bundleFilter, setBundleFilter] = useState<'all' | 'completed' | 'ongoing'>('all');

  // New Bundle Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<string>(categories[0] || 'জুতা');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>(['', '', '', '', '']);
  const [newYoutubeVideoUrl, setNewYoutubeVideoUrl] = useState('');
  const [newRetailPrice, setNewRetailPrice] = useState<number | ''>('');
  const [newGroupPrice, setNewGroupPrice] = useState<number | ''>('');
  const [newFullBundlePrice, setNewFullBundlePrice] = useState<number | ''>('');
  const [newColorsText, setNewColorsText] = useState('কালো, সাদা, ব্রাউন, নীল, লাল');
  const [newBundleColor, setNewBundleColor] = useState('কালো');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Sync selectedColors with database colors initially or when colors update
  useEffect(() => {
    if (colors && colors.length > 0) {
      if (selectedColors.length === 0) {
        setSelectedColors(colors);
      }
    }
  }, [colors, selectedColors]);

  // Sync default bundle color when selectedColors changes
  useEffect(() => {
    if (selectedColors.length > 0) {
      if (!selectedColors.includes(newBundleColor)) {
        setNewBundleColor(selectedColors[0]);
      }
    } else {
      setNewBundleColor('');
    }
  }, [selectedColors, newBundleColor]);

  // Sync newCategory when categories updates
  useEffect(() => {
    if (categories && categories.length > 0) {
      if (!newCategory || !categories.includes(newCategory)) {
        setNewCategory(categories[0]);
      }
    }
  }, [categories, newCategory]);

  // Edit Product / Bundle State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editAdditionalImages, setEditAdditionalImages] = useState<string[]>(['', '', '', '', '']);
  const [editYoutubeVideoUrl, setEditYoutubeVideoUrl] = useState('');
  const [editRetailPrice, setEditRetailPrice] = useState<number | ''>('');
  const [editGroupPrice, setEditGroupPrice] = useState<number | ''>('');
  const [editFullBundlePrice, setEditFullBundlePrice] = useState<number | ''>('');
  const [editSizesText, setEditSizesText] = useState('');
  const [editColorsText, setEditColorsText] = useState('');
  const [editSelectedColors, setEditSelectedColors] = useState<string[]>([]);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  const startEditingProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditTitle(prod.title);
    setEditCategory(prod.category);
    setEditDescription(prod.description || '');
    setEditImageUrl(prod.imageUrl);
    setEditAdditionalImages([
      prod.additionalImageUrls?.[0] || '',
      prod.additionalImageUrls?.[1] || '',
      prod.additionalImageUrls?.[2] || '',
      prod.additionalImageUrls?.[3] || '',
      prod.additionalImageUrls?.[4] || '',
    ]);
    setEditYoutubeVideoUrl(prod.youtubeVideoUrl || '');
    setEditRetailPrice(prod.retailPrice);
    setEditGroupPrice(prod.groupPrice);
    setEditFullBundlePrice(prod.fullBundlePricePerPiece || prod.groupPrice);
    setEditSizesText((prod.availableSizes || []).join(', '));
    
    const initialColorsList = prod.availableColors && prod.availableColors.length > 0 ? prod.availableColors : ['কালো', 'সাদা', 'ব্রাউন'];
    setEditSelectedColors(initialColorsList);
    setEditColorsText(initialColorsList.join(', '));
    setEditSuccessMsg(null);
  };

  const handleSaveEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const finalSizes = editSizesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const finalColors = editSelectedColors.length > 0 ? editSelectedColors : ['কালো', 'সাদা', 'ব্রাউন'];

    const updatedProd: Product = {
      ...editingProduct,
      title: editTitle.trim(),
      category: editCategory,
      description: editDescription.trim(),
      imageUrl: editImageUrl.trim(),
      additionalImageUrls: editAdditionalImages.filter(u => u.trim().length > 0),
      youtubeVideoUrl: editYoutubeVideoUrl.trim() || undefined,
      retailPrice: Number(editRetailPrice) || editingProduct.retailPrice,
      groupPrice: Number(editGroupPrice) || editingProduct.groupPrice,
      fullBundlePricePerPiece: Number(editFullBundlePrice) || Number(editGroupPrice) || editingProduct.fullBundlePricePerPiece,
      availableSizes: finalSizes.length > 0 ? finalSizes : editingProduct.availableSizes,
      availableColors: finalColors,
      bundleSize: finalSizes.length > 0 ? finalSizes.length : editingProduct.bundleSize,
    };

    const res = await updateProduct(updatedProd);
    if (res.success) {
      setEditSuccessMsg('বান্ডিল ও পণ্যের তথ্য সফলভাবে আপডেট হয়েছে!');
      setTimeout(() => {
        setEditingProduct(null);
        setEditSuccessMsg(null);
      }, 1500);
    }
  };

  // Size breakdown list with quantity per size
  const [sizeConfigs, setSizeConfigs] = useState<SizeConfigItem[]>([
    { id: '1', size: '39', qty: 1 },
    { id: '2', size: '40', qty: 1 },
    { id: '3', size: '41', qty: 1 },
    { id: '4', size: '42', qty: 1 },
    { id: '5', size: '43', qty: 1 },
    { id: '6', size: '44', qty: 1 },
  ]);

  const [newDescription, setNewDescription] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState('');

  // Calculate total bundle size from size configs
  const calculatedTotalPcs = sizeConfigs.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  // Preset image suggestions for quick posting
  const imagePresets = [
    {
      label: 'অফিসিয়াল লেদার জুতা',
      category: 'জুতা' as const,
      url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
      sizes: [
        { id: '1', size: '39', qty: 1 },
        { id: '2', size: '40', qty: 1 },
        { id: '3', size: '41', qty: 1 },
        { id: '4', size: '42', qty: 1 },
        { id: '5', size: '43', qty: 1 },
        { id: '6', size: '44', qty: 1 },
      ],
    },
    {
      label: 'ক্যাজুয়াল লোফার',
      category: 'জুতা' as const,
      url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
      sizes: [
        { id: '1', size: '39', qty: 1 },
        { id: '2', size: '40', qty: 1 },
        { id: '3', size: '41', qty: 1 },
        { id: '4', size: '42', qty: 1 },
        { id: '5', size: '43', qty: 1 },
        { id: '6', size: '44', qty: 1 },
      ],
    },
    {
      label: 'হোয়াইট স্নিকার্স',
      category: 'জুতা' as const,
      url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      sizes: [
        { id: '1', size: '40', qty: 1 },
        { id: '2', size: '41', qty: 2 },
        { id: '3', size: '42', qty: 2 },
        { id: '4', size: '43', qty: 1 },
      ],
    },
    {
      label: 'প্রিমিয়াম পোলো শার্ট',
      category: 'কাপড়' as const,
      url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
      sizes: [
        { id: '1', size: 'M', qty: 1 },
        { id: '2', size: 'L', qty: 2 },
        { id: '3', size: 'XL', qty: 2 },
        { id: '4', size: 'XXL', qty: 1 },
      ],
    },
    {
      label: 'সেমি-লং পাঞ্জাবি',
      category: 'কাপড়' as const,
      url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
      sizes: [
        { id: '1', size: '40', qty: 1 },
        { id: '2', size: '42', qty: 2 },
        { id: '3', size: '44', qty: 2 },
        { id: '4', size: '46', qty: 1 },
      ],
    },
  ];

  // Refresh Orders from Supabase or localStorage
  const refreshAdminData = async () => {
    setLoading(true);
    try {
      const remoteOrders = await dbGetAllOrders();
      const orderMap = new Map<string, Order>();
      remoteOrders.forEach(o => orderMap.set(o.id, o));
      localOrders.forEach(o => {
        if (!orderMap.has(o.id)) orderMap.set(o.id, o);
      });
      setAllOrders(Array.from(orderMap.values()));
    } catch (err) {
      console.error(err);
      setAllOrders(localOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refreshAdminData();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  // Environment variable for admin password (e.g., VITE_ADMIN_PASSWORD in GitHub / .env)
  const envAdminPassword = (
    // @ts-ignore
    (typeof __APP_ADMIN_PASSWORD__ !== 'undefined' ? __APP_ADMIN_PASSWORD__ : '') ||
    import.meta.env.VITE_ADMIN_PASSWORD ||
    (import.meta.env as any).ADMIN_PASSWORD ||
    (import.meta.env as any).VITE_PASSWORD ||
    (import.meta.env as any).PASSWORD ||
    ''
  ).trim().replace(/^["']|["']$/g, '') || 'admin123';

  // Strict Password verification - Only accepts value from environment variable or default fallback
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = adminPin.trim();

    if (entered === envAdminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      setPinError('');
    } else {
      setPinError('ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন (ডিফল্ট: admin123)');
    }
  };

  // Filter orders by search
  const filteredOrders = allOrders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      order.id.toLowerCase().includes(q) ||
      order.customerPhone?.includes(q) ||
      order.contactPhone?.includes(q) ||
      order.customerName?.toLowerCase().includes(q) ||
      order.productTitle.toLowerCase().includes(q) ||
      order.size.toLowerCase().includes(q)
    );
  });

  // Handle Post New Bundle
  const handlePostBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError('');

    if (!newTitle.trim()) {
      setPostError('দয়া করে পণ্যের নাম লিখুন');
      return;
    }
    if (!newImageUrl.trim()) {
      setPostError('পণ্যের ছবির লিংক (Image URL) দিন');
      return;
    }
    if (!newRetailPrice || !newGroupPrice) {
      setPostError('খুচরা মূল্য ও গ্রুপ বাই মূল্যের ঘর সঠিকভাবে পূরণ করুন');
      return;
    }

    // Build available sizes list accounting for quantity of each size
    const finalSizes: string[] = [];
    sizeConfigs.forEach((sc) => {
      const cleanSize = sc.size.trim();
      const count = Number(sc.qty) || 1;
      if (cleanSize) {
        for (let i = 0; i < count; i++) {
          finalSizes.push(cleanSize);
        }
      }
    });

    if (finalSizes.length === 0) {
      setPostError('কমপক্ষে একটি সাইজ ও পিস সংখ্যা সেট করুন');
      return;
    }

    const calculatedFullBundlePrice = newFullBundlePrice
      ? Number(newFullBundlePrice)
      : Math.round(Number(newGroupPrice) * 0.88);

    const autoWholesalePrice = Math.round(Number(newGroupPrice) * 0.75);

    const finalColors = selectedColors;

    if (finalColors.length === 0) {
      setPostError('দয়া করে কমপক্ষে একটি কালার সিলেক্ট করুন');
      return;
    }

    try {
      const res = await addProduct({
        title: newTitle.trim(),
        category: newCategory,
        description: newDescription.trim() || `${newTitle.trim()} - হোলসেল বান্ডিল গ্রুপ বায়িং।`,
        imageUrl: newImageUrl.trim(),
        additionalImageUrls: additionalImages.filter(u => u.trim().length > 0),
        youtubeVideoUrl: newYoutubeVideoUrl.trim() || undefined,
        retailPrice: Number(newRetailPrice),
        groupPrice: Number(newGroupPrice),
        wholesalePrice: autoWholesalePrice,
        fullBundlePricePerPiece: calculatedFullBundlePrice,
        bundleSize: finalSizes.length,
        availableSizes: finalSizes,
        availableColors: finalColors,
      }, newBundleColor.trim());

      if (res && res.success) {
        setPostSuccess(true);
        // Reset Form
        setNewTitle('');
        setNewImageUrl('');
        setAdditionalImages(['', '', '', '', '']);
        setNewYoutubeVideoUrl('');
        setNewRetailPrice('');
        setNewGroupPrice('');
        setNewFullBundlePrice('');
        setNewDescription('');
        // Reset selected colors to all db colors
        setSelectedColors(colors);

        setTimeout(() => {
          setPostSuccess(false);
          setActiveTab('bundles');
        }, 1500);
      } else {
        setPostError('বান্ডিল সংরক্ষণ করতে সমস্যা হয়েছে। ডাটাবেজ কানেকশন চেক করুন।');
      }
    } catch (err: any) {
      setPostError(err?.message || 'বান্ডিল পোস্ট করার সময় ত্রুটি ঘটেছে।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/95 backdrop-blur-md flex flex-col w-screen h-[100dvh] overflow-hidden animate-in fade-in duration-200">
      <div className="bg-stone-100 w-full h-full flex flex-col overflow-hidden">
        {/* Fullscreen Clean Admin Header with Back Button */}
        <div className="bg-stone-900 text-white border-b border-stone-800 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {selectedBundleId ? (
                <button
                  type="button"
                  onClick={() => setSelectedBundleId(null)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-emerald-400 hover:text-white border border-stone-700 hover:border-emerald-500 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs shadow-xs"
                  title="বান্ডিল তালিকায় ফিরে যান"
                >
                  <ChevronLeft className="w-4 h-4 text-emerald-400" />
                  <span>← ফিরে যান</span>
                </button>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                    {selectedBundleId ? 'বান্ডিল বিস্তারিত' : 'অ্যাডমিন প্যানেল'}
                  </h2>
                  {isSupabaseConfigured() ? (
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      লাইভ
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      লোকাল
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Corner Close Button */}
            <button
              onClick={onClose}
              className="p-2 sm:px-3 sm:py-1.5 bg-stone-800 hover:bg-rose-700 text-stone-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs border border-stone-700 hover:border-rose-600"
              title="অ্যাডমিন প্যানেল বন্ধ করুন"
            >
              <span className="hidden sm:inline">বন্ধ করুন</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PIN / Password Auth Screen */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-stone-100">
            <div className="p-8 sm:p-10 text-center max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-200 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">অ্যাডমিন পাসওয়ার্ড দিন</h3>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  ডিফল্ট পাসওয়ার্ড: <strong className="text-emerald-700 font-mono">admin123</strong> অথবা আপনার সেট করা পাসওয়ার্ড।
                </p>
              </div>
              <form onSubmit={handlePinSubmit} className="space-y-3.5">
                <input
                  type="password"
                  placeholder="পাসওয়ার্ড লিখুন..."
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-mono py-3 border border-stone-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  autoFocus
                />
                {pinError && <p className="text-xs text-rose-600 font-bold">{pinError}</p>}
                <button
                  type="submit"
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all cursor-pointer shadow-md"
                >
                  লগইন করুন
                </button>
                <div className="text-xs text-stone-500 pt-1">
                  💡 পাসওয়ার্ড: <code className="bg-stone-100 px-2 py-0.5 rounded font-mono font-bold text-stone-800">admin123</code>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* Nav Tabs & Actions Bar */}
            <div className="border-b border-stone-200 bg-white shrink-0 shadow-xs">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('bundles')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'bundles'
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>চলতি বান্ডিল ও ব্যাচসমূহ ({bundles.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('new-bundle')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'new-bundle'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>নতুন বান্ডিল পোস্ট</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'categories'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>ক্যাটাগরি ম্যানেজমেন্ট ({categories.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('colors')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'colors'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    <span>কালার ম্যানেজমেন্ট ({colors.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthenticated(false);
                      localStorage.removeItem('admin_authenticated');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>লগআউট</span>
                  </button>

                  <button
                    onClick={refreshAdminData}
                    className="p-2 bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 rounded-xl text-xs cursor-pointer ml-auto sm:ml-1 transition-colors"
                    title="ডাটা রিফ্রেশ করুন"
                  >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Search (when in Orders tab) */}
                {activeTab === 'orders' && (
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ফোন, নাম বা অর্ডার নম্বর..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tab Contents - Fullscreen Container with mobile safe area bottom padding */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-36 sm:pb-24 bg-stone-100/70">
              <div className="max-w-7xl mx-auto w-full space-y-6">
              {/* TAB SUPABASE SETTINGS */}
              {activeTab === 'supabase-settings' && (
                <div className="max-w-xl mx-auto bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>GitHub Pages বা Static Hosting এর জন্য Supabase কানেকশন</span>
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    যেহেতু আপনি GitHub Pages এ হোস্ট করেছেন, সেখানে এনভায়রনমেন্ট ভেরিয়েবল (.env) সরাসরি কাজ করে না। তাই আপনার সুপাবেস প্রজেক্টের **Project URL** এবং **anon public API Key** নিচে দিয়ে সেভ করুন। এতে সাথে সাথেই ডাটাবেজের সমস্ত পণ্য ও বান্ডিল GitHub Pages এ শো করবে!
                  </p>
                  <form onSubmit={handleSaveSupabaseSettings} className="space-y-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Supabase Project URL</label>
                      <input
                        type="text"
                        placeholder="https://xxxxxx.supabase.co"
                        value={supabaseUrlInput}
                        onChange={(e) => setSupabaseUrlInput(e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Supabase Anon Public Key</label>
                      <input
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                        value={supabaseKeyInput}
                        onChange={(e) => setSupabaseKeyInput(e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    {supabaseSaveMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold text-center">
                        {supabaseSaveMsg}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow-md transition-all"
                    >
                      কানেকশন সেভ করুন ও রিলোড দিন
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 1: POST NEW BUNDLE */}
              {activeTab === 'new-bundle' && (
                <div className="max-w-2xl mx-auto bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 mb-12 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-200">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">নতুন হোলসেল বান্ডিল পোস্ট করুন</h3>
                      <p className="text-xs text-stone-500">
                        নতুন পণ্য ও সাইজ স্লট পোস্ট করুন। পোস্ট করার সাথে সাথে ব্যাচ #১ স্বয়ংক্রিয়ভাবে চালু হবে।
                      </p>
                    </div>
                  </div>

                  {postSuccess && (
                    <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>বান্ডিলটি সফলভাবে পোস্ট হয়েছে এবং শপে লাইভ যুক্ত হয়েছে!</span>
                    </div>
                  )}

                  {postError && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{postError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePostBundle} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        পণ্যের নাম *
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: জেনুইন লেদার অক্সফোর্ড শু"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Category & Total Bundle Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-stone-700">
                            ক্যাটাগরি *
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowInlineCatAdd(!showInlineCatAdd)}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>{showInlineCatAdd ? 'বাতিল' : '+ নতুন ক্যাটাগরি'}</span>
                          </button>
                        </div>

                        {showInlineCatAdd && (
                          <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 animate-in fade-in">
                            <input
                              type="text"
                              placeholder="ক্যাটাগরির নাম (যেমন: ঘড়ি, ব্যাগ)..."
                              value={inlineCategoryInput}
                              onChange={(e) => setInlineCategoryInput(e.target.value)}
                              className="flex-1 px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const res = addCategory(inlineCategoryInput);
                                if (res.success) {
                                  setNewCategory(inlineCategoryInput.trim());
                                  setInlineCategoryInput('');
                                  setShowInlineCatAdd(false);
                                } else {
                                  alert(res.message);
                                }
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                            >
                              যোগ করুন
                            </button>
                          </div>
                        )}

                        <select
                          value={newCategory}
                          onChange={(e) => {
                            const cat = e.target.value;
                            setNewCategory(cat);
                            if (cat === 'কাপড়') {
                              setSizeConfigs([
                                { id: '1', size: 'M', qty: 1 },
                                { id: '2', size: 'L', qty: 1 },
                                { id: '3', size: 'XL', qty: 1 },
                                { id: '4', size: 'XXL', qty: 1 },
                              ]);
                            } else if (cat === 'জুতা') {
                              setSizeConfigs([
                                { id: '1', size: '39', qty: 1 },
                                { id: '2', size: '40', qty: 1 },
                                { id: '3', size: '41', qty: 1 },
                                { id: '4', size: '42', qty: 1 },
                                { id: '5', size: '43', qty: 1 },
                                { id: '6', size: '44', qty: 1 },
                              ]);
                            }
                          }}
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-stone-900"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          মোট বান্ডিল সাইজ (স্বয়ংক্রিয় গণনা)
                        </label>
                        <div className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 flex items-center justify-between">
                          <span className="text-emerald-700 font-extrabold text-sm">{calculatedTotalPcs} পিস</span>
                          <span className="text-[11px] text-stone-500 font-normal">নিচের সাইজ ও পিস থেকে মোট স্লট তৈরি হবে</span>
                        </div>
                      </div>
                    </div>

                    {/* Image URL with Presets */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-stone-700">
                          প্রধান ছবির লিংক (Main Image URL - হোম পেজের জন্য) *
                        </label>
                        <span className="text-[11px] text-stone-400">অনলাইন ছবির সরাসরি লিংক দিন</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                        required
                      />

                      {/* Quick preset selector */}
                      <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-stone-500 font-semibold">কুইক স্যাম্পল ছবি:</span>
                        {imagePresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setNewImageUrl(preset.url);
                              setNewTitle(preset.label);
                              setNewCategory(preset.category);
                              setSizeConfigs(preset.sizes);
                            }}
                            className="px-2 py-0.5 bg-white border border-stone-200 hover:border-emerald-400 rounded text-[10px] text-stone-600 transition-colors cursor-pointer"
                          >
                            + {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* Image Preview */}
                      {newImageUrl && (
                        <div className="mt-2 flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200">
                          <img
                            src={newImageUrl}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100';
                            }}
                          />
                          <span className="text-[11px] text-emerald-700 font-semibold">প্রধান ছবি প্রিভিউ সফল</span>
                        </div>
                      )}
                    </div>

                    {/* 5 Additional Image Links (Sequential vertical scroll) */}
                    <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-emerald-600" />
                          <span>অতিরিক্ত ৫টি ছবি লিংক (Optional - বান্ডিল ডিটেইলসে স্ক্রল করে দেখা যাবে)</span>
                        </label>
                      </div>
                      <div className="space-y-2">
                        {additionalImages.map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-stone-500 w-16">ছবি #{imgIdx + 1}:</span>
                            <input
                              type="url"
                              placeholder={`অতিরিক্ত ছবি ${imgIdx + 1} এর লিংক...`}
                              value={imgUrl}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAdditionalImages((prev) => {
                                  const updated = [...prev];
                                  updated[imgIdx] = val;
                                  return updated;
                                });
                              }}
                              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* YouTube Sample Video Link */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-stone-700">
                          স্যাম্পল ইউটিউব ভিডিও লিংক (YouTube Video URL - Optional)
                        </label>
                        <span className="text-[11px] text-stone-400">কাস্টমার ভিডিওতে ক্লিক করলে ইউটিউবে ওপেন হবে</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={newYoutubeVideoUrl}
                        onChange={(e) => setNewYoutubeVideoUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                    </div>

                    {/* Pricing Grid - Clean (Wholesale cost removed as requested) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          খুচরা বাজার মূল্য *
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">৳</span>
                          <input
                            type="number"
                            placeholder="2200"
                            value={newRetailPrice}
                            onChange={(e) => setNewRetailPrice(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full pl-6 pr-2 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                          গ্রুপ বাই মূল্য/পিস *
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 text-xs">৳</span>
                          <input
                            type="number"
                            placeholder="890"
                            value={newGroupPrice}
                            onChange={(e) => setNewGroupPrice(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full pl-6 pr-2 py-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-900"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          পুরো বান্ডিল কিনলে রেট
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">৳</span>
                          <input
                            type="number"
                            placeholder="750"
                            value={newFullBundlePrice}
                            onChange={(e) => setNewFullBundlePrice(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full pl-6 pr-2 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Size & Quantity Breakdown Builder (Supports multiple pcs of the same size) */}
                    <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-stone-200">
                        <div>
                          <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-emerald-600" />
                            <span>সাইজ ও পিস সংখ্যা কনফিগারেশন *</span>
                          </label>
                          <p className="text-[11px] text-stone-500">
                            একই সাইজের ১টির বেশি পিস থাকলে সরাসরি পিস সংখ্যা বাড়িয়ে দিন (যেমন: সাইজ ৪০ = ২ পিস)।
                          </p>
                        </div>
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto shrink-0">
                          মোট: {calculatedTotalPcs} পিস / স্লট
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {sizeConfigs.map((sc, index) => (
                          <div
                            key={sc.id}
                            className="p-2 bg-white border border-stone-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="flex-1 min-w-0">
                              <label className="block text-[10px] text-stone-400 font-semibold mb-0.5">
                                সাইজ
                              </label>
                              <input
                                type="text"
                                placeholder="সাইজ..."
                                value={sc.size}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSizeConfigs((prev) =>
                                    prev.map((item) => (item.id === sc.id ? { ...item, size: val } : item))
                                  );
                                }}
                                className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-900 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                required
                              />
                            </div>

                            <div className="w-24 shrink-0">
                              <label className="block text-[10px] text-stone-400 font-semibold mb-0.5 text-center">
                                পিস (Qty)
                              </label>
                              <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const curr = Number(sc.qty) || 1;
                                    if (curr > 1) {
                                      setSizeConfigs((prev) =>
                                        prev.map((item) =>
                                          item.id === sc.id ? { ...item, qty: curr - 1 } : item
                                        )
                                      );
                                    }
                                  }}
                                  className="px-2 py-1 text-xs font-bold text-stone-600 hover:bg-stone-200 cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={sc.qty}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? '' : Math.max(1, Number(e.target.value));
                                    setSizeConfigs((prev) =>
                                      prev.map((item) => (item.id === sc.id ? { ...item, qty: val } : item))
                                    );
                                  }}
                                  className="w-full text-center text-xs font-bold bg-transparent focus:outline-none py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const curr = Number(sc.qty) || 0;
                                    setSizeConfigs((prev) =>
                                      prev.map((item) =>
                                        item.id === sc.id ? { ...item, qty: curr + 1 } : item
                                      )
                                    );
                                  }}
                                  className="px-2 py-1 text-xs font-bold text-stone-600 hover:bg-stone-200 cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {sizeConfigs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSizeConfigs((prev) => prev.filter((item) => item.id !== sc.id));
                                }}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mt-3"
                                title="সাইজ মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const newId = String(Date.now());
                          setSizeConfigs((prev) => [...prev, { id: newId, size: '', qty: 1 }]);
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ আরও সাইজ যোগ করুন</span>
                      </button>
                    </div>

                     {/* Available Colors Option */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-2">
                          উপলব্ধ কালারসমূহ (Available Colors) *
                        </label>
                        <div className="flex flex-wrap gap-1.5 p-3 bg-white border border-stone-200 rounded-2xl min-h-[90px] max-h-[160px] overflow-y-auto">
                          {colors.map((col) => {
                            const isSelected = selectedColors.includes(col);
                            return (
                              <button
                                key={col}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedColors(prev => prev.filter(c => c !== col));
                                  } else {
                                    setSelectedColors(prev => [...prev, col]);
                                  }
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                  isSelected
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                                }`}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{
                                    backgroundColor:
                                      col === 'সাদা' ? '#ffffff' :
                                      col === 'কালো' ? '#000000' :
                                      col === 'লাল' ? '#ef4444' :
                                      col === 'নীল' ? '#3b82f6' :
                                      col === 'হলুদ' ? '#eab308' :
                                      col === 'সবুজ' ? '#22c55e' :
                                      col === 'গ্রে' ? '#6b7280' :
                                      col === 'ব্রাউন' ? '#854d0e' :
                                      undefined,
                                    border: '1px solid #d1d5db'
                                  }}
                                />
                                <span>{col}</span>
                              </button>
                            );
                          })}
                          {colors.length === 0 && (
                            <p className="text-[11px] text-stone-400 font-semibold italic">কোনো কালার পাওয়া যায়নি। অনুগ্রহ করে কালার ম্যানেজমেন্টে যুক্ত করুন।</p>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">
                          কালারগুলোতে ক্লিক করে সিলেক্ট/ডিসেলেক্ট করুন। কাস্টমাররা শুধু এই নির্বাচিত কালারগুলো থেকে বেছে নিতে পারবেন।
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-emerald-800 mb-2">
                          ১ম ব্যাচের কালার (Default Bundle Color) *
                        </label>
                        <select
                          value={newBundleColor}
                          onChange={(e) => setNewBundleColor(e.target.value)}
                          className="w-full px-3 py-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-900 cursor-pointer"
                        >
                          {selectedColors.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                          {selectedColors.length === 0 && (
                            <option value="">কোনো কালার সিলেক্ট করা হয়নি</option>
                          )}
                        </select>
                        <p className="text-[10px] text-stone-400 mt-1.5">
                          ১ম ব্যাচটির সব কয়টি পণ্য সম্পূর্ণ এই কালারের হবে। (শুধু বাম পাশে নির্বাচিত কালারগুলো এখানে অপশন হিসেবে দেখাবে)
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        পণ্যের বিস্তারিত বিবরণ (Description - কাস্টমার সাইটে শো করবে) *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="পণ্যের উপাদান, ফিনিশিং, সাইজ গাইড বা বিস্তারিত বিবরণ লিখুন..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 pb-4">
                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-5 h-5 shrink-0" />
                        <span>নতুন বান্ডিল পোস্ট করুন (শপে লাইভ যুক্ত হবে)</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB: CATEGORY MANAGEMENT */}
              {activeTab === 'categories' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Add New Category Card */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-stone-200">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <FolderPlus className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">ম্যানুয়ালি নতুন ক্যাটাগরি তৈরি করুন</h3>
                        <p className="text-xs text-stone-500">
                          শপের পণ্য ও বান্ডিল সাজাতে যেকোনো নতুন ক্যাটাগরি যুক্ত করুন (যেমন: ঘড়ি, ব্যাগ, কসমেটিকস, পাঞ্জাবি ইত্যাদি)।
                        </p>
                      </div>
                    </div>

                    {categoryMsg && (
                      <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                        categoryMsg.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {categoryMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        <span>{categoryMsg.text}</span>
                      </div>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!categoryInput.trim()) return;
                        const res = addCategory(categoryInput);
                        setCategoryMsg({ text: res.message, isError: !res.success });
                        if (res.success) {
                          setCategoryInput('');
                          setTimeout(() => setCategoryMsg(null), 3500);
                        }
                      }}
                      className="flex flex-col sm:flex-row gap-2.5"
                    >
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="নতুন ক্যাটাগরির নাম লিখুন (যেমন: ঘড়ি, ব্যাগ, ইলেকট্রনিক্স, কসমেটিকস)..."
                          value={categoryInput}
                          onChange={(e) => setCategoryInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-stone-900"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shrink-0"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>ক্যাটাগরি যুক্ত করুন</span>
                      </button>
                    </form>
                  </div>

                  {/* Existing Categories List */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">বর্তমান সক্রিয় ক্যাটাগরিসমূহ ({categories.length})</h3>
                        <p className="text-xs text-stone-500">গ্রাহকরা হোমপেজে এই ক্যাটাগরিগুলো দিয়ে ফিল্টার করতে পারবেন।</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categories.map((cat) => {
                        const productCount = products.filter(p => p.category === cat).length;
                        return (
                          <div
                            key={cat}
                            className="p-3.5 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                                <Folder className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-stone-900 truncate">{cat}</p>
                                <p className="text-[11px] text-stone-500 font-medium">
                                  {productCount} টি পণ্য
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const res = deleteCategory(cat);
                                setCategoryMsg({ text: res.message, isError: !res.success });
                                setTimeout(() => setCategoryMsg(null), 3500);
                              }}
                              className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="ক্যাটাগরি মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: COLOR MANAGEMENT */}
              {activeTab === 'colors' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Add New Color Card */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-stone-200">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Palette className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">ম্যানুয়ালি নতুন কালার তৈরি করুন</h3>
                        <p className="text-xs text-stone-500">
                          বান্ডিল ও পণ্য সাজাতে নতুন কালার যুক্ত করুন (যেমন: কালো, সাদা, লাল, ব্রাউন, অফ-হোয়াইট ইত্যাদি)।
                        </p>
                      </div>
                    </div>

                    {colorMsg && (
                      <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                        colorMsg.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {colorMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        <span>{colorMsg.text}</span>
                      </div>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!colorInput.trim()) return;
                        const res = addColor(colorInput);
                        setColorMsg({ text: res.message, isError: !res.success });
                        if (res.success) {
                          setColorInput('');
                          setTimeout(() => setColorMsg(null), 3500);
                        }
                      }}
                      className="flex flex-col sm:flex-row gap-2.5"
                    >
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="নতুন কালারের নাম লিখুন (যেমন: গোল্ডেন, অলিভ, মেজেন্টা, অফ-হোয়াইট)..."
                          value={colorInput}
                          onChange={(e) => setColorInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-stone-900"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shrink-0"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>কালার যুক্ত করুন</span>
                      </button>
                    </form>
                  </div>

                  {/* Existing Colors List */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">বর্তমান সক্রিয় কালারসমূহ ({colors.length})</h3>
                        <p className="text-xs text-stone-500">প্রোডাক্ট ও ব্যাচ তৈরির সময় এই কালারগুলো অপশন হিসেবে দেখাবে।</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {colors.map((col) => {
                        return (
                          <div
                            key={col}
                            className="p-3 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-3 h-3 rounded-full bg-stone-400 shrink-0" style={{ backgroundColor: col === 'সাদা' ? '#ffffff' : col === 'কালো' ? '#000000' : col === 'লাল' ? '#ef4444' : col === 'নীল' ? '#3b82f6' : col === 'হলুদ' ? '#eab308' : col === 'সবুজ' ? '#22c55e' : col === 'গ্রে' ? '#8b5cf6' : undefined, border: '1px solid #d1d5db' }}></span>
                              <p className="text-xs font-bold text-stone-900 truncate">{col}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const res = deleteColor(col);
                                setColorMsg({ text: res.message, isError: !res.success });
                                setTimeout(() => setColorMsg(null), 3500);
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="কালার মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ALL ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-stone-500 text-xs">
                      <Package className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                      <p>কোনো অর্ডার পাওয়া যায়নি।</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-stone-200 rounded-xl bg-white shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                          <tr>
                            <th className="p-2.5">অর্ডার আইডি</th>
                            <th className="p-2.5">গ্রাহকের নাম ও ফোন</th>
                            <th className="p-2.5">পণ্য, সাইজ ও কালার</th>
                            <th className="p-2.5">মূল্য ও অগ্রিম</th>
                            <th className="p-2.5">ঠিকানা</th>
                            <th className="p-2.5">স্ট্যাটাস</th>
                            <th className="p-2.5 text-right">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {filteredOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="p-2.5 font-mono font-bold text-stone-800 whitespace-nowrap">
                                <div>#{ord.id}</div>
                                {ord.isSingleBuy || ord.orderType === 'single_buy' || ord.bundleId === 'single-buy' ? (
                                  <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] bg-blue-100 text-blue-800 rounded font-bold border border-blue-200">
                                    একক ক্রয় (Single)
                                  </span>
                                ) : ord.isFullBundle || ord.orderType === 'full_bundle' ? (
                                  <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] bg-amber-100 text-amber-900 rounded font-bold border border-amber-200">
                                    সম্পূর্ণ বান্ডিল
                                  </span>
                                ) : (
                                  <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] bg-emerald-100 text-emerald-800 rounded font-bold border border-emerald-200">
                                    গ্রুপ বাই স্লট
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5">
                                <div className="font-bold text-stone-900">{ord.customerName || 'কাস্টমার'}</div>
                                <div className="text-stone-500 font-mono text-[11px]">{ord.customerPhone || ord.contactPhone}</div>
                              </td>
                              <td className="p-2.5">
                                <div className="font-medium text-stone-900 truncate max-w-[150px]">{ord.productTitle}</div>
                                <div className="text-stone-600 text-[11px] flex flex-wrap gap-1 mt-0.5">
                                  <span className="bg-stone-100 font-bold px-1.5 py-0.2 rounded border border-stone-200">সাইজ: {ord.size}</span>
                                  {ord.color && <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-200">কালার: {ord.color}</span>}
                                  {!ord.isSingleBuy && <span className="text-stone-500 font-medium">ব্যাচ #{ord.batchNumber}</span>}
                                </div>
                              </td>
                              <td className="p-2.5 whitespace-nowrap">
                                <div className="font-bold text-emerald-800">৳{ord.groupPrice}</div>
                                <div className="text-[11px] text-stone-500">
                                  অগ্রিম: ৳{ord.advanceAmount} | বাকি: ৳{ord.dueAmount}
                                </div>
                              </td>
                              <td className="p-2.5 text-stone-600 max-w-[180px] truncate" title={ord.deliveryAddress}>
                                {ord.deliveryAddress || 'ঠিকানা নেই'}
                              </td>
                              <td className="p-2.5 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ord.status === 'delivered'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : ord.status === 'in_transit'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {ord.status === 'in_transit' ? 'ডেলিভারিতে আছে' : ord.status === 'delivered' ? 'সম্পন্ন' : 'বুকড / কনফার্মড'}
                                </span>
                              </td>
                              <td className="p-2.5 text-right whitespace-nowrap">
                                <button
                                  onClick={async () => {
                                    if (confirm(`আপনি কি "${ord.customerName || 'গ্রাহক'}" এর অর্ডারটি (আইডি: #${ord.id}) বাতিল করতে চান?`)) {
                                      const res = await cancelOrder(ord.id);
                                      if (res.success) {
                                        setCopiedNotification(res.message);
                                        refreshAdminData();
                                        setTimeout(() => setCopiedNotification(null), 2500);
                                      }
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  title="অর্ডার বাতিল ও কাস্টমার রিমুভ করুন"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>বাতিল</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BUNDLES / BATCHES MANAGEMENT */}
              {activeTab === 'bundles' && (
                <div className="space-y-4">
                  {/* Toast Notification */}
                  {copiedNotification && (
                    <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-bottom-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{copiedNotification}</span>
                    </div>
                  )}

                  {/* SUB-VIEW 1: SELECTED BUNDLE DETAILS & CUSTOMER LIST */}
                  {selectedBundleId ? (
                    (() => {
                      const selectedBundle = bundles.find((b) => b.id === selectedBundleId);
                      const product = selectedBundle ? products.find((p) => p.id === selectedBundle.productId) : null;
                      
                      if (!selectedBundle || !product) {
                        return (
                          <div className="text-center py-10">
                            <p className="text-xs text-stone-500">বান্ডিলটি পাওয়া যায়নি।</p>
                            <button
                              onClick={() => setSelectedBundleId(null)}
                              className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
                            >
                              ← ফিরে যান
                            </button>
                          </div>
                        );
                      }

                      const isFull = selectedBundle.filledSlots >= selectedBundle.totalSlots || selectedBundle.status === 'completed' || selectedBundle.status === 'ordered';
                      const bundleOrders = allOrders.filter((o) => o.bundleId === selectedBundle.id);
                      
                      const totalAdvanceCollected = bundleOrders.reduce((sum, o) => sum + (o.advanceAmount || 0), 0);
                      const totalDueRemaining = bundleOrders.reduce((sum, o) => sum + (o.dueAmount || 0), 0);
                      const totalBatchValue = selectedBundle.filledSlots * product.groupPrice;

                      // Format all addresses for courier dispatch
                      const handleCopyAllAddresses = () => {
                        if (bundleOrders.length === 0) {
                          alert('এই বান্ডিলে এখনও কোনো কাস্টমার অর্ডার নেই।');
                          return;
                        }
                        const text = bundleOrders
                          .map(
                            (o, i) =>
                              `${i + 1}. নাম: ${o.customerName || 'কাস্টমার'}\nমোবাইল: ${o.customerPhone || o.contactPhone}\nঠিকানা: ${o.deliveryAddress}\nসাইজ: ${o.size} | বাকি টাকা (COD): ৳${o.dueAmount}\n`
                          )
                          .join('\n------------------------\n');
                        navigator.clipboard.writeText(text);
                        setCopiedNotification('কুরিয়ার পার্সেলের জন্য সকল ঠিকানা কপি হয়েছে!');
                        setTimeout(() => setCopiedNotification(null), 3000);
                      };

                      return (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          {/* Back Button & Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200">
                            <button
                              onClick={() => setSelectedBundleId(null)}
                              className="flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>বান্ডিল তালিকায় ফিরে যান</span>
                            </button>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-500 font-mono">আইডি: #{selectedBundle.id}</span>
                              <button
                                onClick={handleCopyAllAddresses}
                                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                                <span>সকল ঠিকানা কপি করুন (কুরিয়ার)</span>
                              </button>
                            </div>
                          </div>

                          {/* Bundle Banner Card */}
                          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-20 h-20 object-cover rounded-xl border border-stone-200 shrink-0 shadow-xs"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-xs font-black bg-stone-900 text-white px-2.5 py-0.5 rounded-md">
                                  ব্যাচ #{selectedBundle.batchNumber}
                                </span>
                                <span className="text-[11px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-medium">
                                  {product.category}
                                </span>
                                {isFull ? (
                                  <span className="text-[11px] bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>স্লট পূরণ হয়েছে (Slot Completed)</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-0.5 rounded-full">
                                    চলমান বুকিং ({selectedBundle.totalSlots - selectedBundle.filledSlots}টি স্লট বাকি)
                                  </span>
                                )}
                              </div>
                              <h3 className="text-sm font-bold text-stone-900">{product.title}</h3>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600 mt-1">
                                <span>গ্রুপ রেট: <strong className="text-emerald-700 font-bold">৳{product.groupPrice}</strong></span>
                                <span>হোলসেল রেট: <strong className="text-stone-800">৳{product.wholesalePrice}</strong></span>
                                <span>খুচরা বাজার মূল্য: <span className="line-through text-stone-400">৳{product.retailPrice}</span></span>
                                <span>বান্ডিল সাইজ: <strong>{product.bundleSize} পিস</strong></span>
                              </div>
                            </div>

                            {/* Batch Status Dropdown */}
                            <div className="sm:border-l sm:border-stone-200 sm:pl-4 w-full sm:w-auto shrink-0 flex items-end gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase tracking-wider">
                                  ব্যাচ স্ট্যাটাস পরিবর্তন
                                </label>
                                <select
                                  value={selectedBundle.status}
                                  onChange={(e) => updateBatchStatus(selectedBundle.id, e.target.value as any)}
                                  className="w-full sm:w-auto text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                                >
                                  <option value="open">বুকিং চলমান (Open)</option>
                                  <option value="completed">স্লট পূরণ হয়েছে (Completed)</option>
                                  <option value="ordered">হোলসেলারকে অর্ডার প্লেসড (Ordered)</option>
                                  <option value="shipped">কুরিয়ারে ডেলিভারি সম্পন্ন (Shipped)</option>
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`আপনি কি আসলেই "${product.title}" এর "ব্যাচ #${selectedBundle.batchNumber}" সম্পূর্ণ মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না!`)) {
                                    const res = await deleteBundle(selectedBundle.id);
                                    setSelectedBundleId(null);
                                    setCopiedNotification(res.message);
                                    setTimeout(() => setCopiedNotification(null), 3000);
                                  }
                                }}
                                className="px-2.5 py-2.5 sm:py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors h-[34px]"
                                title="এই ব্যাচটি ডিলিট করুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">এই ব্যাচটি ডিলিট করুন</span>
                                <span className="sm:hidden">ডিলিট ব্যাচ</span>
                              </button>
                            </div>
                          </div>

                          {/* Sibling Batches Tab Selection List */}
                          {(() => {
                            const siblingBundles = bundles.filter((b) => b.productId === product.id);
                            if (siblingBundles.length <= 1) return null;
                            return (
                              <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                                <div className="shrink-0">
                                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                                    <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full inline-block"></span>
                                    <span>এই বান্ডিলের অন্য সক্রিয় ব্যাচসমূহ (Batch List):</span>
                                  </span>
                                  <p className="text-[10px] text-stone-500 font-medium mt-0.5">ব্যাচে ক্লিক করে অন্য ব্যাচের কাস্টমার লিস্ট ও বুকিং দেখতে পারেন</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {siblingBundles.map((sib) => {
                                    const isCurrent = sib.id === selectedBundle.id;
                                    const sibIsFull = sib.filledSlots >= sib.totalSlots || sib.status === 'completed' || sib.status === 'ordered';
                                    return (
                                      <button
                                        key={sib.id}
                                        type="button"
                                        onClick={() => setSelectedBundleId(sib.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                          isCurrent
                                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                                            : sibIsFull
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                            : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                                        }`}
                                      >
                                        <span>ব্যাচ #{sib.batchNumber}</span>
                                        <span className="text-[10px] opacity-80">({sib.filledSlots}/{sib.totalSlots} স্লট বুকড)</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Financial & Progress Statistics Bar */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                              <div className="text-[11px] text-stone-500 font-medium">স্লট পূরণ প্রগ্রেস</div>
                              <div className="text-sm font-black text-stone-900 mt-0.5 flex items-center gap-1.5">
                                <span>{selectedBundle.filledSlots} / {selectedBundle.totalSlots} স্লট</span>
                                <span className="text-xs font-normal text-emerald-700">
                                  ({Math.round((selectedBundle.filledSlots / selectedBundle.totalSlots) * 100)}%)
                                </span>
                              </div>
                              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                                <div
                                  className="bg-emerald-600 h-full rounded-full transition-all"
                                  style={{
                                    width: `${(selectedBundle.filledSlots / selectedBundle.totalSlots) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                              <div className="text-[11px] text-emerald-800 font-medium">মোট সংগৃহীত অগ্রিম</div>
                              <div className="text-sm font-black text-emerald-800 mt-0.5">৳{totalAdvanceCollected}</div>
                              <div className="text-[10px] text-emerald-600 mt-1">{bundleOrders.length}টি টোকেন পেমেন্ট</div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                              <div className="text-[11px] text-amber-800 font-medium">কুরিয়ারে আদায়যোগ্য বাকি (COD)</div>
                              <div className="text-sm font-black text-amber-900 mt-0.5">৳{totalDueRemaining}</div>
                              <div className="text-[10px] text-amber-700 mt-1">ডেলিভারির সময় কাস্টমার দেবে</div>
                            </div>

                            <div className="bg-stone-900 text-white rounded-xl p-3">
                              <div className="text-[11px] text-stone-400 font-medium">মোট ব্যাচ সেলস মূল্য</div>
                              <div className="text-sm font-black text-emerald-400 mt-0.5">৳{totalBatchValue}</div>
                              <div className="text-[10px] text-stone-400 mt-1">হোলসেল রেট: ৳{product.wholesalePrice * selectedBundle.filledSlots}</div>
                            </div>
                          </div>

                          {/* Customer List & Details Table */}
                          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                            <div className="p-3.5 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-700" />
                                <h4 className="text-xs font-bold text-stone-900">
                                  বুক করা গ্রাহকদের বিস্তারিত তালিকা ({bundleOrders.length} জন):
                                </h4>
                              </div>
                              <span className="text-[11px] text-stone-500">
                                ট্রানজেকশন আইডি ও ডেলিভারি তথ্য
                              </span>
                            </div>

                            {bundleOrders.length === 0 ? (
                              <div className="p-8 text-center text-stone-500 text-xs">
                                <AlertCircle className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                                <p>এই ব্যাচে এখনও কোনো কাস্টমার স্লট বুক করেনি।</p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-stone-50 text-stone-700 font-semibold border-b border-stone-200">
                                    <tr>
                                      <th className="p-3">#</th>
                                      <th className="p-3">গ্রাহকের নাম ও ফোন</th>
                                      <th className="p-3">সাইজ ও স্লট আইডি</th>
                                      <th className="p-3">পেমেন্ট মাধ্যম ও TrxID</th>
                                      <th className="p-3">অগ্রিম ও বাকি টাকা</th>
                                      <th className="p-3">ডেলিভারি ঠিকানা ও জেলা</th>
                                      <th className="p-3">বুকিং সময়</th>
                                      <th className="p-3 text-right">অ্যাকশন</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-stone-200">
                                    {bundleOrders.map((ord, idx) => (
                                      <tr key={ord.id} className="hover:bg-stone-50/90 transition-colors">
                                        <td className="p-3 font-bold text-stone-400">{idx + 1}</td>
                                        <td className="p-3">
                                          <div className="font-bold text-stone-900">{ord.customerName || 'কাস্টমার'}</div>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <a
                                              href={`tel:${ord.customerPhone || ord.contactPhone}`}
                                              className="text-emerald-700 hover:text-emerald-800 font-mono font-bold text-[11px] flex items-center gap-1 hover:underline"
                                            >
                                              <Phone className="w-3 h-3" />
                                              <span>{ord.customerPhone || ord.contactPhone}</span>
                                            </a>
                                            <button
                                              onClick={() => {
                                                navigator.clipboard.writeText(ord.customerPhone || ord.contactPhone || '');
                                                setCopiedNotification(`নম্বর কপি হয়েছে: ${ord.customerPhone || ord.contactPhone}`);
                                                setTimeout(() => setCopiedNotification(null), 2500);
                                              }}
                                              className="text-stone-400 hover:text-stone-600 p-0.5"
                                              title="নম্বর কপি করুন"
                                            >
                                              <Copy className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </td>
                                        <td className="p-3">
                                          <span className="bg-stone-900 text-white font-bold px-2 py-0.5 rounded text-[11px]">
                                            সাইজ: {ord.size}
                                          </span>
                                          <div className="text-[10px] text-stone-500 font-mono mt-1">
                                            আইডি: {ord.slotId || ord.id}
                                          </div>
                                        </td>
                                        <td className="p-3">
                                          <div className="flex items-center gap-1 font-bold text-stone-800">
                                            <CreditCard className="w-3 h-3 text-emerald-600" />
                                            <span>{ord.paymentMethod || 'bKash'}</span>
                                          </div>
                                          {ord.transactionId ? (
                                            <div className="mt-1 inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                                              <span>TrxID: {ord.transactionId}</span>
                                              <button
                                                onClick={() => {
                                                  navigator.clipboard.writeText(ord.transactionId || '');
                                                  setCopiedNotification(`TrxID কপি হয়েছে: ${ord.transactionId}`);
                                                  setTimeout(() => setCopiedNotification(null), 2500);
                                                }}
                                                className="text-emerald-600 hover:text-emerald-900"
                                                title="TrxID কপি করুন"
                                              >
                                                <Copy className="w-2.5 h-2.5" />
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="text-[10px] text-stone-400 mt-0.5">টোকেন সিওডি / ভেরিফাইড</div>
                                          )}
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                          <div className="font-bold text-emerald-800">অগ্রিম: ৳{ord.advanceAmount}</div>
                                          <div className="text-[11px] font-semibold text-rose-700 mt-0.5">বাকি (COD): ৳{ord.dueAmount}</div>
                                        </td>
                                        <td className="p-3 max-w-[200px]">
                                          <div className="text-stone-800 font-medium line-clamp-2" title={ord.deliveryAddress}>
                                            {ord.deliveryAddress || 'ঠিকানা দেওয়া হয়নি'}
                                          </div>
                                          <button
                                            onClick={() => {
                                              navigator.clipboard.writeText(
                                                `${ord.customerName} - ${ord.customerPhone} - ${ord.deliveryAddress}`
                                              );
                                              setCopiedNotification('ঠিকানা কপি হয়েছে!');
                                              setTimeout(() => setCopiedNotification(null), 2500);
                                            }}
                                            className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 mt-1 font-semibold"
                                          >
                                            <Copy className="w-2.5 h-2.5" />
                                            <span>ঠিকানা কপি</span>
                                          </button>
                                        </td>
                                        <td className="p-3 text-[11px] text-stone-500 whitespace-nowrap">
                                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('bn-BD', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          }) : 'সম্প্রতি'}
                                        </td>
                                        <td className="p-3 text-right whitespace-nowrap">
                                          <button
                                            onClick={() => {
                                              if (confirm(`আপনি কি কাস্টমার "${ord.customerName || 'গ্রাহক'}" (সাইজ: ${ord.size}) এর বুকিং বাতিল করে এই স্লটটি খালি করতে চান?`)) {
                                                const res = removeCustomerSlot(selectedBundle.id, ord.slotId || '', 'অ্যাডমিন কর্তৃক বাতিল');
                                                if (res.success) {
                                                  setCopiedNotification(res.message);
                                                  setTimeout(() => setCopiedNotification(null), 3000);
                                                }
                                              }
                                            }}
                                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                            title="স্লট খালি ও কাস্টমার রিমুভ করুন"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                            <span>রিমুভ</span>
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          {/* Slot Status Summary Matrix */}
                          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5">
                            <h5 className="text-xs font-bold text-stone-800 mb-2">এই বান্ডিলের সকল সাইজ স্লট স্ট্যাটাস:</h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                              {selectedBundle.slots.map((slot) => {
                                const isBooked = slot.status === 'booked';
                                return (
                                  <div
                                    key={slot.id}
                                    className={`p-2.5 rounded-xl border text-center relative group ${
                                      isBooked
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                                        : 'bg-white border-dashed border-stone-300 text-stone-500'
                                    }`}
                                  >
                                    <div className="text-xs font-black">সাইজ {slot.size}</div>
                                    <div className="text-[10px] font-bold mt-1">
                                      {isBooked ? (
                                        <span className="text-emerald-800 flex items-center justify-center gap-0.5">
                                          <Check className="w-3 h-3" />
                                          <span className="truncate max-w-[80px]">{slot.userName || 'বুকড'}</span>
                                        </span>
                                      ) : (
                                        <span className="text-stone-400">খালি স্লট</span>
                                      )}
                                    </div>
                                    {isBooked && slot.userPhoneMasked && (
                                      <div className="text-[9px] text-emerald-700 font-mono mt-0.5">
                                        {slot.userPhoneMasked}
                                      </div>
                                    )}
                                    {isBooked && (
                                      <button
                                        onClick={() => {
                                          if (confirm(`আপনি কি সাইজ ${slot.size} এর বুকিং বাতিল করে স্লটটি উন্মুক্ত করতে চান?`)) {
                                            const res = removeCustomerSlot(selectedBundle.id, slot.id, 'অ্যাডমিন কর্তৃক বাতিল');
                                            if (res.success) {
                                              setCopiedNotification(res.message);
                                              setTimeout(() => setCopiedNotification(null), 3000);
                                            }
                                          }
                                        }}
                                        className="mt-1.5 px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded text-[9px] font-bold block mx-auto cursor-pointer transition-colors"
                                        title="স্লট খালি করুন"
                                      >
                                        ✕ রিমুভ
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    /* SUB-VIEW 2: ALL BUNDLES LIST (FULL / COMPLETED BUNDLES ON TOP IN SERIAL) */
                    <div className="space-y-4">
                      {/* Bundles Header & Filters */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                        <div>
                          <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-emerald-700" />
                            <span>বর্তমান সকল বান্ডিল ও ব্যাচসমূহ ({bundles.length}টি ব্যাচ):</span>
                          </h3>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            বান্ডিলে ক্লিক করে ভেতরের কাস্টমার লিস্ট, TrxID ও সম্পূর্ণ তথ্য দেখুন।
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                          <button
                            onClick={() => setBundleFilter('all')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              bundleFilter === 'all'
                                ? 'bg-stone-900 text-white'
                                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            সকল ({bundles.length})
                          </button>
                          <button
                            onClick={() => setBundleFilter('completed')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              bundleFilter === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>স্লট পূরণ হয়েছে ({bundles.filter(b => b.filledSlots >= b.totalSlots || b.status === 'completed' || b.status === 'ordered').length})</span>
                          </button>
                          <button
                            onClick={() => setBundleFilter('ongoing')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              bundleFilter === 'ongoing'
                                ? 'bg-amber-600 text-white'
                                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            চলমান বুকিং ({bundles.filter(b => b.filledSlots < b.totalSlots && b.status === 'open').length})
                          </button>
                        </div>
                      </div>

                      {/* Batches Grid (Sorted with Completed Batches at Top) */}
                      {(() => {
                        // Prepare list with product and completion flags
                        const batchList = bundles.map((b) => {
                          const prod = products.find((p) => p.id === b.productId);
                          const isFull = b.filledSlots >= b.totalSlots || b.status === 'completed' || b.status === 'ordered';
                          return {
                            bundle: b,
                            product: prod,
                            isFull,
                          };
                        });

                        // Filter by tab
                        const filtered = batchList.filter((item) => {
                          if (bundleFilter === 'completed') return item.isFull;
                          if (bundleFilter === 'ongoing') return !item.isFull;
                          return true;
                        });

                        // Strict Sorting: COMPLETED / FULL BATCHES GO TO THE TOP (Serial a upore)
                        const sorted = [...filtered].sort((a, b) => {
                          if (a.isFull && !b.isFull) return -1;
                          if (!a.isFull && b.isFull) return 1;
                          return b.bundle.batchNumber - a.bundle.batchNumber;
                        });

                        if (sorted.length === 0) {
                          return (
                            <div className="text-center py-12 text-stone-500 text-xs bg-white rounded-2xl border border-stone-200">
                              <Layers className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                              <p>কোনো বান্ডিল ব্যাচ পাওয়া যায়নি।</p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {sorted.map(({ bundle: b, product: prod, isFull }) => {
                              if (!prod) return null;
                              const progressPercent = Math.min(100, Math.round((b.filledSlots / b.totalSlots) * 100));

                              return (
                                <div
                                  key={b.id}
                                  onClick={() => setSelectedBundleId(b.id)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3.5 hover:shadow-md hover:border-emerald-500 relative group ${
                                    isFull
                                      ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400/30'
                                      : 'bg-white border-stone-200 hover:bg-stone-50/50'
                                  }`}
                                >
                                  {/* Product Thumbnail */}
                                  <div className="relative shrink-0">
                                    <img
                                      src={prod.imageUrl}
                                      alt={prod.title}
                                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-stone-200 shadow-xs"
                                    />
                                    <span className="absolute bottom-1 right-1 bg-stone-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                                      {prod.category}
                                    </span>
                                  </div>

                                  {/* Bundle Content */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                      {/* Top Badge Row */}
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <div className="flex items-center gap-1.5">
                                           <span className="text-[11px] font-black bg-stone-900 text-white px-2 py-0.5 rounded">
                                            ব্যাচ #{b.batchNumber}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              startEditingProduct(prod);
                                            }}
                                            className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded text-[10px] font-bold text-stone-800 flex items-center gap-1 cursor-pointer transition-colors"
                                            title="বান্ডিল ও পণ্য এডিট করুন"
                                          >
                                            <Sparkles className="w-3 h-3 text-emerald-600" />
                                            <span>এডিট</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              if (confirm(`আপনি কি আসলেই "${prod.title}" বান্ডিলটি এবং এর সমস্ত চলমান ব্যাচ ডাটাবেজ থেকে সম্পূর্ণ মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না!`)) {
                                                const res = await deleteProduct(prod.id);
                                                setCopiedNotification(res.message);
                                                setTimeout(() => setCopiedNotification(null), 3000);
                                              }
                                            }}
                                            className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                            title="বান্ডিলটি মুছে ফেলুন"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                            <span>মুছে ফেলুন</span>
                                          </button>
                                        </div>

                                        {/* Prominent Slot Completed Status Badge */}
                                        {isFull ? (
                                          <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse shrink-0">
                                            <Check className="w-3 h-3" />
                                            <span>স্লট পূরণ হয়েছে (Slot Completed)</span>
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full shrink-0">
                                            {b.totalSlots - b.filledSlots}টি স্লট বাকি
                                          </span>
                                        )}
                                      </div>

                                      {/* Title */}
                                      <h4 className="text-xs font-bold text-stone-900 truncate group-hover:text-emerald-700 transition-colors">
                                        {prod.title}
                                      </h4>

                                      {/* Pricing */}
                                      <div className="text-[11px] text-stone-600 mt-0.5 flex flex-wrap gap-x-2">
                                        <span>গ্রুপ রেট: <strong className="text-emerald-700 font-bold">৳{prod.groupPrice}</strong></span>
                                        <span>হোলসেল: ৳{prod.wholesalePrice}</span>
                                      </div>
                                    </div>

                                    {/* Progress Meter & View CTA */}
                                    <div className="mt-2 pt-2 border-t border-stone-100">
                                      <div className="flex items-center justify-between text-[11px] mb-1">
                                        <span className="font-semibold text-stone-700">
                                          {b.filledSlots}/{b.totalSlots} স্লট পূর্ণ
                                        </span>
                                        <span className="text-[10px] text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                                          <span>বিস্তারিত দেখুন</span>
                                          <Eye className="w-3 h-3" />
                                        </span>
                                      </div>
                                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            isFull ? 'bg-emerald-600' : 'bg-emerald-500'
                                          }`}
                                          style={{ width: `${progressPercent}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
          </>
        )}

        {/* EDIT PRODUCT / BUNDLE MODAL OVERLAY */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">বান্ডিল ও পণ্য এডিট করুন</h3>
                    <p className="text-xs text-stone-500">আইডি: {editingProduct.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editSuccessMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl text-center">
                  {editSuccessMsg}
                </div>
              )}

              <form onSubmit={handleSaveEditedProduct} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">পণ্যের নাম *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">ক্যাটাগরি *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">পণ্যের বিস্তারিত বিবরণ (Description) *</label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="পণ্যের উপাদান, ফিনিশিং, সাইজ গাইড বা বিস্তারিত বিবরণ লিখুন..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Main Image URL */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">প্রধান ছবির লিংক (Main Image URL) *</label>
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Additional Images */}
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <label className="block text-xs font-bold text-stone-800">অতিরিক্ত ৫টি ছবির লিংক (Optional)</label>
                  <div className="space-y-1.5">
                    {editAdditionalImages.map((img, i) => (
                      <input
                        key={i}
                        type="url"
                        placeholder={`ছবি ${i + 1} এর লিংক...`}
                        value={img}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditAdditionalImages((prev) => {
                            const updated = [...prev];
                            updated[i] = val;
                            return updated;
                          });
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    ))}
                  </div>
                </div>

                {/* YouTube Video URL */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">ইউটিউব ভিডিও লিংক (Optional)</label>
                  <input
                    type="url"
                    value={editYoutubeVideoUrl}
                    onChange={(e) => setEditYoutubeVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Prices Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">খুচরা মূল্য (৳) *</label>
                    <input
                      type="number"
                      value={editRetailPrice}
                      onChange={(e) => setEditRetailPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1">গ্রুপ বাই মূল্য/পিস (৳) *</label>
                    <input
                      type="number"
                      value={editGroupPrice}
                      onChange={(e) => setEditGroupPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">পুরো বান্ডিল মূল্য/পিস (৳) *</label>
                    <input
                      type="number"
                      value={editFullBundlePrice}
                      onChange={(e) => setEditFullBundlePrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                 {/* Sizes and Colors Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">উপলব্ধ সাইজসমূহ (কমা দিয়ে পৃথক করুন) *</label>
                    <input
                      type="text"
                      value={editSizesText}
                      onChange={(e) => setEditSizesText(e.target.value)}
                      placeholder="39, 40, 41, 42, 43, 44"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2">উপলব্ধ কালারসমূহ (Available Colors) *</label>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-stone-50 border border-stone-200 rounded-2xl min-h-[90px] max-h-[160px] overflow-y-auto">
                      {colors.map((col) => {
                        const isSelected = editSelectedColors.includes(col);
                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setEditSelectedColors(prev => prev.filter(c => c !== col));
                              } else {
                                setEditSelectedColors(prev => [...prev, col]);
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                              isSelected
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  col === 'সাদা' ? '#ffffff' :
                                  col === 'কালো' ? '#000000' :
                                  col === 'লাল' ? '#ef4444' :
                                  col === 'নীল' ? '#3b82f6' :
                                  col === 'হলুদ' ? '#eab308' :
                                  col === 'সবুজ' ? '#22c55e' :
                                  col === 'গ্রে' ? '#6b7280' :
                                  col === 'ব্রাউন' ? '#854d0e' :
                                  undefined,
                                border: '1px solid #d1d5db'
                              }}
                            />
                            <span>{col}</span>
                          </button>
                        );
                      })}
                      {colors.length === 0 && (
                        <p className="text-[11px] text-stone-400 font-semibold italic">কোনো কালার পাওয়া যায়নি। অনুগ্রহ করে অ্যাডমিন প্যানেলে কালার যুক্ত করুন।</p>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1">
                      কালারগুলোতে ক্লিক করে সিলেক্ট/ডিসেলেক্ট করুন।
                    </p>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>পরিবর্তন সেভ করুন</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
