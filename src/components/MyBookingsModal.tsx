import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Share2,
  Copy,
  Check,
  Users,
  Search,
  User as UserIcon,
  Phone,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Order } from '../types';

export const MyBookingsModal: React.FC = () => {
  const { myBookingsOpen, setMyBookingsOpen, orders, bundles, user, findOrderByIdOrCustomer } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchingRemote, setSearchingRemote] = useState(false);
  const [remoteResults, setRemoteResults] = useState<Order[] | null>(null);

  if (!myBookingsOpen) return null;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyShare = (orderId: string, productTitle: string, batchNumber: number) => {
    const text = `আমি "${productTitle}" এর ব্যাচ #${batchNumber}-এ পাইকারি মূল্যে স্লট বুক করেছি! বাকি স্লটগুলো পূরণ হলে সরাসরি হোলসেলার থেকে মাল পাঠানো হবে। আপনার সাইজ বুক করতে জয়েন করুন: ${window.location.origin}`;
    handleCopyText(text, orderId);
  };

  const handleSearchDatabase = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setRemoteResults(null);
      return;
    }
    setSearchingRemote(true);
    try {
      const results = await findOrderByIdOrCustomer(searchQuery.trim());
      setRemoteResults(results);
    } catch {
      setRemoteResults([]);
    } finally {
      setSearchingRemote(false);
    }
  };

  // Orders to display: either remote search results or user's filtered orders
  const displayedOrders = remoteResults !== null
    ? remoteResults
    : searchQuery.trim()
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerPhone?.includes(searchQuery) ||
          o.contactPhone?.includes(searchQuery) ||
          o.productTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

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
              <h2 className="text-base font-bold text-stone-900">স্লট ও বুকিং হিস্ট্রি</h2>
              <p className="text-xs text-stone-500">অর্ডার ট্র্যাকিং ও কাস্টমার স্লট বিবরণ</p>
            </div>
          </div>
          <button
            onClick={() => {
              setMyBookingsOpen(false);
              setRemoteResults(null);
              setSearchQuery('');
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Identification Badge */}
        {user && (
          <div className="bg-emerald-50/60 border-b border-emerald-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800">কাস্টমার: {user.fullName}</span>
              <span className="text-stone-400">•</span>
              <span className="text-stone-600 font-mono">আইডি: {user.id}</span>
            </div>
            <button
              onClick={() => handleCopyText(user.id, 'cust-id')}
              className="flex items-center gap-1 text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold bg-white border border-emerald-200 px-2 py-0.5 rounded cursor-pointer"
            >
              {copiedId === 'cust-id' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedId === 'cust-id' ? 'কপি হয়েছে' : 'কাস্টমার আইডি কপি'}</span>
            </button>
          </div>
        )}

        {/* Order / Customer ID Search Bar */}
        <div className="p-4 border-b border-stone-100 bg-stone-50/50">
          <form onSubmit={handleSearchDatabase} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="অর্ডার আইডি (ord-...) বা কাস্টমার আইডি (cust-...) দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) setRemoteResults(null);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setRemoteResults(null);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={searchingRemote}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              {searchingRemote ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>আইডি দিয়ে খুঁজুন</span>
            </button>
          </form>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 flex-1">
          {displayedOrders.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-stone-800">
                {searchQuery ? 'এই আইডিতে কোনো অর্ডার পাওয়া যায়নি' : 'এখনো কোনো স্লট বুক করা হয়নি'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
                {searchQuery
                  ? 'অনুগ্রহ করে সঠিক অর্ডার আইডি বা কাস্টমার আইডি লিখুন।'
                  : 'যেকোনো পণ্যের সাইজ স্লটে ক্লিক করে মাত্র ১৫০ টাকা অগ্রিম দিয়ে হোলসেলার বান্ডিলে যুক্ত হন।'}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setRemoteResults(null);
                  }}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  সবগুলো অর্ডার দেখুন
                </button>
              ) : (
                <button
                  onClick={() => setMyBookingsOpen(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  পণ্যসমূহ দেখুন
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedOrders.map((order) => {
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
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h4 className="font-bold text-stone-900 text-sm truncate">{order.productTitle}</h4>
                          {/* Order ID Badge */}
                          <button
                            onClick={() => handleCopyText(order.id, order.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-600 bg-white border border-stone-200 px-1.5 py-0.5 rounded hover:bg-stone-100 cursor-pointer"
                            title="অর্ডার আইডি কপি করুন"
                          >
                            <span>#{order.id}</span>
                            {copiedId === order.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-stone-400" />
                            )}
                          </button>
                        </div>

                        {/* Customer ID & Info */}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-stone-500">
                          {order.customerId && (
                            <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
                              কাস্টমার আইডি: {order.customerId}
                            </span>
                          )}
                          {order.customerPhone && (
                            <span className="font-mono text-stone-600">
                              মোবাইল: {order.customerPhone}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                          <span className="bg-stone-900 text-white px-2 py-0.5 rounded font-bold">
                            সাইজ: {order.size}
                          </span>
                          <span className="text-stone-600 font-semibold">
                            ব্যাচ #{order.batchNumber}
                          </span>
                          <span className="text-emerald-700 font-bold">
                            মোট: ৳{order.groupPrice} (টোকেন পেইড ৳{order.advanceAmount}, বাকি ৳{order.dueAmount})
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
                            দল পূর্ণ! হোলসেলার থেকে মাল সরবরাহ হচ্ছে।
                          </span>
                        ) : (
                          <span className="text-stone-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            আর মাত্র {totalSlots - filledSlots} জন গ্রাহক জয়েন করলেই হোলসেলার ডেলিভারি দেবে।
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

                    {/* Delivery & Status row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-1">
                      <div>
                        ঠিকানা: <span className="text-stone-700 font-medium">{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <Truck className="w-3.5 h-3.5" />
                        <span>স্ট্যাটাস: {isCompleted ? 'হোলসেলার অর্ডার কনফার্ম' : 'স্লট নিশ্চিত (দল অপেক্ষমান)'}</span>
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
