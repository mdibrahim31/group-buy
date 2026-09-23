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
} from 'lucide-react';
import { Order, Product, Bundle } from '../types';
import { dbGetAllOrders, isSupabaseConfigured } from '../lib/supabase';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const { orders: localOrders, products, bundles, addProduct, updateBatchStatus } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Tabs: 'orders' | 'new-bundle' | 'bundles'
  const [activeTab, setActiveTab] = useState<'orders' | 'new-bundle' | 'bundles'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // New Bundle Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'জুতা' | 'কাপড়'>('জুতা');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newRetailPrice, setNewRetailPrice] = useState<number | ''>('');
  const [newGroupPrice, setNewGroupPrice] = useState<number | ''>('');
  const [newWholesalePrice, setNewWholesalePrice] = useState<number | ''>('');
  const [newFullBundlePrice, setNewFullBundlePrice] = useState<number | ''>('');
  const [newBundleSize, setNewBundleSize] = useState<number>(6);
  const [newSizes, setNewSizes] = useState('39, 40, 41, 42, 43, 44');
  const [newDescription, setNewDescription] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState('');

  // Preset image suggestions for quick posting
  const imagePresets = [
    {
      label: 'অফিসিয়াল লেদার জুতা',
      category: 'জুতা' as const,
      url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
      sizes: '39, 40, 41, 42, 43, 44',
    },
    {
      label: 'ক্যাজুয়াল লোফার',
      category: 'জুতা' as const,
      url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
      sizes: '39, 40, 41, 42, 43, 44',
    },
    {
      label: 'হোয়াইট স্নিকার্স',
      category: 'জুতা' as const,
      url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      sizes: '40, 41, 42, 43, 44',
    },
    {
      label: 'প্রিমিয়াম পোলো শার্ট',
      category: 'কাপড়' as const,
      url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
      sizes: 'M, L, XL, XXL',
    },
    {
      label: 'সেমি-লং পাঞ্জাবি',
      category: 'কাপড়' as const,
      url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
      sizes: '40, 42, 44, 46',
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

  // Simple PIN verification (default: 1234 or admin)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '1234' || adminPin === 'admin' || adminPin === '0000') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('ভুল পিন নম্বর। (ডেমো পিন: 1234)');
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
  const handlePostBundle = (e: React.FormEvent) => {
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
    if (!newRetailPrice || !newGroupPrice || !newWholesalePrice) {
      setPostError('সকল মূল্যের ঘর সঠিকভাবে পূরণ করুন');
      return;
    }

    const parsedSizes = newSizes
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (parsedSizes.length === 0) {
      setPostError('কমপক্ষে একটি সাইজ লিখুন (যেমন: 39, 40, 41)');
      return;
    }

    const calculatedFullBundlePrice = newFullBundlePrice
      ? Number(newFullBundlePrice)
      : Math.round(Number(newGroupPrice) * 0.88);

    addProduct({
      title: newTitle.trim(),
      category: newCategory,
      description: newDescription.trim() || `${newTitle.trim()} - হোলসেল বান্ডিল গ্রুপ বায়িং।`,
      imageUrl: newImageUrl.trim(),
      retailPrice: Number(newRetailPrice),
      groupPrice: Number(newGroupPrice),
      wholesalePrice: Number(newWholesalePrice),
      fullBundlePricePerPiece: calculatedFullBundlePrice,
      bundleSize: Number(newBundleSize) || 6,
      availableSizes: parsedSizes,
    });

    setPostSuccess(true);
    // Reset Form
    setNewTitle('');
    setNewImageUrl('');
    setNewRetailPrice('');
    setNewGroupPrice('');
    setNewWholesalePrice('');
    setNewFullBundlePrice('');
    setNewDescription('');

    setTimeout(() => {
      setPostSuccess(false);
      setActiveTab('bundles');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-stone-200 flex flex-col">
        {/* Admin Header */}
        <div className="p-4 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wide">অ্যাডমিন ড্যাশবোর্ড (Admin Panel)</h2>
                {isSupabaseConfigured() ? (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Supabase লাইভ
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    লোকাল মোড
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400">বান্ডিল পোস্ট ও অর্ডার ট্র্যাকিং কন্ট্রোল</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Auth Screen */}
        {!isAuthenticated ? (
          <div className="p-8 text-center max-w-sm mx-auto my-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">অ্যাডমিন সিকিউরিটি পিন</h3>
              <p className="text-xs text-stone-500 mt-1">
                বান্ডিল পোস্ট ও অর্ডার ম্যানেজ করতে ৪ সংখ্যার পিন দিন।
              </p>
            </div>
            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                placeholder="পিন লিখুন (যেমন: 1234)"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              {pinError && <p className="text-xs text-rose-600 font-medium">{pinError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                লগইন করুন
              </button>
              <p className="text-[11px] text-stone-400">ডেমো পিন: <span className="font-mono text-stone-600 font-bold">1234</span></p>
            </form>
          </div>
        ) : (
          <>
            {/* Nav Tabs & Actions */}
            <div className="border-b border-stone-200 bg-stone-50 p-3 sm:px-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('new-bundle')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'new-bundle'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>নতুন বান্ডিল পোস্ট করুন</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'orders'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>সকল অর্ডার ({allOrders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('bundles')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'bundles'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>চলতি বান্ডিলসমূহ ({bundles.length})</span>
                </button>

                <button
                  onClick={refreshAdminData}
                  className="p-1.5 bg-white border border-stone-200 text-stone-600 hover:text-stone-900 rounded-lg text-xs cursor-pointer ml-auto sm:ml-0"
                  title="রিফ্রেশ করুন"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Search (when in Orders tab) */}
              {activeTab === 'orders' && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ফোন বা অর্ডার নম্বর..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Tab Contents */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: POST NEW BUNDLE */}
              {activeTab === 'new-bundle' && (
                <div className="max-w-2xl mx-auto bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6">
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

                    {/* Category & Bundle Size */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          ক্যাটাগরি *
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => {
                            const cat = e.target.value as 'জুতা' | 'কাপড়';
                            setNewCategory(cat);
                            if (cat === 'কাপড়') {
                              setNewSizes('M, L, XL, XXL');
                              setNewBundleSize(4);
                            } else {
                              setNewSizes('39, 40, 41, 42, 43, 44');
                              setNewBundleSize(6);
                            }
                          }}
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="জুতা">জুতা (Shoes)</option>
                          <option value="কাপড়">কাপড় (Clothing / Apparel)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          বান্ডিল সাইজ (মোট পিস সংখ্যা) *
                        </label>
                        <input
                          type="number"
                          min="2"
                          max="24"
                          value={newBundleSize}
                          onChange={(e) => setNewBundleSize(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Image URL with Presets */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-stone-700">
                          পণ্যের ছবির লিংক (Image URL) *
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
                              setNewSizes(preset.sizes);
                              if (preset.category === 'কাপড়') setNewBundleSize(4);
                              else setNewBundleSize(6);
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
                          <span className="text-[11px] text-emerald-700 font-semibold">ছবি প্রিভিউ সফল</span>
                        </div>
                      )}
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                          হোলসেলার কস্ট *
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">৳</span>
                          <input
                            type="number"
                            placeholder="650"
                            value={newWholesalePrice}
                            onChange={(e) => setNewWholesalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full pl-6 pr-2 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
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

                    {/* Sizes List */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-stone-700">
                          উপলব্ধ সাইজসমূহ (কমা দিয়ে লিখুন) *
                        </label>
                        <span className="text-[11px] text-stone-400">
                          {newCategory === 'জুতা' ? 'যেমন: 39, 40, 41, 42, 43, 44' : 'যেমন: M, L, XL, XXL'}
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="39, 40, 41, 42, 43, 44"
                        value={newSizes}
                        onChange={(e) => setNewSizes(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        সংক্ষিপ্ত বিবরণ (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="পণ্যের গুণগত মান ও বিস্তারিত..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>নতুন বান্ডিল পোস্ট করুন (শপে লাইভ যুক্ত হবে)</span>
                      </button>
                    </div>
                  </form>
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
                            <th className="p-2.5">পণ্য ও সাইজ</th>
                            <th className="p-2.5">মূল্য ও অগ্রিম</th>
                            <th className="p-2.5">ঠিকানা</th>
                            <th className="p-2.5">স্ট্যাটাস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {filteredOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="p-2.5 font-mono font-bold text-stone-800 whitespace-nowrap">
                                #{ord.id}
                              </td>
                              <td className="p-2.5">
                                <div className="font-bold text-stone-900">{ord.customerName || 'কাস্টমার'}</div>
                                <div className="text-stone-500 font-mono text-[11px]">{ord.customerPhone || ord.contactPhone}</div>
                              </td>
                              <td className="p-2.5">
                                <div className="font-medium text-stone-900 truncate max-w-[150px]">{ord.productTitle}</div>
                                <div className="text-stone-500 text-[11px]">
                                  সাইজ: <span className="font-bold text-stone-800">{ord.size}</span> (ব্যাচ #{ord.batchNumber})
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
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-stone-700">বর্তমান লাইভ পণ্য ও ব্যাচসমূহ:</h3>
                    <button
                      onClick={() => setActiveTab('new-bundle')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>নতুন পোস্ট করুন</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.map((prod) => {
                      const prodBundles = bundles.filter(b => b.productId === prod.id);
                      return (
                        <div key={prod.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex gap-3">
                          <img
                            src={prod.imageUrl}
                            alt={prod.title}
                            className="w-16 h-16 object-cover rounded-lg border border-stone-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs font-bold text-stone-900 truncate">{prod.title}</h4>
                              <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-medium shrink-0">
                                {prod.category}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              গ্রুপ রেট: <span className="font-bold text-emerald-700">৳{prod.groupPrice}</span> (খুচরা: ৳{prod.retailPrice})
                            </div>
                            <div className="text-[11px] text-stone-500">
                              বান্ডিল সাইজ: {prod.bundleSize} পিস | সাইজ: {prod.availableSizes.join(', ')}
                            </div>

                            {/* Batches count */}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {prodBundles.map(b => (
                                <span
                                  key={b.id}
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                    b.filledSlots === b.totalSlots
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : 'bg-white text-stone-700 border-stone-200'
                                  }`}
                                >
                                  ব্যাচ #{b.batchNumber}: {b.filledSlots}/{b.totalSlots} স্লট
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
