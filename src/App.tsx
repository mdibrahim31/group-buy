import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { BookingModal } from './components/BookingModal';
import { StartNewBatchModal } from './components/StartNewBatchModal';
import { BuyWholeBundleModal } from './components/BuyWholeBundleModal';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { MyBookingsModal } from './components/MyBookingsModal';
import { ProfileModal } from './components/ProfileModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { NotificationModal } from './components/NotificationModal';
import { Product, Bundle, BundleSlot } from './types';
import { Sparkles, CheckCircle2, Bell, ChevronRight } from 'lucide-react';
import { WhatsAppSupport, WhatsAppIcon } from './components/WhatsAppSupport';

const MainContent: React.FC = () => {
  const {
    user,
    products,
    selectedCategory,
    searchQuery,
    setMyBookingsOpen,
    notificationModalOpen,
    setNotificationModalOpen,
    notifications,
    unreadNotificationsCount,
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

  // Admin Modal State
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // If user is not logged in, gate access with the login/registration page
  if (!user) {
    return (
      <>
        <AuthScreen onOpenAdmin={() => setAdminModalOpen(true)} />
        <AdminPanelModal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
      </>
    );
  }

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
        {/* Customer Live Notification Bar */}
        {notifications.length > 0 && (
          <div className="mb-5 bg-gradient-to-r from-emerald-900 to-stone-900 text-white p-3 sm:p-3.5 rounded-2xl shadow-sm border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/90 text-white flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    গ্রাহক লাইভ আপডেট
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {notifications[0].title}
                  </span>
                </div>
                <p className="text-xs text-stone-300 truncate max-w-xl mt-0.5">
                  {notifications[0].message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setNotificationModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>সব নোটিফিকেশন ({notifications.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
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
            <span>•</span>
            <button
              onClick={() => setAdminModalOpen(true)}
              className="text-stone-500 hover:text-stone-300 hover:underline transition-colors cursor-pointer"
            >
              🔒 অ্যাডমিন প্যানেল
            </button>
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

      <AuthModal />
      <MyBookingsModal />
      <ProfileModal />
      <NotificationModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
      />
      <AdminPanelModal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
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
