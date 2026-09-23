import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, User as UserIcon, Search, Users, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    setAuthModalOpen,
    setProfileModalOpen,
    orders,
    setMyBookingsOpen,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    unreadNotificationsCount,
    setNotificationModalOpen,
    categories: appCategories,
  } = useApp();

  const allCategories = ['সব', ...appCategories];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
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
          {/* Notification Button */}
          <button
            onClick={() => setNotificationModalOpen(true)}
            className="relative p-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors cursor-pointer"
            title="নোটিফিকেশন দেখুন"
          >
            <Bell className="w-5 h-5 text-stone-700" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* My Bookings Button */}
          <button
            onClick={() => setMyBookingsOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-stone-700" />
            <span className="hidden sm:inline">আমার স্লট</span>
            {orders.length > 0 && (
              <span className="bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {orders.length}
              </span>
            )}
          </button>

          {/* User Auth / Profile */}
          {user ? (
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-all cursor-pointer"
              title="প্রোফাইল দেখুন"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {(user.fullName || 'ক').charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block pr-1">
                <p className="text-xs font-semibold text-stone-900 truncate max-w-[110px] leading-tight">
                  {user.fullName}
                </p>
                <p className="text-[10px] text-stone-500 leading-none">প্রোফাইল</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer"
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
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
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
