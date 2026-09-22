import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HowItWorksBanner } from './components/HowItWorksBanner';
import { ProductCard } from './components/ProductCard';
import { BookingModal } from './components/BookingModal';
import { StartNewBatchModal } from './components/StartNewBatchModal';
import { BuyWholeBundleModal } from './components/BuyWholeBundleModal';
import { AuthModal } from './components/AuthModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { ProfileModal } from './components/ProfileModal';
import { Product, Bundle, BundleSlot } from './types';
import { Sparkles, HelpCircle, CheckCircle2, ShieldAlert, PhoneCall, RefreshCcw } from 'lucide-react';

const MainContent: React.FC = () => {
  const { products, selectedCategory, searchQuery, setMyBookingsOpen } = useApp();

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

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter products by category and search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'সব' || product.category === selectedCategory;
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        {/* Business Logic Explainer Banner */}
        <HowItWorksBanner />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 mt-8">
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

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <p className="text-stone-500 text-sm">কোনো পণ্য খুঁজে পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectSlot={(bundle, slot) => setSelectedBooking({ product, bundle, slot })}
                onStartNewBatch={(prod, size) => setNewBatchTarget({ product: prod, preselectedSize: size })}
                onBuyWholeBundle={(prod) => setWholeBundleTarget(prod)}
              />
            ))}
          </div>
        )}

        {/* FAQ & Trust Guarantees */}
        <section className="mt-16 bg-white rounded-2xl p-6 sm:p-8 border border-stone-200">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                গ্রুপ বায়িং নির্দেশিকা ও সাধারণ জিজ্ঞাসা
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mt-2">
                কাস্টমারদের সচরাচর প্রশ্ন ও সমাধান
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>টাকা কি ফেরত পাওয়া যাবে?</span>
                </h4>
                <p className="text-stone-600 text-xs leading-relaxed">
                  হ্যাঁ, নির্ধারিত সময়ের (৪৮ ঘণ্টা) মধ্যে যদি কাঙ্ক্ষিত সাইজের দল পূর্ণ না হয় অথবা হোলসেলারের স্টক ফুরিয়ে যায়, আপনার দেওয়া ১৫০ টাকা টোকেন সম্পূর্ণ রিফান্ড করা হবে।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <RefreshCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>আমার সাইজ বুকড থাকলে কী করব?</span>
                </h4>
                <p className="text-stone-600 text-xs leading-relaxed">
                  প্রতিটি পণ্যের নিচে <strong>"+ নতুন ব্যাচ শুরু করুন"</strong> বাটন রয়েছে। আপনি সেখানে ক্লিক করে আপনার সাইজ নিয়ে ব্যাচ #২ বা #৩ শুরু করতে পারবেন।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>পণ্য কি সরাসরি পাইকারি রেটে দেওয়া হয়?</span>
                </h4>
                <p className="text-stone-600 text-xs leading-relaxed">
                  হোলসেলার সাধারণ কাস্টমারকে ১ পিস দেয় না। আমরা সব সাইজের কাস্টমারদের নিয়ে সম্পূর্ণ বান্ডিল কিনি বলে খুচরা বিক্রেতার অতিরিক্ত মুনাফা বাদ দিয়ে পাইকারি মূল্যে দেওয়া সম্ভব হয়।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ডেলিভারি কীভাবে সম্পন্ন হবে?</span>
                </h4>
                <p className="text-stone-600 text-xs leading-relaxed">
                  সব স্লট পূর্ণ হওয়ার ২৪ ঘণ্টার মধ্যে হোলসেলার থেকে বান্ডিল সংগ্রহ করে পাঠাও বা স্টেডফাস্ট কুরিয়ারে ক্যাশ-অন-ডেলিভারিতে আপনার ঠিকানায় পৌঁছে দেওয়া হবে।
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-6 border-t border-stone-800 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© 2026 GroupBuy Wholesale. সরাসরি কারখানা ও পাইকারি বাজার থেকে গ্রাহকের কাছে।</p>
          <div className="flex items-center gap-4 text-stone-300">
            <span>হোলসেল ডাইরেক্ট</span>
            <span>•</span>
            <span>ক্যাশ অন ডেলিভারি</span>
            <span>•</span>
            <span>১০০% সেফ বুকিং</span>
          </div>
        </div>
      </footer>

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

      <AuthModal />
      <MyBookingsModal />
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
