import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, CheckCircle2, Truck, AlertCircle, Sparkles, CheckCheck } from 'lucide-react';
import { AppNotification } from '../types';

export const NotificationsModal: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    notificationsModalOpen,
    setNotificationsModalOpen,
    markAllNotificationsAsRead,
    markNotificationAsRead,
  } = useApp();

  if (!notificationsModalOpen) return null;

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'এইমাত্র';
      if (diffMins < 60) return `${diffMins} মিনিট আগে`;
      if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
      if (diffDays === 1) return 'গতকাল';
      return `${date.toLocaleDateString('bn-BD')} ${date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return isoStr;
    }
  };

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'ready_to_deliver':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
        );
      case 'order_update':
        return (
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Bell className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900">নোটিফিকেশন সেন্টার</h2>
                {unreadNotificationsCount > 0 && (
                  <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                    {unreadNotificationsCount} নতুন
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">আপনার স্লট বুকিং ও ব্যাচ ডেলিভারি আপডেট</p>
            </div>
          </div>
          <button
            onClick={() => setNotificationsModalOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar if there are notifications */}
        {notifications.length > 0 && (
          <div className="px-5 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">
              সর্বমোট {notifications.length} টি নোটিফিকেশন
            </span>
            {unreadNotificationsCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead()}
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>সব পড়া হয়েছে মার্ক করুন</span>
              </button>
            )}
          </div>
        )}

        {/* Notifications List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="text-sm font-bold text-stone-800">কোনো নোটিফিকেশন নেই</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                আপনি যখন কোনো স্লটে যোগ দেবেন বা ব্যাচ পূর্ণ হয়ে ডেলিভারির জন্য প্রস্তুত হবে, এখানে তাৎক্ষণিক আপডেট দেখতে পাবেন।
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) markNotificationAsRead(notif.id);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-3.5 items-start ${
                  notif.isRead
                    ? 'bg-white border-stone-200 hover:bg-stone-50/70'
                    : 'bg-emerald-50/40 border-emerald-300 shadow-xs ring-1 ring-emerald-500/10'
                }`}
              >
                {getNotifIcon(notif.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-stone-400 font-medium shrink-0">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {notif.batchNumber && (
                      <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                        ব্যাচ #{notif.batchNumber}
                      </span>
                    )}
                    {notif.type === 'ready_to_deliver' && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        রেডি টু ডেলিভার
                      </span>
                    )}
                    {!notif.isRead && (
                      <span className="ml-auto inline-block w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-emerald-200"></span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center">
          <button
            onClick={() => setNotificationsModalOpen(false)}
            className="w-full py-2 px-4 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
