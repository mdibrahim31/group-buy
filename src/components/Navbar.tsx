import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, User as UserIcon, LogOut, Search, Users } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    setAuthModalOpen,
    logout,
    orders,
    setMyBookingsOpen,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    bundles
  } = useApp();

  const categories = ['সব', 'জুতা', 'কাপড়'];
  const totalActiveBatches = bundles.filter(b => b.status === 'open').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Announcement Bar */}
      <div className="bg-stone-900 text-stone-100 text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>সরাসরি হোলসেলার রেট • কোনো মধ্যস্বত্বভোগী নেই • দলবদ্ধ হয়ে অর্ডার করুন</span>
          </div>
          <div className="flex items-center gap-4 text-stone-300">
            <span>সক্রিয় ব্যাচ: <strong className="text-emerald-400">{totalActiveBatches} টি</strong></span>
            <span>টোকেন অগ্রিম: <strong>মাত্র ৳১৫০</strong></span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900 leading-none">
              GroupBuy <span className="text-emerald-600">Wholesale</span>
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              হোলসেল বান্ডিল • সাইজ স্লট বুকিং
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="জুতা, স্নিকার্স বা পাঞ্জাবি খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-100/80 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* My Bookings Button */}
          <button
            onClick={() => setMyBookingsOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-sm font-medium transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-stone-700" />
            <span className="hidden sm:inline">আমার স্লট</span>
            {orders.length > 0 && (
              <span className="bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {orders.length}
              </span>
            )}
          </button>

          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-stone-200">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-semibold text-stone-900 truncate max-w-[120px]">{user.fullName}</p>
                <p className="text-[11px] text-stone-500">{user.phone}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="লগআউট"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
            >
              <UserIcon className="w-4 h-4" />
              <span>লগইন / সাইন-আপ</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Mobile Search */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-stone-100">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-stone-500 font-medium mr-2">ক্যাটাগরি:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden relative w-full">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="পণ্য খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-100 border border-stone-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>
    </header>
  );
};
