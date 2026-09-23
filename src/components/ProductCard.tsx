import React, { useState } from 'react';
import { Product, Bundle, BundleSlot } from '../types';
import { useApp } from '../context/AppContext';
import { Users, Clock, PlusCircle, CheckCircle2, AlertCircle, Sparkles, TrendingDown, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectSlot: (bundle: Bundle, slot: BundleSlot) => void;
  onStartNewBatch: (product: Product, desiredSize?: string) => void;
  onBuyWholeBundle: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectSlot,
  onStartNewBatch,
  onBuyWholeBundle,
}) => {
  const { bundles } = useApp();
  
  // Find all active/existing batches for this product
  const productBundles = bundles
    .filter(b => b.productId === product.id)
    .sort((a, b) => a.batchNumber - b.batchNumber);

  // Active selected batch tab
  const [selectedBatchId, setSelectedBatchId] = useState<string>(() => {
    // Pick the first open batch, or the latest batch
    const firstOpen = productBundles.find(b => b.status === 'open');
    return firstOpen ? firstOpen.id : (productBundles[0]?.id || '');
  });

  // Current active bundle object
  const activeBundle = productBundles.find(b => b.id === selectedBatchId) || productBundles[0];

  const savingsAmount = product.retailPrice - product.groupPrice;
  const savingsPercent = Math.round((savingsAmount / product.retailPrice) * 100);

  // Calculate batch progress
  const totalSlots = activeBundle?.totalSlots || product.bundleSize;
  const filledSlots = activeBundle?.filledSlots || 0;
  const remainingSlots = Math.max(0, totalSlots - filledSlots);
  const progressPercent = Math.min(100, Math.round((filledSlots / totalSlots) * 100));

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden group">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Savings Badge */}
        <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>৳{savingsAmount.toLocaleString()} সাশ্রয় ({savingsPercent}%)</span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
          {product.category}
        </div>

        {/* Wholesale vs Group Price overlay footer */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950/95 via-stone-950/70 to-transparent p-3 pt-6 text-white flex items-end justify-between">
          <div>
            <div className="text-[11px] text-stone-300 flex items-center gap-2">
              <span>খুচরা: <del className="text-stone-400">৳{product.retailPrice}</del></span>
              <span className="text-emerald-400 font-medium">হোলসেল: ৳{product.wholesalePrice}</span>
            </div>
            <div className="text-sm font-bold text-white flex items-baseline gap-1 mt-0.5">
              <span>গ্রুপ বাই:</span>
              <span className="text-lg text-emerald-400 font-extrabold">৳{product.groupPrice}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-amber-400 text-stone-950 font-extrabold px-1.5 py-0.5 rounded">
              পুরো বান্ডিল অফার
            </span>
            <div className="text-xs font-bold text-amber-300 mt-0.5">
              ৳{product.fullBundlePricePerPiece} <span className="text-[10px] text-stone-300 font-normal">/পিস</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-stone-900 leading-snug line-clamp-1">
            {product.title}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2">
            {product.description}
          </p>

          {/* Batches Navigation Tabs */}
          <div className="mt-4 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-stone-700">চলমান ব্যাচসমূহ:</span>
              <button
                onClick={() => onStartNewBatch(product)}
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-[11px] hover:underline"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ নতুন ব্যাচ শুরু করুন</span>
              </button>
            </div>

            {/* Batch Pill Tabs */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {productBundles.map(bundle => {
                const isSelected = bundle.id === activeBundle?.id;
                const isCompleted = bundle.filledSlots >= bundle.totalSlots;
                return (
                  <button
                    key={bundle.id}
                    onClick={() => setSelectedBatchId(bundle.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    <span>ব্যাচ #{bundle.batchNumber}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-stone-700 text-white'
                          : isCompleted
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {bundle.filledSlots}/{bundle.totalSlots}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Batch Tracker Details */}
          {activeBundle && (
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-stone-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ব্যাচ #{activeBundle.batchNumber} প্রগ্রেস ({progressPercent}%)</span>
                </span>
                <span className="font-bold text-stone-900">
                  {filledSlots} / {totalSlots} স্লট পূর্ণ
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    activeBundle.status === 'completed' || filledSlots >= totalSlots
                      ? 'bg-emerald-600'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Urgency message */}
              <div className="mt-2 text-[11px] text-stone-600 flex items-center justify-between">
                {filledSlots >= totalSlots ? (
                  <span className="text-emerald-800 bg-emerald-100/90 border border-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>✓ স্লট পূরণ হয়েছে (Slot Completed) - হোলসেলার অর্ডার প্রক্রিয়াধীন</span>
                  </span>
                ) : (
                  <span className="text-stone-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    আর মাত্র <strong className="text-stone-900 font-bold">{remainingSlots} জন</strong> যুক্ত হলেই পাইকারি রেটে সরবরাহ!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Slots / Size Grid */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-600 font-medium px-1">
              <span>সাইজ নির্বাচন করুন:</span>
              <span className="text-[11px] text-stone-400">টোকেন অগ্রিম: ৳১৫০</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(activeBundle?.slots || []).map((slot) => {
                const isAvailable = slot.status === 'available';

                return (
                  <button
                    key={slot.id}
                    onClick={() => {
                      if (isAvailable) {
                        onSelectSlot(activeBundle, slot);
                      } else {
                        // If booked, suggest starting a new batch for this size
                        onStartNewBatch(product, slot.size);
                      }
                    }}
                    className={`relative p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isAvailable
                        ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-100 hover:border-emerald-500 text-stone-900 group/btn cursor-pointer shadow-xs'
                        : 'border-stone-200 bg-stone-100 text-stone-400 cursor-pointer hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${isAvailable ? 'text-stone-900' : 'text-stone-500 line-through'}`}>
                        সাইজ {slot.size}
                      </span>
                      {isAvailable ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      ) : (
                        <span className="text-[9px] bg-stone-200 text-stone-600 px-1 rounded font-medium">বুকড</span>
                      )}
                    </div>

                    <div className="mt-1 text-[10px]">
                      {isAvailable ? (
                        <span className="text-emerald-700 font-semibold group-hover/btn:underline flex items-center gap-0.5">
                          বুক করুন <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      ) : (
                        <span className="text-stone-500 block truncate" title="অন্য ব্যাচে নিতে ক্লিক করুন">
                          {slot.userPhoneMasked || 'বুকড'} • নতুন ব্যাচে নিন
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Whole Bundle Direct Buy CTA */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col gap-2">
          <button
            onClick={() => onBuyWholeBundle(product)}
            className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-xs cursor-pointer group/wb"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>সম্পূর্ণ বান্ডিল কিনুন ({product.bundleSize} পিস)</span>
            </span>
            <span className="flex items-center gap-1 font-extrabold text-amber-900">
              <span>৳{product.fullBundlePricePerPiece}/পিস</span>
              <ArrowRight className="w-3 h-3 group-hover/wb:translate-x-0.5 transition-transform" />
            </span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
            <span>টোকেন অগ্রিম: ৳১৫০ (একক)</span>
            <button
              onClick={() => onStartNewBatch(product)}
              className="text-stone-600 hover:text-stone-900 font-semibold underline cursor-pointer"
            >
              অন্য সাইজের ব্যাচ চান?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
