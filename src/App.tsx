import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { BundleDetailModal } from './components/BundleDetailModal';
import { BookingModal } from './components/BookingModal';
import { StartNewBatchModal } from './components/StartNewBatchModal';
import { SavedBundlesModal } from './components/SavedBundlesModal';
import { CategoryModal } from './components/CategoryModal';
import { AuthModal } from './components/AuthModal';
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
    categoryModalOpen,
    setCategoryModalOpen,
    setMyBookingsOpen,
    setAuthModalOpen,
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
    preselectedColor?: string;
  } | null>(null);





  // Bundle Detail Modal State & Scroll Position Retention
  const [selectedProductForBundle, setSelectedProductForBundle] = useState<Product | null>(null);
  const [selectedBundleIdForDetail, setSelectedBundleIdForDetail] = useState<string | undefined>(undefined);
  const scrollPosRef = useRef<number>(0);

  const openBundleModal = (product: Product, bundleId?: string) => {
    // Record current scroll position before opening
    scrollPosRef.current = window.scrollY || document.documentElement.scrollTop || 0;

    setSelectedProductForBundle(product);
    setSelectedBundleIdForDetail(bundleId);

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('product', product.id);
      if (bundleId) {
        url.searchParams.set('bundle', bundleId);
      }
      window.history.pushState({ modalOpen: true, productId: product.id }, '', url.toString());
    } catch {}
  };

  const closeBundleModal = () => {
    setSelectedProductForBundle(null);
    setSelectedBundleIdForDetail(undefined);

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('product');
      url.searchParams.delete('bundle');
      window.history.replaceState({}, '', url.pathname + url.search);
    } catch {}

    // Restore scroll position after closing modal
    const savedPos = scrollPosRef.current;
    setTimeout(() => {
      window.scrollTo({ top: savedPos, behavior: 'instant' });
    }, 0);
  };

  // Deep Link Handling: Check URL params on initial load or change (?product=xyz&bundle=abc)
  useEffect(() => {
    if (products.length === 0) return;

    try {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      const bundleId = params.get('bundle');

      if (productId) {
        const matchedProduct = products.find(p => p.id === productId);
        if (matchedProduct) {
          setSelectedProductForBundle(matchedProduct);
          setSelectedBundleIdForDetail(bundleId || undefined);
        }
      }
    } catch {}
  }, [products, bundles]);

  // Browser Back Button (popstate) Handler to close modal without losing scroll
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');

      if (!productId) {
        setSelectedProductForBundle(null);
        setSelectedBundleIdForDetail(undefined);
        const savedPos = scrollPosRef.current;
        setTimeout(() => {
          window.scrollTo({ top: savedPos, behavior: 'instant' });
        }, 0);
      } else {
        const matchedProduct = products.find(p => p.id === productId);
        if (matchedProduct) {
          setSelectedProductForBundle(matchedProduct);
          setSelectedBundleIdForDetail(params.get('bundle') || undefined);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth gate wrapper: If not logged in, prompt AuthModal with clear message
  const requireAuth = (callback: () => void) => {
    if (!user) {
      showToast('⚠️ স্লট বুকিং করতে দয়া করে প্রথমে লগইন অথবা নতুন রেজিস্ট্রেশন সম্পন্ন করুন।');
      setAuthModalOpen(true);
      return;
    }
    callback();
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

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const hasActiveFilters = selectedCategory !== 'সব' || searchQuery.trim() !== '';

  const resetFilters = () => {
    setSelectedCategory('সব');
    setSearchQuery('');
  };

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
        {/* Active Category Header Filter Badge */}
        {selectedCategory !== 'সব' && (
          <div className="mb-4 flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>ক্যাটাগরি: <span className="text-emerald-700 uppercase">{selectedCategory}</span></span>
            </div>
            <button
              onClick={() => setSelectedCategory('সব')}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>সব ফিল্টার সরান</span>
            </button>
          </div>
        )}

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
                onOpenBundleModal={(prod) => openBundleModal(prod)}
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
      {/* Category Modal */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSelectCategory={(catName) => setSelectedCategory(catName)}
        selectedCategoryName={selectedCategory}
      />

      {/* Saved Bundles Modal */}
      <SavedBundlesModal onViewBundle={(prod) => openBundleModal(prod)} />

      {/* Bundle Detail Modal (Full-screen view) */}
      {selectedProductForBundle && (() => {
        const liveProduct = products.find(p => p.id === selectedProductForBundle.id) || selectedProductForBundle;
        const isLiveAvailable = liveProduct.isAvailable !== false && (liveProduct as any).status !== 'unavailable' && (liveProduct as any).status !== 'inactive';

        return (
          <BundleDetailModal
            product={liveProduct}
            initialBundleId={selectedBundleIdForDetail}
            onClose={closeBundleModal}
            onSelectSlot={(bundle, slot) => {
              if (!isLiveAvailable) {
                showToast('⚠️ এই পণ্যটি বর্তমানে আনঅ্যাভেইলেবল (স্টক শেষ)। স্লট বুকিং সম্ভব নয়।');
                return;
              }
              requireAuth(() => {
                setSelectedBooking({ product: liveProduct, bundle, slot });
              });
            }}
            onStartNewBatch={(prod, size, color) => {
              const currentProd = products.find(p => p.id === prod.id) || prod;
              if (currentProd.isAvailable === false || (currentProd as any).status === 'unavailable') {
                showToast('⚠️ এই পণ্যটি বর্তমানে আনঅ্যাভেইলেবল (স্টক শেষ)। নতুন ব্যাচ শুরু করা সম্ভব নয়।');
                return;
              }
              requireAuth(() => {
                setNewBatchTarget({ product: currentProd, preselectedSize: size, preselectedColor: color });
              });
            }}
          />
        );
      })()}

      {/* Action Popups (Rendered on top of BundleDetailModal) */}
      {selectedBooking && (
        <BookingModal
          product={selectedBooking.product}
          bundle={selectedBooking.bundle}
          slot={selectedBooking.slot}
          onClose={() => setSelectedBooking(null)}
          onSuccess={() => {
            setSelectedBooking(null);
            showToast('স্লট সফলভাবে বুক হয়েছে! আপনার বুকিং তালিকায় যুক্ত করা হয়েছে।');
          }}
        />
      )}

      {newBatchTarget && (
        <StartNewBatchModal
          product={newBatchTarget.product}
          preselectedSize={newBatchTarget.preselectedSize}
          preselectedColor={newBatchTarget.preselectedColor}
          onClose={() => setNewBatchTarget(null)}
          onSuccess={(newBatchNum, newBundleId) => {
            setNewBatchTarget(null);
            showToast(`ব্যাচ #${newBatchNum} তৈরি হয়েছে এবং আপনার সাইজ নিশ্চিত করা হয়েছে!`);
            if (newBundleId) {
              setSelectedBundleIdForDetail(newBundleId);
            }
          }}
        />
      )}





      <AuthModal />
      <MyBookingsModal
        onViewBundle={(product, bundleId) => {
          openBundleModal(product, bundleId);
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
