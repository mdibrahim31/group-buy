import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
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
  Trash2,
  ArrowRight,
} from 'lucide-react';

interface MyBookingsModalProps {
  onViewBundle?: (product: Product, bundleId?: string) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({ onViewBundle }) => {
  const {
    myBookingsOpen,
    setMyBookingsOpen,
    myOrders,
    products,
    bundles,
    cancelOrder,
  } = useApp();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!myBookingsOpen) return null;

  const handleCopyShare = (orderId: string, productTitle: string, batchNumber: number) => {
    const text = `আমি "${productTitle}" এর ব্যাচ #${batchNumber}-এ পাইকারি মূল্যে স্লট বুক করেছি! বাকি স্লটগুলো পূরণ হলে সরাসরি হোলসেলার থেকে মাল পাঠানো হবে। আপনার সাইজ বুক করতে জয়েন করুন: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRemoveFromSlot = async (orderId: string, productTitle: string, size: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${productTitle}" (সাইজ: ${size}) এর স্লট থেকে নিজেকে রিমুভ করতে চান? এর ফলে ডাটাবেজের orders টেবিল থেকে আপনার অর্ডারটি মুছে যাবে।`)) {
      const res = await cancelOrder(orderId);
      if (res.success) {
        alert(res.message || 'আপনাকে সফলভাবে স্লট থেকে রিমুভ করা হয়েছে এবং ডাটাবেজ থেকে অর্ডার মুছে দেওয়া হয়েছে।');
      }
    }
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
              <h2 className="text-base font-bold text-stone-900">
                আমার স্লট ও বুকিং ({myOrders.length})
              </h2>
              <p className="text-xs text-stone-500">
                আপনার বুক করা সাইজ স্লট ও ব্যাচের বর্তমান অবস্থা
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

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 flex-1">
          {myOrders.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-stone-800">এখনো কোনো স্লট বুক করা হয়নি</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
                যেকোনো পণ্যের সাইজ স্লটে ক্লিক করে হোলসেলার বান্ডিলে যুক্ত হন।
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
              {myOrders.map((order) => {
                const isSingleBuy = order.isSingleBuy || order.orderType === 'single_buy' || order.bundleId === 'single-buy';
                const isFullBundle = order.isFullBundle || order.orderType === 'full_bundle';

                const targetBundle = bundles.find((b) => b.id === order.bundleId);
                const matchedProduct = products.find((p) => p.id === order.productId);
                const totalSlots = targetBundle?.totalSlots || 6;
                const filledSlots = targetBundle?.filledSlots || 0;
                const isCompleted = isSingleBuy || isFullBundle || filledSlots >= totalSlots;
                const progressPercent = Math.min(100, Math.round((filledSlots / totalSlots) * 100));

                const handleNavigateToBundle = () => {
                  if (matchedProduct && onViewBundle) {
                    setMyBookingsOpen(false);
                    onViewBundle(matchedProduct, order.bundleId);
                  }
                };

                return (
                  <div
                    key={order.id}
                    onClick={handleNavigateToBundle}
                    className={`border border-stone-200 rounded-2xl p-4 bg-stone-50/50 hover:bg-white hover:border-emerald-400 hover:shadow-md transition-all space-y-3 ${
                      matchedProduct && onViewBundle ? 'cursor-pointer group/card' : ''
                    }`}
                  >
                    {/* Top Row: Item Details */}
                    <div className="flex gap-3 items-center justify-between">
                      <div className="flex gap-3 items-center min-w-0 flex-1">
                        <img
                          src={order.productImage}
                          alt={order.productTitle}
                          className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0 group-hover/card:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <h4 className="font-bold text-stone-900 text-sm truncate group-hover/card:text-emerald-800 transition-colors">
                              {order.productTitle}
                            </h4>
                            {isSingleBuy ? (
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                                একক ক্রয়
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
                            {order.color && (
                              <span className="bg-emerald-700 text-white px-2 py-0.5 rounded font-bold">
                                কালার: {order.color}
                              </span>
                            )}
                            {!isSingleBuy && (
                              <span className="text-stone-700 font-bold bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                                ব্যাচ #{order.batchNumber}
                              </span>
                            )}
                            <span className="text-emerald-700 font-bold">
                              মোট: ৳{order.groupPrice}
                            </span>
                          </div>
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

                    {/* Address & Status row & Remove Button */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-2 border-t border-stone-200">
                      <div>
                        পার্সেল পাঠানোর ঠিকানা: <span className="text-stone-700 font-medium">{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
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
                        <button
                          onClick={() => handleRemoveFromSlot(order.id, order.productTitle, order.size)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-md font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="স্লট থেকে বের হউন ও অর্ডার বাতিল করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>স্লট থেকে রিমুভ</span>
                        </button>
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

