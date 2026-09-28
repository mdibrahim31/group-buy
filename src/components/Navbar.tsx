import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, User as UserIcon, Search, Users, Bookmark, Grid, ChevronRight, Folder } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    setAuthModalOpen,
    setProfileModalOpen,
    myOrders,
    setMyBookingsOpen,
    savedProductIds,
    setSavedModalOpen,
    setCategoryModalOpen,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    categories: appCategories,
  } = useApp();

  const allCategories = ['সব', ...appCategories];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-sm sm:text-xl font-bold tracking-tight text-stone-900 leading-none">
              GroupBuy<span className="text-emerald-600 font-extrabold">MarketPlaceBD</span>
            </h1>
            <p className="text-[9px] sm:text-xs text-stone-500 font-medium mt-0.5">
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

        {/* Actions - Profile / Auth only on top row */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User Auth / Profile */}
          {user ? (
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-all cursor-pointer"
              title="প্রোফাইল দেখুন"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {(user.fullName || 'ক').charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block pr-1">
                <p className="text-xs font-semibold text-stone-900 truncate max-w-[100px] leading-tight">
                  {user.fullName}
                </p>
                <p className="text-[10px] text-stone-500 leading-none">প্রোফাইল</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>লগইন / সাইন-আপ</span>
            </button>
          )}
        </div>
      </div>

      {/* Second Row: Category and Save/Cart next to it */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-stone-100 bg-stone-50/30">
        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
          {/* Main Category Modal Trigger Button */}
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Product Category</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Save & Cart Buttons next to Category */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Saved Bundles Button */}
            <button
              onClick={() => setSavedModalOpen(true)}
              className="relative flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors cursor-pointer"
              title="সেভ করা বান্ডিলসমূহ দেখুন"
            >
              <Bookmark className={`w-3.5 h-3.5 ${savedProductIds.length > 0 ? 'text-emerald-700 fill-emerald-700' : 'text-stone-700'}`} />
              <span className="text-[10px] sm:text-xs font-bold">সেভ করা</span>
              {savedProductIds.length > 0 && (
                <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                  {savedProductIds.length}
                </span>
              )}
            </button>

            {/* My Bookings Button */}
            <button
              onClick={() => {
                if (!user) {
                  setAuthModalOpen(true);
                } else {
                  setMyBookingsOpen(true);
                }
              }}
              className="relative flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-stone-700" />
              <span className="text-[10px] sm:text-xs font-bold">আমার স্লট</span>
              {myOrders.length > 0 && (
                <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                  {myOrders.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden relative w-full">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="পণ্য খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-100 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>
    </header>
  );
};
