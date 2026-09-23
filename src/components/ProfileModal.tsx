import React from 'react';
import { useApp } from '../context/AppContext';
import { X, User as UserIcon, Phone, MapPin, LogOut, ShieldCheck, ShoppingBag } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const { user, profileModalOpen, setProfileModalOpen, logout, orders, setMyBookingsOpen } = useApp();

  if (!profileModalOpen || !user) return null;

  const handleLogout = () => {
    logout();
    setProfileModalOpen(false);
  };

  const handleOpenBookings = () => {
    setProfileModalOpen(false);
    setMyBookingsOpen(true);
  };

  const firstLetter = (user.fullName || 'ক').charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">আমার প্রোফাইল</h2>
              <p className="text-[11px] text-stone-500">অ্যাকাউন্ট ও ব্যক্তিগত তথ্য</p>
            </div>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="p-5 space-y-4">
          {/* User Identity Banner */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center shadow-inner shrink-0">
              {firstLetter}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-stone-900 text-base truncate">{user.fullName}</h3>
              <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="font-medium font-mono">{user.phone}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ভেরিফাইড অ্যাকাউন্ট</span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
              ডেলিভারি ঠিকানা
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="flex items-start gap-2 text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>{user.deliveryAddress || 'ঠিকানা যোগ করা হয়নি'}</span>
              </div>
              {user.district && (
                <div className="text-[11px] text-stone-500 pl-5.5">
                  জেলা: <strong className="text-stone-800">{user.district}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Orders / Slots Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
              <span className="text-[11px] font-medium text-emerald-800">মোট বুকিং</span>
              <p className="text-xl font-bold text-emerald-950 mt-0.5">{orders.length} টি</p>
            </div>
            <button
              onClick={handleOpenBookings}
              className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-center transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-medium text-stone-600 flex items-center justify-center gap-1">
                <ShoppingBag className="w-3 h-3 text-stone-500" />
                <span>স্লট হিস্ট্রি</span>
              </span>
              <p className="text-xs font-bold text-emerald-700 group-hover:underline mt-1">
                অর্ডার দেখুন →
              </p>
            </button>
          </div>

          {/* Logout Section */}
          <div className="pt-3 border-t border-stone-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
