import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Bundle } from '../types';
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
  Check
} from 'lucide-react';

interface SubAdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    updateProduct,
  } = useApp();

  // Security Access Verification
  const [accessCode, setAccessCode] = useState('');
  const [isAccessGranted, setIsAccessGranted] = useState(() => {
    return localStorage.getItem('groupbuy_subadmin_access_granted') === 'true';
  });
  const [accessError, setAccessError] = useState<string | null>(null);

  // Forms auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Dashboard Sub-views: 'list' | 'add' | 'edit'
  const [dashboardView, setDashboardView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form State
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState('জুতা');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodWholesalePrice, setProdWholesalePrice] = useState('');
  const [prodGroupPrice, setProdGroupPrice] = useState('');
  const [prodRetailPrice, setProdRetailPrice] = useState('');
  const [prodBundleSize, setProdBundleSize] = useState('6');
  const [prodAvailableSizes, setProdAvailableSizes] = useState<string[]>([]);
  const [prodAvailableColors, setProdAvailableColors] = useState<string[]>([]);

  // Temp selected size / color for adding in product form
  const [sizeInput, setSizeInput] = useState('');
  const [selectedColorInput, setSelectedColorInput] = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Get only bundles/products created by this Sub-Admin
  const myProducts = useMemo(() => {
    if (!currentSubAdmin) return [];
    return products.filter(p => p.createdBySubAdminId === currentSubAdmin.id);
  }, [products, currentSubAdmin]);

  const myBundles = useMemo(() => {
    if (!currentSubAdmin) return [];
    return bundles.filter(b => b.createdBySubAdminId === currentSubAdmin.id);
  }, [bundles, currentSubAdmin]);

  if (!isOpen) return null;

  // Handle access code verify
  const handleVerifyAccessCode = (e: React.FormEvent) => {
    e.preventDefault();
    const serverKey = (
      // @ts-ignore
      (typeof __APP_SUB_ADMIN_ACCESS_KEY__ !== 'undefined' ? __APP_SUB_ADMIN_ACCESS_KEY__ : '') ||
      import.meta.env.VITE_SUB_ADMIN_ACCESS_KEY ||
      'subadmin123'
    ).trim();
    if (accessCode.trim() === serverKey) {
      setIsAccessGranted(true);
      localStorage.setItem('groupbuy_subadmin_access_granted', 'true');
      setAccessError(null);
    } else {
      setAccessError('ভুল সিক্রেট কোড! অনুগ্রহ করে সঠিক কোডটি দিন।');
    }
  };

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
    const res = await subAdminRegister(phone, password, fullName);
    if (res.success) {
      setAuthSuccess(res.message);
      setPhone('');
      setPassword('');
      setFullName('');
    } else {
      setAuthError(res.message);
    }
  };

  // Open Add Product form
  const handleOpenAddForm = () => {
    setProdTitle('');
    setProdCategory(categories[0] || 'জুতা');
    setProdDescription('');
    setProdImageUrl('');
    setProdWholesalePrice('');
    setProdGroupPrice('');
    setProdRetailPrice('');
    setProdBundleSize('6');
    setProdAvailableSizes(['39', '40', '41', '42', '43', '44']);
    setProdAvailableColors([appColors[0] || 'কালো']);
    setDashboardView('add');
  };

  // Open Edit Product form
  const handleOpenEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setProdTitle(prod.title);
    setProdCategory(prod.category);
    setProdDescription(prod.description);
    setProdImageUrl(prod.imageUrl);
    setProdWholesalePrice(prod.wholesalePrice.toString());
    setProdGroupPrice(prod.groupPrice.toString());
    setProdRetailPrice(prod.retailPrice.toString());
    setProdBundleSize(prod.bundleSize.toString());
    setProdAvailableSizes(prod.availableSizes || []);
    setProdAvailableColors(prod.availableColors || []);
    setDashboardView('edit');
  };

  // Handle product add submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle || !prodWholesalePrice || !prodGroupPrice || !prodRetailPrice) {
      alert('অনুগ্রহ করে প্রয়োজনীয় সকল তথ্য দিন।');
      return;
    }

    const payload: Omit<Product, 'id'> = {
      title: prodTitle.trim(),
      category: prodCategory,
      description: prodDescription.trim(),
      imageUrl: prodImageUrl.trim() || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60',
      wholesalePrice: Number(prodWholesalePrice),
      groupPrice: Number(prodGroupPrice),
      retailPrice: Number(prodRetailPrice),
      fullBundlePricePerPiece: Number(prodGroupPrice),
      bundleSize: Number(prodBundleSize),
      availableSizes: prodAvailableSizes,
      availableColors: prodAvailableColors,
    };

    const res = await addProduct(payload, prodAvailableColors[0] || 'কালো');
    if (res.success) {
      showNotification('বান্ডিল ও ব্যাচ সফলভাবে আপলোড করা হয়েছে!');
      setDashboardView('list');
    } else {
      alert(res.message);
    }
  };

  // Handle product edit submit
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!prodTitle || !prodWholesalePrice || !prodGroupPrice || !prodRetailPrice) {
      alert('অনুগ্রহ করে প্রয়োজনীয় সকল তথ্য দিন।');
      return;
    }

    const payload: Product = {
      ...editingProduct,
      title: prodTitle.trim(),
      category: prodCategory,
      description: prodDescription.trim(),
      imageUrl: prodImageUrl.trim(),
      wholesalePrice: Number(prodWholesalePrice),
      groupPrice: Number(prodGroupPrice),
      retailPrice: Number(prodRetailPrice),
      fullBundlePricePerPiece: editingProduct.fullBundlePricePerPiece || Number(prodGroupPrice),
      bundleSize: Number(prodBundleSize),
      availableSizes: prodAvailableSizes,
      availableColors: prodAvailableColors,
    };

    const res = await updateProduct(payload);
    if (res.success) {
      showNotification('বান্ডিল সফলভাবে আপডেট করা হয়েছে!');
      setDashboardView('list');
    } else {
      alert(res.message);
    }
  };

  const toggleSizeSelection = (size: string) => {
    if (prodAvailableSizes.includes(size)) {
      setProdAvailableSizes(prev => prev.filter(s => s !== size));
    } else {
      setProdAvailableSizes(prev => [...prev, size].sort());
    }
  };

  const toggleColorSelection = (col: string) => {
    if (prodAvailableColors.includes(col)) {
      setProdAvailableColors(prev => prev.filter(c => c !== col));
    } else {
      setProdAvailableColors(prev => [...prev, col]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Container */}
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-stone-200/50 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">সাব-অ্যাডমিন পোর্টাল (Sub-Admin Portal)</h3>
              <p className="text-[10px] text-stone-300">বান্ডিল আপলোড এবং প্রোডাক্ট কো-অর্ডিনেশন ড্যাশবোর্ড</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-700/50 text-stone-300 hover:text-white flex items-center justify-center hover:bg-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
          {notification && (
            <div className="bg-emerald-600 text-white p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>{notification}</span>
            </div>
          )}

          {/* PHASE 1: Verify General Access Code */}
          {!isAccessGranted ? (
            <div className="max-w-md mx-auto py-12 text-center">
              <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Lock className="w-8 h-8 animate-bounce" />
              </div>
              <h4 className="text-base font-black text-stone-900 mb-2">সাব-অ্যাডমিন সিক্রেট ভেরিফিকেশন</h4>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                অনুগ্রহ করে মূল অ্যাডমিন কর্তৃক প্রদত্ত **সিক্রেট কোড** এন্টার করে গেটওয়েটি আনলক করুন।
              </p>

              <form onSubmit={handleVerifyAccessCode} className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder="সাব-অ্যাডমিন সিক্রেট কী (Secret Access Key)"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full text-center px-4 py-3 bg-white border border-stone-300 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-2xs"
                  />
                  {accessError && <p className="text-xs text-rose-600 font-bold mt-2">{accessError}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md hover:shadow-emerald-700/20 cursor-pointer"
                >
                  গেটওয়ে আনলক করুন
                </button>
              </form>
            </div>
          ) : /* PHASE 2: Registration & Login Gateway */
          !currentSubAdmin ? (
            <div className="max-w-md mx-auto py-6">
              {/* Tab Selector */}
              <div className="flex bg-stone-100 p-1.5 rounded-2xl mb-6">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                    authMode === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
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
                    authMode === 'register' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 inline-block mr-1.5" />
                  <span>নতুন রেজিস্ট্রেশন</span>
                </button>
              </div>

              {authError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold mb-4 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">ফোন নম্বর:</label>
                    <input
                      type="text"
                      placeholder="017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">পাসওয়ার্ড:</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    লগইন করুন
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">সাব-অ্যাডমিন নাম (Full Name):</label>
                    <input
                      type="text"
                      placeholder="যেমন: আবরার রহমান"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">ফোন নম্বর:</label>
                    <input
                      type="text"
                      placeholder="017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">পাসওয়ার্ড:</label>
                    <input
                      type="password"
                      placeholder="নিরাপদ পাসওয়ার্ড দিন"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    রেজিস্ট্রেশন সম্পন্ন করুন
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* PHASE 3: Sub Admin Authenticated Dashboard */
            <div className="space-y-6">
              {/* Profile Card Banner */}
              <div className="bg-gradient-to-br from-emerald-50 to-stone-50 border border-emerald-100 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 text-white font-black text-lg rounded-2xl flex items-center justify-center shadow-xs">
                    {currentSubAdmin.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                      <span>স্বাগতম, {currentSubAdmin.fullName}!</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        সাব-অ্যাডমিন
                      </span>
                    </h4>
                    <p className="text-[10px] text-stone-500 font-medium mt-0.5">মোবাইল: {currentSubAdmin.phone} | আইডি: {currentSubAdmin.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm('আপনি কি পোর্টাল গেটওয়ে রিলক করতে চান?')) {
                        setIsAccessGranted(false);
                        localStorage.removeItem('groupbuy_subadmin_access_granted');
                      }
                    }}
                    title="গেটওয়ে লক করুন"
                    className="p-2 bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-xl transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={subAdminLogout}
                    className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগআউট</span>
                  </button>
                </div>
              </div>

              {/* View 1: My Uploaded Products list */}
              {dashboardView === 'list' ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50 border border-stone-200 p-4 rounded-2xl shadow-3xs">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span>আমার আপলোডকৃত বান্ডিলসমূহ ({myProducts.length}টি):</span>
                      </h4>
                      <p className="text-[10px] text-stone-500 mt-0.5">আপনি শুধুমাত্র আপনার নিজের আপলোড করা পণ্যসমূহ এডিট করতে পারবেন।</p>
                    </div>

                    <button
                      onClick={handleOpenAddForm}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>নতুন বান্ডিল পোস্ট</span>
                    </button>
                  </div>

                  {myProducts.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-stone-200 rounded-3xl p-6">
                      <Sparkles className="w-10 h-10 text-emerald-600 mx-auto mb-3 animate-pulse" />
                      <h5 className="text-xs font-bold text-stone-800 mb-1">কোনো আপলোড করা বান্ডিল পাওয়া যায়নি</h5>
                      <p className="text-[10px] text-stone-500 max-w-sm mx-auto mb-4">
                        আপনি এখনো কোনো বান্ডিল আপলোড করেননি। নতুন কাস্টমার ও গ্রাহকের জন্য স্লট অফার করতে আজই প্রথম বান্ডিল পোস্ট করুন!
                      </p>
                      <button
                        onClick={handleOpenAddForm}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        নতুন বান্ডিল পোস্ট করুন
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myProducts.map(prod => {
                        // Find active batches for this product uploaded by sub-admin
                        const prodBundles = myBundles.filter(b => b.productId === prod.id);

                        return (
                          <div key={prod.id} className="bg-white border border-stone-200 rounded-3xl p-4 flex gap-3.5 shadow-2xs hover:border-emerald-500 transition-all">
                            {/* Image */}
                            <div className="relative shrink-0">
                              <img
                                src={prod.imageUrl}
                                alt={prod.title}
                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-stone-100"
                              />
                              <span className="absolute bottom-1 right-1 bg-stone-900/80 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.2 rounded">
                                {prod.category}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between gap-1.5 mb-1">
                                  <span className="text-[9px] font-black bg-stone-900 text-white px-2 py-0.5 rounded">
                                    বান্ডিল সাইজ: {prod.bundleSize}টি
                                  </span>
                                  <button
                                    onClick={() => handleOpenEditForm(prod)}
                                    className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded text-[9px] font-bold text-stone-800 flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Sparkles className="w-3 h-3 text-emerald-600" />
                                    <span>এডিট</span>
                                  </button>
                                </div>

                                <h4 className="text-xs font-black text-stone-900 truncate">{prod.title}</h4>
                                <div className="text-[10px] text-stone-600 mt-1 space-y-0.5">
                                  <p>গ্রুপ রেট: <strong className="text-emerald-700">৳{prod.groupPrice}</strong> | হোলসেল: ৳{prod.wholesalePrice}</p>
                                  <p className="text-[9px] text-stone-400 truncate">{prod.description}</p>
                                </div>
                              </div>

                              {/* Booked slots indicator (strictly masking names/phones) */}
                              <div className="mt-2.5 pt-2 border-t border-stone-100">
                                <span className="text-[10px] font-extrabold text-stone-800">সক্রিয় ব্যাচ প্রগ্রেস:</span>
                                {prodBundles.length === 0 ? (
                                  <p className="text-[9px] text-stone-400">কোনো সক্রিয় ব্যাচ নেই</p>
                                ) : (
                                  <div className="space-y-2 mt-1">
                                    {prodBundles.map(b => (
                                      <div key={b.id} className="bg-stone-50 border border-stone-200 rounded-xl p-2">
                                        <div className="flex items-center justify-between text-[9px] mb-1">
                                          <span className="font-bold text-stone-700">ব্যাচ #{b.batchNumber}</span>
                                          <span className="text-emerald-700 font-extrabold">{b.filledSlots}/{b.totalSlots} স্লট বুকড</span>
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
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
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
                /* View 2: Form to Add/Edit Product */
                <form onSubmit={dashboardView === 'add' ? handleAddProduct : handleEditProduct} className="bg-white border border-stone-200 rounded-3xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>{dashboardView === 'add' ? 'নতুন হোলসেল বান্ডিল ও ব্যাচ আপলোড' : 'বান্ডিল তথ্য সংশোধন/এডিট'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setDashboardView('list')}
                      className="px-2.5 py-1 text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-colors cursor-pointer"
                    >
                      বাতিল করুন
                    </button>
                  </div>

                  {/* Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">পণ্যের নাম/শিরোনাম (Product Title) *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: লেদার ক্যাজুয়াল স্নিকার্স"
                          value={prodTitle}
                          onChange={(e) => setProdTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">ক্যাটাগরি *</label>
                          <select
                            value={prodCategory}
                            onChange={(e) => setProdCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                          >
                            {categories.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">বান্ডিল সাইজ (Slot Size) *</label>
                          <select
                            value={prodBundleSize}
                            onChange={(e) => setProdBundleSize(e.target.value)}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                          >
                            <option value="4">৪ পিসের বান্ডিল</option>
                            <option value="6">৬ পিসের বান্ডিল</option>
                            <option value="8">৮ পিসের বান্ডিল</option>
                            <option value="10">১০ পিসের বান্ডিল</option>
                            <option value="12">১২ পিসের বান্ডিল</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[9px] font-extrabold text-stone-600 uppercase tracking-wider mb-1">হোলসেল রেট *</label>
                          <input
                            type="number"
                            required
                            placeholder="৳৬০০"
                            value={prodWholesalePrice}
                            onChange={(e) => setProdWholesalePrice(e.target.value)}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-extrabold text-stone-600 uppercase tracking-wider mb-1">গ্রুপ বাই রেট *</label>
                          <input
                            type="number"
                            required
                            placeholder="৳৮৫০"
                            value={prodGroupPrice}
                            onChange={(e) => setProdGroupPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-extrabold text-stone-600 uppercase tracking-wider mb-1">রিটেইল (একক) রেট *</label>
                          <input
                            type="number"
                            required
                            placeholder="৳১২০০"
                            value={prodRetailPrice}
                            onChange={(e) => setProdRetailPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">পণ্যের বিবরণ/বর্ণনা (Description) *</label>
                        <textarea
                          rows={3}
                          placeholder="পণ্যের কালার, প্রিমিয়াম কোয়ালিটি ও সরবরাহ সময় বিস্তারিত লিখুন..."
                          value={prodDescription}
                          onChange={(e) => setProdDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">পণ্যের ছবি (Image URL) *</label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <ImageIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="url"
                              placeholder="https://..."
                              value={prodImageUrl}
                              onChange={(e) => setProdImageUrl(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        <p className="text-[9px] text-stone-400 mt-1">ইন্টারনেট থেকে সরাসরি ছবির যেকোনো লিটল লিংক বা ইমেজের আসল URL দিন।</p>
                      </div>

                      {/* Selectable Sizes List */}
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">উপলব্ধ সাইজসমূহ (Available Sizes) *</label>
                        <div className="flex flex-wrap gap-1.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200 max-h-[100px] overflow-y-auto">
                          {['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', 'M', 'L', 'XL', 'XXL', 'Free'].map(sz => {
                            const isSel = prodAvailableSizes.includes(sz);
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => toggleSizeSelection(sz)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all border ${
                                  isSel
                                    ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                                }`}
                              >
                                {sz} {isSel && '✓'}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selectable Colors List */}
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">উপলব্ধ কালারসমূহ (Available Colors)</label>
                        <div className="flex flex-wrap gap-1.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                          {appColors.map(col => {
                            const isSel = prodAvailableColors.includes(col);
                            return (
                              <button
                                key={col}
                                type="button"
                                onClick={() => toggleColorSelection(col)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all border ${
                                  isSel
                                    ? 'bg-stone-900 border-stone-900 text-white'
                                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                                }`}
                              >
                                {col} {isSel && '✓'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Action Submit Button */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setDashboardView('list')}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{dashboardView === 'add' ? 'বান্ডিল আপলোড সম্পন্ন করুন' : 'বান্ডিল তথ্য সংশোধন করুন'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
