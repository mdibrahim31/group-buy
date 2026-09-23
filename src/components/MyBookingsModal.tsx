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
} from 'lucide-react';

export const MyBookingsModal: React.FC = () => {
  const { myBookingsOpen, setMyBookingsOpen, orders, bundles } = useApp();
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
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">আমার স্লট ও বুকিং</h2>
              <p className="text-xs text-stone-500">আপনার বুক করা সাইজ স্লট ও ব্যাচের বর্তমান অবস্থা</p>
            </div>
          </div>
          <button
            onClick={() => setMyBookingsOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 flex-1">
          {orders.length === 0 ? (
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
                const targetBundle = bundles.find((b) => b.id === order.bundleId);
                const totalSlots = targetBundle?.totalSlots || 6;
                const filledSlots = targetBundle?.filledSlots || 0;
                const isCompleted = filledSlots >= totalSlots;
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
                        <h4 className="font-bold text-stone-900 text-sm truncate">{order.productTitle}</h4>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                          <span className="bg-stone-900 text-white px-2 py-0.5 rounded font-bold">
                            সাইজ: {order.size}
                          </span>
                          <span className="text-stone-600 font-semibold">
                            ব্যাচ #{order.batchNumber}
                          </span>
                          <span className="text-emerald-700 font-bold">
                            মোট: ৳{order.groupPrice} (টোকেন পেইড ৳{Math.min(order.advanceAmount, order.groupPrice)}, বাকি ৳{Math.max(0, order.dueAmount)})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Batch Progress Bar */}
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

                    {/* Address & Status row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-1">
                      <div>
                        পার্সেল পাঠানোর ঠিকানা: <span className="text-stone-700 font-medium">{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>স্ট্যাটাস: {isCompleted ? 'হোলসেলার প্রসেসিং' : 'স্লট নিশ্চিত (দল গঠন চলছে)'}</span>
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
