import React, { useState, useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { BundleDetailModal } from './components/BundleDetailModal';
import { BookingModal } from './components/BookingModal';
import { StartNewBatchModal } from './components/StartNewBatchModal';
import { BuyWholeBundleModal } from './components/BuyWholeBundleModal';
import { SingleBuyModal } from './components/SingleBuyModal';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { MyBookingsModal } from './components/MyBookingsModal';
import { ProfileModal } from './components/ProfileModal';
import { Product, Bundle, BundleSlot } from './types';
import { Sparkles, CheckCircle2, Bell, ChevronRight, Flame, SlidersHorizontal, X, Tag } from 'lucide-react';
import { WhatsAppSupport, WhatsAppIcon } from './components/WhatsAppSupport';

const MainContent: React.FC = () => {
  const {
    user,
    products,
    bundles,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedSizeFilter,
    setSelectedSizeFilter,
    onlyLastSlotFilter,
    setOnlyLastSlotFilter,
    setMyBookingsOpen,
  } = useApp();

  // Booking Modal State
  const [selectedBooking, setSelectedBooking] = useState<{
    product: Product;
    bundle: Bundle;
    slot: BundleSlot;
  } | null>(null);

  // Start New Batch Modal State
  const [newBatchTarget, setNewBatchTarget] = useState<{
    product: Product;
    preselectedSize?: string;
  } | null>(null);

  // Buy Whole Bundle Modal State
  const [wholeBundleTarget, setWholeBundleTarget] = useState<Product | null>(null);

  // Single Buy Modal State
  const [singleBuyTarget, setSingleBuyTarget] = useState<{
    product: Product;
    desiredSize?: string;
  } | null>(null);

  // Bundle Detail Modal State
  const [selectedProductForBundle, setSelectedProductForBundle] = useState<Product | null>(null);
  const [selectedBundleIdForDetail, setSelectedBundleIdForDetail] = useState<string | undefined>(undefined);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Dynamically extract all available unique sizes across all products
  const allAvailableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    products.forEach(p => {
      p.availableSizes?.forEach(s => {
        if (s && s.trim()) sizeSet.add(s.trim());
      });
    });
    return Array.from(sizeSet).sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [products]);

  // Count products that currently have an active open batch with only 1 slot remaining
  const lastSlotProductsCount = useMemo(() => {
    return products.filter(product => {
      const productBundles = bundles.filter(b => b.productId === product.id);
      return productBundles.some(
        b => b.status === 'open' && (b.totalSlots - b.filledSlots) === 1
      );
    }).length;
  }, [products, bundles]);

  // Filter products by category, search query, size, and last slot
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Category Filter
      const matchesCategory = selectedCategory === 'সব' || product.category === selectedCategory;

      // 2. Search Query Filter (Title, Description, Category, Available Sizes)
      const cleanQuery = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !cleanQuery ||
        product.title.toLowerCase().includes(cleanQuery) ||
        product.description.toLowerCase().includes(cleanQuery) ||
        product.category.toLowerCase().includes(cleanQuery) ||
        product.availableSizes.some(s => s.toLowerCase().includes(cleanQuery));

      // 3. Size Filter
      const matchesSize =
        selectedSizeFilter === 'all' ||
        product.availableSizes.includes(selectedSizeFilter);

      // 4. Last Slot Filter (Only bundle with 1 slot remaining)
      let matchesLastSlot = true;
      if (onlyLastSlotFilter) {
        const productBundles = bundles.filter(b => b.productId === product.id);
        const hasOneSlotRemaining = productBundles.some(
          b => b.status === 'open' && (b.totalSlots - b.filledSlots) === 1
        );
        matchesLastSlot = hasOneSlotRemaining;
      }

      return matchesCategory && matchesSearch && matchesSize && matchesLastSlot;
    });
  }, [products, bundles, selectedCategory, searchQuery, selectedSizeFilter, onlyLastSlotFilter]);

  const hasActiveFilters = selectedCategory !== 'সব' || searchQuery.trim() !== '' || selectedSizeFilter !== 'all' || onlyLastSlotFilter;

  const resetFilters = () => {
    setSelectedCategory('সব');
    setSearchQuery('');
    setSelectedSizeFilter('all');
    setOnlyLastSlotFilter(false);
  };

  // If user is not logged in, gate access with the login/registration page
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans">
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-stone-700 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 flex-1 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                সরাসরি হোলসেলার ব্যাচ ও পণ্যের তালিকা
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              পছন্দের সাইজে ক্লিক করে স্লট বুক করুন। স্লট পূর্ণ হলে সরাসরি হোলসেলার থেকে মাল সরবরাহ করা হবে।
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-600 bg-white px-3 py-1.5 rounded-lg border border-stone-200 self-start sm:self-auto shadow-xs">
            <span className="font-semibold text-stone-800">{filteredProducts.length} টি পণ্য</span>
            <span>উপলব্ধ</span>
          </div>
        </div>

        {/* Filter Controls Toolbar: Size filter & Last Slot filter */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-3 sm:p-4 mb-6 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Filter title and Last Slot Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                <span>ফিল্টার:</span>
              </span>

              {/* 🔥 Last Slot Filter Button */}
              <button
                onClick={() => setOnlyLastSlotFilter(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  onlyLastSlotFilter
                    ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm ring-2 ring-amber-400/40 animate-pulse'
                    : 'bg-amber-50/80 hover:bg-amber-100 text-amber-900 border-amber-200 hover:border-amber-300'
                }`}
                title="যেসব বান্ডিলে মাত্র ১টি স্লট খালি আছে সেগুলো ফিল্টার করুন"
              >
                <Flame className={`w-4 h-4 ${onlyLastSlotFilter ? 'text-stone-950 fill-stone-950' : 'text-amber-600 fill-amber-500'}`} />
                <span>শেষ ১টি স্লট বাকি</span>
                {lastSlotProductsCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    onlyLastSlotFilter ? 'bg-stone-950 text-amber-300' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {lastSlotProductsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Active Filters Clear Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline cursor-pointer ml-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>ফিল্টার রিসেট</span>
              </button>
            )}
          </div>

          {/* Size Filter Pills */}
          {allAvailableSizes.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-stone-100 text-xs">
              <span className="text-stone-500 font-semibold shrink-0 mr-1">সাইজ ফিল্টার:</span>
              <button
                onClick={() => setSelectedSizeFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                  selectedSizeFilter === 'all'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                সব সাইজ
              </button>

              {allAvailableSizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSizeFilter(size === selectedSizeFilter ? 'all' : size)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                    selectedSizeFilter === size
                      ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-800'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}

          {/* Active filter notice if filtered */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-stone-500">
              <span>সক্রিয় ফিল্টার:</span>
              {selectedCategory !== 'সব' && (
                <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-semibold border border-stone-200">
                  ক্যাটাগরি: {selectedCategory}
                </span>
              )}
              {selectedSizeFilter !== 'all' && (
                <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-semibold border border-stone-200">
                  সাইজ: {selectedSizeFilter}
                </span>
              )}
              {onlyLastSlotFilter && (
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold border border-amber-300">
                  🔥 শেষ ১টি স্লট বাকি
                </span>
              )}
              {searchQuery.trim() && (
                <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-semibold border border-stone-200">
                  খোঁজা হচ্ছে: "{searchQuery}"
                </span>
              )}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 shadow-xs max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              কোনো পণ্য পাওয়া যায়নি
            </h3>
            <p className="text-xs text-stone-500 mb-5 max-w-md mx-auto">
              {hasActiveFilters
                ? 'আপনার দেওয়া ফিল্টার বা সার্চ অনুযায়ী কোনো পণ্য মেলেনি। ফিল্টার রিসেট করে আবার চেষ্টা করুন।'
                : 'বর্তমানে কোনো সক্রিয় পণ্য নেই। নতুন পণ্যের জন্য শীঘ্রই আবার ভিজিট করুন।'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                সব ফিল্টার মুছে ফেলুন
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenBundleModal={(prod) => setSelectedProductForBundle(prod)}
                onBuyWholeBundle={(prod) => setWholeBundleTarget(prod)}
                onSingleBuy={(prod) => setSingleBuyTarget({ product: prod })}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-6 border-t border-stone-800 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© 2026 GroupBuy Wholesale. সরাসরি কারখানা ও পাইকারি বাজার থেকে গ্রাহকের কাছে।</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-stone-400">
            <a
              href="https://wa.me/8801882208531"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <WhatsAppIcon className="w-4 h-4 fill-emerald-400" />
              <span>হোয়াটসঅ্যাপ সাপোর্ট: 01882208531</span>
            </a>
            <span>•</span>
            <span>ক্যাশ অন ডেলিভারি</span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Support Button */}
      <WhatsAppSupport phoneNumber="01882208531" />

      {/* Modals */}
      {selectedBooking && (
        <BookingModal
          product={selectedBooking.product}
          bundle={selectedBooking.bundle}
          slot={selectedBooking.slot}
          onClose={() => setSelectedBooking(null)}
          onSuccess={() => {
            setSelectedBooking(null);
            showToast('স্লট সফলভাবে বুক হয়েছে! আপনার বুকিং তালিকায় যুক্ত করা হয়েছে।');
            setMyBookingsOpen(true);
          }}
        />
      )}

      {newBatchTarget && (
        <StartNewBatchModal
          product={newBatchTarget.product}
          preselectedSize={newBatchTarget.preselectedSize}
          onClose={() => setNewBatchTarget(null)}
          onSuccess={(newBatchNum) => {
            setNewBatchTarget(null);
            showToast(`ব্যাচ #${newBatchNum} তৈরি হয়েছে এবং আপনার সাইজ নিশ্চিত করা হয়েছে!`);
            setMyBookingsOpen(true);
          }}
        />
      )}

      {wholeBundleTarget && (
        <BuyWholeBundleModal
          product={wholeBundleTarget}
          onClose={() => setWholeBundleTarget(null)}
          onSuccess={() => {
            setWholeBundleTarget(null);
            showToast('অভিনন্দন! সম্পূর্ণ বান্ডিল অর্ডার সফল হয়েছে।');
            setMyBookingsOpen(true);
          }}
        />
      )}

      {selectedProductForBundle && (
        <BundleDetailModal
          product={selectedProductForBundle}
          initialBundleId={selectedBundleIdForDetail}
          onClose={() => {
            setSelectedProductForBundle(null);
            setSelectedBundleIdForDetail(undefined);
          }}
          onSelectSlot={(bundle, slot) => {
            setSelectedBooking({ product: selectedProductForBundle, bundle, slot });
          }}
          onStartNewBatch={(prod, size) => {
            setNewBatchTarget({ product: prod, preselectedSize: size });
          }}
          onBuyWholeBundle={(prod) => {
            setWholeBundleTarget(prod);
          }}
          onSingleBuy={(prod, size) => {
            setSingleBuyTarget({ product: prod, desiredSize: size });
          }}
        />
      )}

      {singleBuyTarget && (
        <SingleBuyModal
          product={singleBuyTarget.product}
          preselectedSize={singleBuyTarget.desiredSize}
          onClose={() => setSingleBuyTarget(null)}
          onSuccess={() => {
            setSingleBuyTarget(null);
            showToast('অভিনন্দন! আপনার একক অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।');
            setMyBookingsOpen(true);
          }}
        />
      )}

      <AuthModal />
      <MyBookingsModal
        onViewBundle={(product, bundleId) => {
          setSelectedBundleIdForDetail(bundleId);
          setSelectedProductForBundle(product);
        }}
      />
      <ProfileModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
