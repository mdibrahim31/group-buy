import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Share2,
  Check,
  Users,
  Bell,
  Sparkles,
  ShoppingBag,
  CheckCheck,
} from 'lucide-react';

export const MyBookingsModal: React.FC = () => {
  const {
    myBookingsOpen,
    setMyBookingsOpen,
    orders,
    bundles,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bookings' | 'notifications'>('bookings');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!myBookingsOpen) return null;

  const handleCopyShare = (orderId: string, productTitle: string, batchNumber: number) => {
    const text = `আমি "${productTitle}" এর ব্যাচ #${batchNumber}-এ পাইকারি মূল্যে স্লট বুক করেছি! বাকি স্লটগুলো পূরণ হলে সরাসরি হোলসেলার থেকে মাল পাঠানো হবে। আপনার সাইজ বুক করতে জয়েন করুন: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              {activeTab === 'bookings' ? <Package className="w-5 h-5" /> : <Bell className="w-5 h-5 text-emerald-700" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {activeTab === 'bookings' ? 'আমার স্লট ও বুকিং' : 'গ্রাহক নোটিফিকেশন ও অ্যালার্ট'}
              </h2>
              <p className="text-xs text-stone-500">
                {activeTab === 'bookings'
                  ? 'আপনার বুক করা সাইজ স্লট ও ব্যাচের বর্তমান অবস্থা'
                  : 'স্লট সম্পূর্ণ হওয়া, বুকিং ও কুরিয়ার ট্র্যাকিংয়ের তথ্য'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMyBookingsOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pt-2 bg-stone-50 border-b border-stone-200 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>আমার স্লট ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === 'notifications'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>নোটিফিকেশন ও আপডেট</span>
            {unreadNotificationsCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 flex-1">
          {activeTab === 'notifications' ? (
            /* Customer Notification Tab Content */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-700">সর্বশেষ গ্রাহক নোটিফিকেশন:</span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>সব পঠিত চিহ্নিত করুন</span>
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p>আপনার কোনো নোটিফিকেশন নেই।</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${
                      notif.read
                        ? 'bg-stone-50/70 border-stone-200 text-stone-700'
                        : 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/20 shadow-xs'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      {notif.type === 'bundle_complete' ? (
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Bell className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className={`text-xs ${notif.read ? 'font-bold text-stone-900' : 'font-black text-emerald-950'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-stone-400 font-mono shrink-0">
                          {new Date(notif.createdAt).toLocaleDateString('bn-BD', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-stone-800">এখনো কোনো স্লট বুক করা হয়নি</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
                যেকোনো পণ্যের সাইজ স্লটে ক্লিক করে মাত্র ১৫০ টাকা অগ্রিম দিয়ে হোলসেলার বান্ডিলে যুক্ত হন।
              </p>
              <button
                onClick={() => setMyBookingsOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                পণ্যসমূহ দেখুন
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isSingleBuy = order.isSingleBuy || order.orderType === 'single_buy' || order.bundleId === 'single-buy';
                const isFullBundle = order.isFullBundle || order.orderType === 'full_bundle';

                const targetBundle = bundles.find((b) => b.id === order.bundleId);
                const totalSlots = targetBundle?.totalSlots || 6;
                const filledSlots = targetBundle?.filledSlots || 0;
                const isCompleted = isSingleBuy || isFullBundle || filledSlots >= totalSlots;
                const progressPercent = Math.min(100, Math.round((filledSlots / totalSlots) * 100));

                return (
                  <div
                    key={order.id}
                    className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 hover:bg-white transition-all space-y-3"
                  >
                    {/* Top Row: Item Details */}
                    <div className="flex gap-3 items-center">
                      <img
                        src={order.productImage}
                        alt={order.productTitle}
                        className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <h4 className="font-bold text-stone-900 text-sm truncate">{order.productTitle}</h4>
                          {isSingleBuy ? (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                              একক ক্রয় (Single Buy)
                            </span>
                          ) : isFullBundle ? (
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                              সম্পূর্ণ বান্ডিল
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                              গ্রুপ বাই স্লট
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="bg-stone-900 text-white px-2 py-0.5 rounded font-bold">
                            সাইজ: {order.size}
                          </span>
                          {!isSingleBuy && (
                            <span className="text-stone-600 font-semibold">
                              ব্যাচ #{order.batchNumber}
                            </span>
                          )}
                          <span className="text-emerald-700 font-bold">
                            মোট: ৳{order.groupPrice} (পেইড ৳{Math.min(order.advanceAmount, order.groupPrice)}, বাকি ৳{Math.max(0, order.dueAmount)})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress / Status Block */}
                    {isSingleBuy ? (
                      <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-900 font-medium">
                          <Truck className="w-4 h-4 text-blue-700 shrink-0" />
                          <span>তাত্ক্ষণিক একক অর্ডার — কোনো গ্রুপ ব্যাচ অপেক্ষা নেই, সরাসরি কুরিয়ার প্রস্তুত হচ্ছে।</span>
                        </div>
                        <span className="text-[10px] font-mono bg-white text-blue-800 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                          {order.paymentMethod}
                        </span>
                      </div>
                    ) : isFullBundle ? (
                      <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-900 font-medium">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>সম্পূর্ণ পাইকারি বান্ডিল নিশ্চিত — সরাসরি কারখানা/হোলসেলার প্যাকেজিং সম্পন্ন।</span>
                        </div>
                        <span className="text-[10px] font-mono bg-white text-amber-800 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                          {order.paymentMethod}
                        </span>
                      </div>
                    ) : (
                      /* Batch Progress Bar for Group Buy */
                      <div className="bg-white p-3 rounded-lg border border-stone-200 text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-stone-700 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ব্যাচ #{order.batchNumber} প্রগ্রেস:</span>
                          </span>
                          <span className="font-bold text-stone-900">
                            {filledSlots} / {totalSlots} স্লট বুকড ({progressPercent}%)
                          </span>
                        </div>

                        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? 'bg-emerald-600' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          {isCompleted ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              দল পূর্ণ! হোলসেলার থেকে প্রস্তুত হচ্ছে।
                            </span>
                          ) : (
                            <span className="text-stone-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              আর মাত্র {totalSlots - filledSlots} জন গ্রাহক জয়েন করলেই হোলসেলার অর্ডার শুরু হবে।
                            </span>
                          )}

                          {/* Share button */}
                          <button
                            onClick={() => handleCopyShare(order.id, order.productTitle, order.batchNumber)}
                            className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === order.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>লিংক কপি হয়েছে!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5" />
                                <span>ইনভাইট শেয়ার করুন</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Address & Status row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-1">
                      <div>
                        পার্সেল পাঠানোর ঠিকানা: <span className="text-stone-700 font-medium">{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          স্ট্যাটাস:{' '}
                          {isSingleBuy
                            ? 'একক অর্ডার কনফার্মড'
                            : isFullBundle
                            ? 'বান্ডিল কুরিয়ার প্রসেসিং'
                            : isCompleted
                            ? 'হোলসেলার প্রসেসিং'
                            : 'স্লট নিশ্চিত (দল গঠন চলছে)'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

