import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Bundle } from '../types';
import { dbUploadBundleImage } from '../lib/supabase';
import {
  Layers,
  Lock,
  UserPlus,
  LogIn,
  LogOut,
  Plus,
  Sparkles,
  Package,
  ShieldAlert,
  Eye,
  CheckCircle2,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Tag,
  Trash2,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';

interface SubAdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SizeConfigItem {
  id: string;
  size: string;
  qty: number | '';
}

export const SubAdminPanelModal: React.FC<SubAdminPanelModalProps> = ({ isOpen, onClose }) => {
  const {
    products,
    bundles,
    currentSubAdmin,
    subAdminLogin,
    subAdminRegister,
    subAdminLogout,
    categories,
    colors: appColors,
    addProduct,
    toggleProductAvailability,
    getCategoryMarkup,
    calculateCustomerPrice,
  } = useApp();

  // Forms auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [subAdminAddress, setSubAdminAddress] = useState('');
  const [registrationPin, setRegistrationPin] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Dashboard Sub-views: 'list' | 'add'
  const [dashboardView, setDashboardView] = useState<'list' | 'add'>('list');

  // Post Form States (Hubuhu Admin fields)
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState('জুতা');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodAdditionalImages, setProdAdditionalImages] = useState<string[]>(['', '', '', '', '']);
  const [prodYoutubeVideoUrl, setProdYoutubeVideoUrl] = useState('');
  const [prodRetailPrice, setProdRetailPrice] = useState<number | ''>('');
  const [prodWholesalePrice, setProdWholesalePrice] = useState<number | ''>('');
  const [prodGroupPrice, setProdGroupPrice] = useState<number | ''>('');
  const [prodFullBundlePrice, setProdFullBundlePrice] = useState<number | ''>('');
  const [prodBundleColor, setProdBundleColor] = useState('কালো');
  const [prodSelectedColors, setProdSelectedColors] = useState<string[]>([]);
  const [sizeConfigs, setSizeConfigs] = useState<SizeConfigItem[]>([
    { id: '1', size: '39', qty: 1 },
    { id: '2', size: '40', qty: 1 },
    { id: '3', size: '41', qty: 1 },
    { id: '4', size: '42', qty: 1 },
    { id: '5', size: '43', qty: 1 },
    { id: '6', size: '44', qty: 1 },
  ]);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Sync selected colors when appColors change
  useEffect(() => {
    if (appColors && appColors.length > 0 && prodSelectedColors.length === 0) {
      setProdSelectedColors(appColors);
    }
  }, [appColors, prodSelectedColors]);

  // Sync default bundle color dropdown option
  useEffect(() => {
    if (prodSelectedColors.length > 0) {
      if (!prodSelectedColors.includes(prodBundleColor)) {
        setProdBundleColor(prodSelectedColors[0]);
      }
    } else {
      setProdBundleColor('');
    }
  }, [prodSelectedColors, prodBundleColor]);

  // Sync category default size configurations
  useEffect(() => {
    if (categories && categories.length > 0) {
      if (!prodCategory || !categories.includes(prodCategory)) {
        setProdCategory(categories[0]);
      }
    }
  }, [categories, prodCategory]);

  const calculatedTotalPcs = useMemo(() => {
    return sizeConfigs.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  }, [sizeConfigs]);

  const [notification, setNotification] = useState<string | null>(null);

  // Direct Gallery Upload state
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingAdditional, setIsUploadingAdditional] = useState<boolean[]>([false, false, false, false, false]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const [ownerFilter, setOwnerFilter] = useState<'my' | 'all'>('my');

  // Get bundles/products depending on ownerFilter (My vs All)
  const myProducts = useMemo(() => {
    if (!currentSubAdmin) return [];
    if (ownerFilter === 'my') {
      return products.filter(p => p.createdBySubAdminId === currentSubAdmin.id);
    }
    return products;
  }, [products, currentSubAdmin, ownerFilter]);

  const myBundles = useMemo(() => {
    if (!currentSubAdmin) return [];
    if (ownerFilter === 'my') {
      return bundles.filter(b => b.createdBySubAdminId === currentSubAdmin.id);
    }
    return bundles;
  }, [bundles, currentSubAdmin, ownerFilter]);

  if (!isOpen) return null;

  // Unsplash Quick Image Presets
  const imagePresets = [
    {
      label: 'অফিসিয়াল লেদার জুতা',
      category: 'জুতা',
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
      category: 'জুতা',
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
      category: 'জুতা',
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
      category: 'কাপড়',
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
      category: 'কাপড়',
      url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
      sizes: [
        { id: '1', size: '40', qty: 1 },
        { id: '2', size: '42', qty: 2 },
        { id: '3', size: '44', qty: 2 },
        { id: '4', size: '46', qty: 1 },
      ],
    },
  ];

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await subAdminLogin(phone, password);
    if (res.success) {
      setAuthSuccess(res.message);
      setPhone('');
      setPassword('');
    } else {
      setAuthError(res.message);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Verify Admin Registration PIN configured in GitHub Actions / env
    const expectedPin = (
      // @ts-ignore
      (typeof __APP_SUB_ADMIN_ACCESS_KEY__ !== 'undefined' ? __APP_SUB_ADMIN_ACCESS_KEY__ : '') ||
      import.meta.env.VITE_SUB_ADMIN_ACCESS_KEY ||
      'subadmin123'
    ).trim();

    if (!registrationPin.trim()) {
      setAuthError('দয়া করে অ্যাডমিন কর্তৃক প্রদত্ত সিক্রেট রেজিস্ট্রেশন পিন (PIN) প্রদান করুন।');
      return;
    }

    if (registrationPin.trim() !== expectedPin) {
      setAuthError('ভুল রেজিস্ট্রেশন পিন! অ্যাডমিনের সেট করা সঠিক পিন প্রদান না করলে রেজিস্ট্রেশন সম্পন্ন হবে না।');
      return;
    }

    const res = await subAdminRegister(phone, password, fullName, subAdminAddress);
    if (res.success) {
      setAuthSuccess(res.message);
      setAuthMode('login');
      setFullName('');
      setPhone('');
      setPassword('');
      setSubAdminAddress('');
      setRegistrationPin('');
    } else {
      setAuthError(res.message);
    }
  };

  // Clear Form fields
  const clearForm = () => {
    setProdTitle('');
    setProdImageUrl('');
    setProdAdditionalImages(['', '', '', '', '']);
    setProdYoutubeVideoUrl('');
    setProdRetailPrice('');
    setProdWholesalePrice('');
    setProdGroupPrice('');
    setProdFullBundlePrice('');
    setProdDescription('');
    setFormError(null);
    setFormSuccess(false);
    setIsUploadingMain(false);
    setIsUploadingAdditional([false, false, false, false, false]);
  };

  // Open Add Product form
  const handleOpenAddForm = () => {
    clearForm();
    setProdCategory(categories[0] || 'জুতা');
    setProdSelectedColors(appColors);
    setSizeConfigs([
      { id: '1', size: '39', qty: 1 },
      { id: '2', size: '40', qty: 1 },
      { id: '3', size: '41', qty: 1 },
      { id: '4', size: '42', qty: 1 },
      { id: '5', size: '43', qty: 1 },
      { id: '6', size: '44', qty: 1 },
    ]);
    setDashboardView('add');
  };

  // Handle product add submit (Hubuhu Admin logics)
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!prodTitle.trim()) {
      setFormError('দয়া করে পণ্যের নাম লিখুন');
      return;
    }
    if (!prodImageUrl.trim()) {
      setFormError('পণ্যের ছবির লিংক (Image URL) দিন');
      return;
    }
    if (!prodRetailPrice || !prodWholesalePrice || !prodGroupPrice) {
      setFormError('খুচরা মূল্য, পাইকারি মূল্য ও গ্রুপ বাই মূল্যের ঘর সঠিকভাবে পূরণ করুন');
      return;
    }

    // Map size configs into array of sizes
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
      setFormError('কমপক্ষে একটি সাইজ ও পিস সংখ্যা সেট করুন');
      return;
    }

    if (prodSelectedColors.length === 0) {
      setFormError('দয়া করে কমপক্ষে একটি কালার সিলেক্ট করুন');
      return;
    }

    const calculatedFullBundlePrice = prodFullBundlePrice
      ? Number(prodFullBundlePrice)
      : Math.round(Number(prodGroupPrice) * 0.88);

    try {
      const res = await addProduct({
        title: prodTitle.trim(),
        category: prodCategory,
        description: prodDescription.trim() || `${prodTitle.trim()} - হোলসেল বান্ডিল গ্রুপ বায়িং।`,
        imageUrl: prodImageUrl.trim(),
        additionalImageUrls: prodAdditionalImages.filter(u => u.trim().length > 0),
        youtubeVideoUrl: prodYoutubeVideoUrl.trim() || undefined,
        retailPrice: Number(prodRetailPrice),
        groupPrice: Number(prodGroupPrice),
        wholesalePrice: Number(prodWholesalePrice),
        fullBundlePricePerPiece: calculatedFullBundlePrice,
        bundleSize: finalSizes.length,
        availableSizes: finalSizes,
        availableColors: prodSelectedColors,
        isAvailable: true,
      }, prodBundleColor.trim());

      if (res && res.success) {
        setFormSuccess(true);
        showNotification('নতুন হোলসেল বান্ডিল সফলভাবে আপলোড সম্পন্ন হয়েছে!');
        clearForm();
        setDashboardView('list');
      } else {
        setFormError(res.message);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving');
    }
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-stone-50 flex flex-col font-sans text-stone-900">
      {/* Top Bar with Close/Back */}
      <div className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
            GB
          </div>
          <span className="text-xs font-black text-stone-800">সাব-অ্যাডমিন প্যানেল</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
          title="হোম পেজে ফিরে যান"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">হোমে ফিরে যান</span>
        </button>
      </div>

      {/* Main Container Workspace */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 bg-stone-50 text-stone-800 flex flex-col">
        {notification && (
          <div className="max-w-4xl mx-auto w-full bg-emerald-600 text-white p-3.5 rounded-2xl mb-5 text-xs font-bold flex items-center gap-2 animate-bounce shadow-md">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Login & Registration Gateway */}
        {!currentSubAdmin ? (
          <div className="max-w-md mx-auto py-10 w-full my-auto">
            {/* Header info */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-stone-900">সাব-অ্যাডমিন পোর্টাল</h3>
              <p className="text-xs text-stone-500 mt-1">
                গ্রুপবাই হোলসেল বান্ডিল পোস্ট ও পরিচালনা করার গেটওয়ে
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex bg-stone-100 p-1.5 rounded-2xl mb-6 border border-stone-200">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                  authMode === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 inline-block mr-1.5" />
                <span>সাব-অ্যাডমিন লগইন</span>
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                  authMode === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 inline-block mr-1.5" />
                <span>নতুন রেজিস্ট্রেশন</span>
              </button>
            </div>

            {authError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold mb-4 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold mb-4 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{authSuccess}</span>
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4 bg-white border border-stone-200 p-6 rounded-3xl shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">ফোন নম্বর:</label>
                  <input
                    type="text"
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">পাসওয়ার্ড:</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs mt-2"
                >
                  লগইন করুন
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 bg-white border border-stone-200 p-6 rounded-3xl shadow-sm">
                {/* Admin Secret Registration PIN */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5">
                  <label className="block text-xs font-extrabold text-amber-900 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>সিক্রেট রেজিস্ট্রেশন পিন (PIN):</span>
                  </label>
                  <input
                    type="password"
                    placeholder="অ্যাডমিনের প্রদত্ত গোপন রেজিস্ট্রেশন পিন দিন"
                    value={registrationPin}
                    onChange={(e) => setRegistrationPin(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-amber-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                    required
                  />
                  <p className="text-[10px] text-amber-700 mt-1 leading-tight">
                    * অ্যাডমিনের অনুমোদিত সিক্রেট পিন ছাড়া নতুন সাব-অ্যাডমিন একাউন্ট রেজিস্ট্রেশন সফল হবে না।
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">সাব-অ্যাডমিন নাম (Full Name):</label>
                  <input
                    type="text"
                    placeholder="যেমন: আবরার রহমান"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">ফোন নম্বর:</label>
                  <input
                    type="text"
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">পাসওয়ার্ড:</label>
                  <input
                    type="password"
                    placeholder="নিরাপদ পাসওয়ার্ড দিন"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">ঠিকানা (Full Address/Location):</label>
                  <input
                    type="text"
                    placeholder="যেমন: চকবাজার, ঢাকা"
                    value={subAdminAddress}
                    onChange={(e) => setSubAdminAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs mt-2"
                >
                  রেজিস্ট্রেশন সম্পন্ন করুন
                </button>
              </form>
            )}
          </div>
        ) : (
          /* PHASE 3: Sub Admin Authenticated Dashboard */
          <div className="max-w-6xl mx-auto w-full space-y-6 text-stone-900">
            {/* Profile Card Banner */}
            <div className="bg-white border border-stone-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-600 text-white font-black text-lg rounded-2xl flex items-center justify-center shadow-xs">
                  {currentSubAdmin.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <span>স্বাগতম, {currentSubAdmin.fullName}!</span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>সাব-অ্যাডমিন</span>
                    </span>
                  </h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">মোবাইল: {currentSubAdmin.phone} | আইডি: {currentSubAdmin.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={subAdminLogout}
                  className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট</span>
                </button>
              </div>
            </div>

            {/* View 1: My Uploaded Products list */}
            {dashboardView === 'list' ? (
              <div className="space-y-5">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-white border border-stone-200 p-4 rounded-2xl shadow-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span>
                          {ownerFilter === 'my' ? 'আমার আপলোডকৃত হোলসেল বান্ডিলসমূহ' : 'শপের সকল হোলসেল বান্ডিলসমূহ'} ({myProducts.length}টি):
                        </span>
                      </h4>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        {ownerFilter === 'my' 
                          ? 'আপনি শুধুমাত্র আপনার নিজের আপলোড করা পণ্যসমূহ এডিট বা আপডেট করতে পারবেন।'
                          : 'সকল সাব-অ্যাডমিন এবং অ্যাডমিনের আপলোডকৃত বান্ডিলগুলোর প্রগ্রেস দেখুন।'}
                      </p>
                    </div>

                    {/* Owner Filter Toggle */}
                    <div className="flex bg-stone-100 border border-stone-200 p-1 rounded-xl items-center gap-1 shrink-0 mt-2 sm:mt-0">
                      <button
                        onClick={() => setOwnerFilter('my')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide transition-all cursor-pointer ${
                          ownerFilter === 'my'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        আমার আপলোড
                      </button>
                      <button
                        onClick={() => setOwnerFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide transition-all cursor-pointer ${
                          ownerFilter === 'all'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        সব বান্ডিল
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenAddForm}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer self-start lg:self-auto shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন বান্ডিল পোস্ট করুন</span>
                  </button>
                </div>

                {myProducts.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl p-6 shadow-xs">
                    <Sparkles className="w-12 h-12 text-emerald-600 mx-auto mb-3 animate-pulse" />
                    <h5 className="text-sm font-bold text-stone-900 mb-1">কোনো আপলোড করা বান্ডিল পাওয়া যায়নি</h5>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
                      আপনি এখনো কোনো বান্ডিল আপলোড করেননি। নতুন কাস্টমার ও গ্রাহকের জন্য স্লট অফার করতে আজই প্রথম বান্ডিল পোস্ট করুন!
                    </p>
                    <button
                      onClick={handleOpenAddForm}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
                    >
                      নতুন বান্ডিল পোস্ট করুন
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {myProducts.map(prod => {
                      const prodBundles = myBundles.filter(b => b.productId === prod.id);

                      return (
                        <div key={prod.id} className="bg-white border border-stone-200 rounded-3xl p-4 flex gap-4 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all text-stone-900">
                          {/* Image */}
                          <div className="relative shrink-0">
                            <img
                              src={prod.imageUrl}
                              alt={prod.title}
                              className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl border border-stone-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200';
                              }}
                            />
                            <span className="absolute bottom-1 right-1 bg-stone-900/85 backdrop-blur-xs text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase">
                              {prod.category}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-black bg-stone-100 border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md">
                                    বান্ডিল সাইজ: {prod.bundleSize}টি
                                  </span>
                                  {prod.createdBySubAdminId === currentSubAdmin.id ? (
                                    <span className="text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                                      আপনার আপলোড
                                    </span>
                                  ) : (
                                    <span className="text-[8px] font-bold bg-stone-100 text-stone-500 border border-stone-200 px-1.5 py-0.5 rounded">
                                      অন্যের পণ্য (ভিউ অনলি)
                                    </span>
                                  )}
                                </div>
                                {prod.createdBySubAdminId === currentSubAdmin.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={async () => {
                                        const res = await toggleProductAvailability(prod.id);
                                        showNotification(res.message);
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border shadow-2xs ${
                                        prod.isAvailable !== false
                                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                                          : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                                      }`}
                                      title={prod.isAvailable !== false ? 'ক্লিক করে আনঅ্যাভেইলেবল করুন' : 'ক্লিক করে অ্যাভেইলেবল করুন'}
                                    >
                                      <span className={`w-2 h-2 rounded-full ${prod.isAvailable !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                      <span>{prod.isAvailable !== false ? 'অ্যাভেইলেবল' : 'আনঅ্যাভেইলেবল'}</span>
                                    </button>
                                  </div>
                                ) : (
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                                    prod.isAvailable !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}>
                                    {prod.isAvailable !== false ? 'অ্যাভেইলেবল' : 'আনঅ্যাভেইলেবল'}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-xs sm:text-sm font-black text-stone-900 truncate">{prod.title}</h4>
                              <div className="text-[11px] text-stone-600 mt-1 space-y-0.5">
                                <p>গ্রুপ রেট: <strong className="text-emerald-700">৳{prod.groupPrice}</strong> | হোলসেল: ৳{prod.wholesalePrice}</p>
                                <p className="text-[10px] text-stone-500 truncate">{prod.description}</p>
                              </div>
                            </div>

                            {/* Booked slots indicator */}
                            <div className="mt-2.5 pt-2 border-t border-stone-100">
                              <span className="text-[10px] font-extrabold text-stone-800">সক্রিয় ব্যাচ প্রগ্রেস:</span>
                              {prodBundles.length === 0 ? (
                                <p className="text-[9px] text-stone-400 italic">কোনো সক্রিয় ব্যাচ নেই</p>
                              ) : (
                                <div className="space-y-2 mt-1">
                                  {prodBundles.map(b => (
                                    <div key={b.id} className="bg-stone-50 border border-stone-200 rounded-xl p-2.5">
                                      <div className="flex items-center justify-between text-[10px] mb-1">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-stone-700">ব্যাচ #{b.batchNumber}</span>
                                          {b.color && (
                                            <span className="text-[9px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-medium">
                                              {b.color}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-emerald-700 font-extrabold">{b.filledSlots}/{b.totalSlots} স্লট বুকড</span>
                                        </div>
                                      </div>

                                      {/* Masked Slots Row */}
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {b.slots.map(s => {
                                          const isBooked = s.status === 'booked';
                                          return (
                                            <span
                                              key={s.id}
                                              className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                                                isBooked
                                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-extrabold'
                                                  : 'bg-white border-dashed border-stone-300 text-stone-400'
                                              }`}
                                              title={isBooked ? 'গ্রাহকের নাম ও ফোন নম্বর গোপন' : 'খালি স্লট'}
                                            >
                                              {s.size} {isBooked ? '🔒' : '○'}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* View 2: Form to Add/Edit Product - HUBUHU SAME AS MAIN ADMIN FORM (LIGHT MODE) */
              <div className="max-w-2xl mx-auto bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 mb-12 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        নতুন হোলসেল বান্ডিল পোস্ট করুন
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        নতুন পণ্য ও সাইজ স্লট পোস্ট করুন। পোস্ট করার সাথে সাথে ব্যাচ #১ স্বয়ংক্রিয়ভাবে চালু হবে।
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDashboardView('list')}
                    className="px-2.5 py-1 text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                </div>

                {formError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleAddProductSubmit} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      পণ্যের নাম *
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: জেনুইন লেদার অক্সফোর্ড শু"
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-stone-400"
                      required
                    />
                  </div>

                  {/* Category & Total Bundle Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        ক্যাটাগরি *
                      </label>
                      <select
                        value={prodCategory}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setProdCategory(cat);
                          if (prodWholesalePrice !== '') {
                            const markup = getCategoryMarkup(cat);
                            setProdGroupPrice(Math.round(Number(prodWholesalePrice) * (1 + markup / 100)));
                          }
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
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        মোট বান্ডিল সাইজ (স্বয়ংক্রিয় গণনা)
                      </label>
                      <div className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 flex items-center justify-between h-9">
                        <span className="text-emerald-700 font-extrabold text-sm">{calculatedTotalPcs} পিস</span>
                        <span className="text-[10px] text-stone-500 font-normal">সাইজ কনফিগারেশন থেকে গণনা করা</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Image Upload Feature */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>প্রধান ছবি আপলোড (Upload Main Image) *</span>
                      </label>
                      <span className="text-[10px] text-stone-500 font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100">গ্যালারি থেকে সিলেক্ট করুন</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-center p-4 bg-white border-2 border-dashed border-stone-200 rounded-2xl shadow-2xs hover:border-emerald-500 transition-colors">
                      <label className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm text-center shrink-0">
                        <PlusCircle className="w-4 h-4" />
                        <span>{isUploadingMain ? 'আপলোড হচ্ছে...' : 'ছবি সিলেক্ট করুন'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingMain}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (!prodTitle.trim()) {
                              alert('দয়া করে প্রথমে পণ্যের নাম লিখুন। কারণ পণ্যের নামে আলাদা ফোল্ডার তৈরি হবে।');
                              return;
                            }
                            setIsUploadingMain(true);
                            try {
                              const res = await dbUploadBundleImage(file, prodTitle.trim());
                              if (res.success && res.url) {
                                setProdImageUrl(res.url);
                              } else {
                                alert(res.error || 'ছবি আপলোড করতে ব্যর্থ হয়েছে।');
                              }
                            } catch (err: any) {
                              alert(err.message || 'আপলোড ব্যর্থ হয়েছে।');
                            } finally {
                              setIsUploadingMain(false);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      
                      <input
                        type="url"
                        placeholder="অথবা সরাসরি ছবির লিংক পেস্ট করুন..."
                        value={prodImageUrl}
                        onChange={(e) => setProdImageUrl(e.target.value)}
                        className="w-full flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-stone-400"
                        required
                      />
                    </div>

                    {/* Image Preview */}
                    {prodImageUrl && (
                      <div className="mt-2.5 flex items-center gap-3 p-2 bg-stone-50 rounded-xl border border-stone-200">
                        <img
                          src={prodImageUrl}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100';
                          }}
                        />
                        <span className="text-[11px] text-emerald-600 font-semibold">প্রধান ছবি প্রিভিউ সফল</span>
                      </div>
                    )}
                  </div>

                  {/* 5 Additional Image Links with Direct File Uploads */}
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>অতিরিক্ত ৫টি ছবি আপলোড (Optional - বান্ডিল ডিটেইলসে স্ক্রল করে দেখা যাবে)</span>
                      </label>
                    </div>
                    <div className="space-y-3">
                      {prodAdditionalImages.map((imgUrl, imgIdx) => (
                        <div key={imgIdx} className="bg-white border border-stone-200/80 rounded-xl p-2.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-stone-700">অতিরিক্ত ছবি #{imgIdx + 1}:</span>
                            {isUploadingAdditional[imgIdx] && <span className="text-[10px] text-emerald-600 font-bold animate-pulse">আপলোড হচ্ছে...</span>}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <label className="w-full sm:w-auto px-3 py-1.5 bg-stone-900 hover:bg-stone-850 text-white rounded-lg text-xs font-bold cursor-pointer text-center shrink-0">
                              <span>গ্যালারি থেকে আপলোড</span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={isUploadingAdditional[imgIdx]}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (!prodTitle.trim()) {
                                    alert('দয়া করে প্রথমে পণ্যের নাম লিখুন। কারণ পণ্যের নামে আলাদা ফোল্ডার তৈরি হবে।');
                                    return;
                                  }
                                  setIsUploadingAdditional(prev => {
                                    const u = [...prev];
                                    u[imgIdx] = true;
                                    return u;
                                  });
                                  try {
                                    const res = await dbUploadBundleImage(file, prodTitle.trim());
                                    if (res.success && res.url) {
                                      setProdAdditionalImages(prev => {
                                        const updated = [...prev];
                                        updated[imgIdx] = res.url!;
                                        return updated;
                                      });
                                    } else {
                                      alert(res.error || 'ছবি আপলোড করতে ব্যর্থ হয়েছে।');
                                    }
                                  } catch (err: any) {
                                    alert(err.message || 'আপলোড ব্যর্থ হয়েছে।');
                                  } finally {
                                    setIsUploadingAdditional(prev => {
                                      const u = [...prev];
                                      u[imgIdx] = false;
                                      return u;
                                    });
                                  }
                                }}
                                className="hidden"
                              />
                            </label>

                            <input
                              type="url"
                              placeholder={`ছবি ${imgIdx + 1} এর লিংক পেস্ট করুন...`}
                              value={imgUrl}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProdAdditionalImages((prev) => {
                                  const updated = [...prev];
                                  updated[imgIdx] = val;
                                  return updated;
                                });
                              }}
                              className="w-full flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-stone-400"
                            />
                          </div>

                          {/* Mini preview for additional image */}
                          {imgUrl && (
                            <div className="flex items-center gap-2">
                              <img
                                src={imgUrl}
                                alt="Preview"
                                className="w-10 h-10 object-cover rounded-md border border-stone-200"
                              />
                              <span className="text-[10px] text-emerald-600 font-bold">ছবি #{imgIdx + 1} সফলভাবে যুক্ত</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* YouTube Sample Video Link */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-stone-700">
                        স্যাম্পল ইউটিউব ভিডিও লিংক (Optional)
                      </label>
                      <span className="text-[10px] text-stone-500">ইউটিউব ভিডিওর সম্পূর্ণ লিংক দিন</span>
                    </div>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={prodYoutubeVideoUrl}
                      onChange={(e) => setProdYoutubeVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono placeholder-stone-400"
                    />
                  </div>

                  {/* Pricing Grid */}
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
                          value={prodRetailPrice}
                          onChange={(e) => setProdRetailPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full pl-6 pr-2 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold placeholder-stone-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                        মূল কেনা/পাইকারি দাম (Base Price) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 text-xs">৳</span>
                        <input
                          type="number"
                          placeholder="100"
                          value={prodWholesalePrice}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            setProdWholesalePrice(val);
                            if (val !== '') {
                              const markup = getCategoryMarkup(prodCategory);
                              setProdGroupPrice(Math.round(val * (1 + markup / 100)));
                            } else {
                              setProdGroupPrice('');
                            }
                          }}
                          className="w-full pl-6 pr-2 py-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold font-mono placeholder-stone-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                        গ্রুপ বাই কাস্টমার মূল্য (Customer Price) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 text-xs">৳</span>
                        <input
                          type="number"
                          placeholder="110"
                          value={prodGroupPrice}
                          readOnly
                          className="w-full pl-6 pr-2 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-500 font-bold cursor-not-allowed focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Category Markup Calculation Preview Box */}
                  {prodWholesalePrice !== '' && Number(prodWholesalePrice) > 0 && (
                    <div className="p-3 bg-emerald-50/90 border border-emerald-300 rounded-xl text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-emerald-900">
                        <span>কাস্টমারকে দেখানো হবে (Calculated Price):</span>
                        <span className="text-sm font-black text-emerald-700">
                          ৳{calculateCustomerPrice(Number(prodWholesalePrice), prodCategory)} /পিস
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 font-medium">
                        মূল কেনা দাম: ৳{prodWholesalePrice} + ক্যাটাগরি ({prodCategory.toUpperCase()}) মার্কআপ: +{getCategoryMarkup(prodCategory)}% (আপনি চাইলে ডানের ঘরে এটি পরিবর্তন বা এডিট করতে পারবেন)
                      </p>
                    </div>
                  )}

                  {/* Size & Quantity Configuration */}
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-stone-200">
                      <div>
                        <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-emerald-600" />
                          <span>사이즈 ও পিস সংখ্যা কনফিগারেশন *</span>
                        </label>
                        <p className="text-[10px] text-stone-500">
                          একই সাইজের ১টির বেশি পিস থাকলে সরাসরি পিস সংখ্যা বাড়িয়ে দিন (যেমন: সাইজ ৪০ = ২ পিস)।
                        </p>
                      </div>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0 self-start sm:self-auto">
                        মোট: {calculatedTotalPcs} পিস / স্লট
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {sizeConfigs.map((sc) => (
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
                              className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-900 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-stone-400"
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
                                className="w-full text-center text-xs font-bold bg-transparent text-stone-900 focus:outline-none py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mt-3 shrink-0"
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
                      className="text-xs font-bold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 w-max"
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
                        {appColors.map((col) => {
                          const isSelected = prodSelectedColors.includes(col);
                          return (
                            <button
                              key={col}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setProdSelectedColors(prev => prev.filter(c => c !== col));
                                } else {
                                  setProdSelectedColors(prev => [...prev, col]);
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
                        {appColors.length === 0 && (
                          <p className="text-[11px] text-stone-400 font-semibold italic">কোনো কালার পাওয়া যায়নি।</p>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">
                        কালারগুলোতে ক্লিক করে সিলেক্ট/ডিসেলেক্ট করুন।
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-800 mb-2">
                        ১ম ব্যাচের কালার (Default Bundle Color) *
                      </label>
                      <select
                        value={prodBundleColor}
                        onChange={(e) => setProdBundleColor(e.target.value)}
                        className="w-full px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold cursor-pointer"
                      >
                        {prodSelectedColors.map((color) => (
                          <option key={color} value={color} className="bg-white text-stone-900">
                            {color}
                          </option>
                        ))}
                        {prodSelectedColors.length === 0 && (
                          <option value="">কোনো কালার সিলেক্ট করা হয়নি</option>
                        )}
                      </select>
                      <p className="text-[10px] text-stone-400 mt-1.5">
                        ১ম ব্যাচটির সব কয়টি স্লট এই নির্ধারিত কালারের হবে।
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      পণ্যের বিস্তারিত বিবরণ (Description - শপে শো করবে) *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="পণ্যের উপাদান, কোয়ালিটি বা বিস্তারিত বিবরণ লিখুন..."
                      value={prodDescription}
                      onChange={(e) => setProdDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-stone-400"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setDashboardView('list')}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>বান্ডিল আপলোড সম্পন্ন করুন</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
