import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Bell,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  ShoppingBag,
  Trash2,
  CheckCheck,
  ExternalLink,
  Tag,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    setMyBookingsOpen,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'bundle' | 'order'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'bundle') return item.type === 'bundle_complete' || item.type === 'slot_booked';
    if (activeFilter === 'order') return item.type === 'order';
    return true;
  });

  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'bundle_complete':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs border border-emerald-200 animate-bounce">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
        );
      case 'slot_booked':
        return (
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 shadow-xs border border-teal-200">
            <Layers className="w-5 h-5 text-teal-600" />
          </div>
        );
      case 'order':
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 shadow-xs border border-blue-200">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
          </div>
        );
      case 'promo':
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 shadow-xs border border-purple-200">
            <Tag className="w-5 h-5 text-purple-600" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 shadow-xs border border-stone-200">
            <Bell className="w-5 h-5 text-stone-600" />
          </div>
        );
    }
  };

  const handleActionClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.linkAction === 'my_bookings') {
      onClose();
      setMyBookingsOpen(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs relative">
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">নোটিফিকেশন ও আপডেট</h2>
                {unreadNotificationsCount > 0 && (
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {unreadNotificationsCount}টি নতুন
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                স্লট পূর্ণ হওয়ার অ্যালার্ট, অর্ডার ও ব্যাচ আপডেট
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              সকল ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              অপঠিত ({unreadNotificationsCount})
            </button>
            <button
              onClick={() => setActiveFilter('bundle')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'bundle'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              স্লট ও ব্যাচ
            </button>
            <button
              onClick={() => setActiveFilter('order')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'order'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              অর্ডারসমূহ
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>সব পঠিত করুন</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-stone-400 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="সব নোটিফিকেশন মুছুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>মুছুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-stone-500">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-800">কোনো নোটিফিকেশন পাওয়া যায়নি</h3>
              <p className="text-xs text-stone-400 mt-1">
                {activeFilter === 'unread'
                  ? 'আপনার কোনো অপঠিত নোটিফিকেশন নেই।'
                  : 'নতুন অর্ডার বা ব্যাচ আপডেট এলে এখানে দেখতে পাবেন।'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const formattedTime = new Date(notif.createdAt).toLocaleDateString('bn-BD', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex gap-3.5 items-start ${
                    notif.read
                      ? 'bg-white border-stone-200/90 text-stone-700 hover:bg-stone-50/80'
                      : 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/20 shadow-xs'
                  }`}
                >
                  {getIconForType(notif.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className={`text-xs sm:text-sm ${notif.read ? 'font-bold text-stone-900' : 'font-black text-emerald-950'}`}>
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 whitespace-nowrap font-mono shrink-0">
                        {formattedTime}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Action Button */}
                    <div className="mt-2.5 flex items-center gap-2">
                      {notif.linkAction === 'my_bookings' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(notif);
                          }}
                          className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <span>আমার স্লট বিস্তারিত দেখুন</span>
                          <ChevronRight className="w-3 h-3 text-emerald-400" />
                        </button>
                      )}

                      {notif.type === 'bundle_complete' && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>স্লট পূরণ হয়েছে</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-xs text-stone-500 shrink-0">
          গ্রুপবাই প্ল্যাটফর্মের সকল রিয়েলটাইম আপডেট এবং পাইকারি গ্রুপ অর্ডার নোটিফিকেশন
        </div>
      </div>
    </div>
  );
};
