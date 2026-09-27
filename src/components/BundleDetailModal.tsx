import React, { useState, useEffect } from 'react';
import { Product, Bundle, BundleSlot } from '../types';
import { useApp } from '../context/AppContext';
import { Users, Clock, PlusCircle, CheckCircle2, Sparkles, TrendingDown, ArrowRight, ShoppingBag, X, ShieldCheck, ExternalLink, Image as ImageIcon, Share2, Check } from 'lucide-react';

interface BundleDetailModalProps {
  product: Product;
  initialBundleId?: string;
  onClose: () => void;
  onSelectSlot: (bundle: Bundle, slot: BundleSlot) => void;
  onStartNewBatch: (product: Product, desiredSize?: string, desiredColor?: string) => void;
  onBuyWholeBundle: (product: Product) => void;
  onSingleBuy: (product: Product, desiredSize?: string) => void;
}

export const BundleDetailModal: React.FC<BundleDetailModalProps> = ({
  product,
  initialBundleId,
  onClose,
  onSelectSlot,
  onStartNewBatch,
  onBuyWholeBundle,
  onSingleBuy,
}) => {
  const { bundles, reviews } = useApp();
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Find all active/existing batches for this product
  const productBundles = bundles
    .filter(b => b.productId === product.id)
    .sort((a, b) => a.batchNumber - b.batchNumber);

  const defaultColors = product.availableColors && product.availableColors.length > 0
    ? product.availableColors
    : ['কালো', 'সাদা', 'ব্রাউন', 'নীল', 'লাল'];

  const [selectedColor, setSelectedColor] = useState<string>(() => {
    if (initialBundleId) {
      const found = productBundles.find(b => b.id === initialBundleId);
      if (found && found.color && defaultColors.includes(found.color)) return found.color;
    }
    const firstOpen = productBundles.find(b => b.status === 'open');
    if (firstOpen && firstOpen.color && defaultColors.includes(firstOpen.color)) return firstOpen.color;
    return defaultColors[0] || 'কালো';
  });

  // Batches matching selected color (or batches without specific color)
  const colorBundles = productBundles.filter(b => !b.color || b.color === selectedColor);

  // Delivered batches of this product
  const deliveredBatches = productBundles.filter(b => b.status === 'shipped');

  // Display list: color batches + any delivered batches of this product
  const displayBundles = [
    ...colorBundles,
    ...deliveredBatches.filter(db => !colorBundles.some(cb => cb.id === db.id))
  ].sort((a, b) => a.batchNumber - b.batchNumber);

  // Active selected batch tab
  const [selectedBatchId, setSelectedBatchId] = useState<string>(() => {
    if (initialBundleId) {
      const found = productBundles.find(b => b.id === initialBundleId);
      if (found) return initialBundleId;
    }
    const firstOpen = colorBundles.find(b => b.status === 'open');
    if (firstOpen) return firstOpen.id;
    return displayBundles[0]?.id || '';
  });

  useEffect(() => {
    if (initialBundleId) {
      setSelectedBatchId(initialBundleId);
      const found = productBundles.find(b => b.id === initialBundleId);
      if (found?.color && defaultColors.includes(found.color)) {
        setSelectedColor(found.color);
      }
    }
  }, [initialBundleId]);

  useEffect(() => {
    if (!selectedBatchId || !productBundles.some(b => b.id === selectedBatchId)) {
      const firstOpen = colorBundles.find(b => b.status === 'open');
      if (firstOpen) {
        setSelectedBatchId(firstOpen.id);
      } else if (displayBundles.length > 0) {
        setSelectedBatchId(displayBundles[0].id);
      }
    }
  }, [productBundles, colorBundles, displayBundles, selectedBatchId]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const matchingBundles = productBundles.filter(b => !b.color || b.color === color);
    const firstOpen = matchingBundles.find(b => b.status === 'open');
    if (firstOpen) {
      setSelectedBatchId(firstOpen.id);
    } else if (matchingBundles.length > 0) {
      setSelectedBatchId(matchingBundles[0].id);
    }
  };

  const activeBundle = productBundles.find(b => b.id === selectedBatchId) || displayBundles[0] || colorBundles[0];

  // Specific reviews for this active batch
  const activeBatchReviews = reviews.filter(r => {
    if (activeBundle) {
      if (r.bundleId && r.bundleId === activeBundle.id) return true;
      if (r.batchNumber && r.batchNumber === activeBundle.batchNumber && r.productId === product.id) return true;
    }
    return false;
  });

  const savingsAmount = product.retailPrice - product.groupPrice;
  const savingsPercent = Math.round((savingsAmount / product.retailPrice) * 100);

  const totalSlots = activeBundle?.totalSlots || product.bundleSize;
  const filledSlots = activeBundle?.filledSlots || 0;
  const remainingSlots = Math.max(0, totalSlots - filledSlots);
  const progressPercent = Math.min(100, Math.round((filledSlots / totalSlots) * 100));

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-white flex flex-col overflow-y-auto animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
              বান্ডিল ও স্লট বুকিং বিস্তারিত
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const url = new URL(window.location.href);
                url.searchParams.set('product', product.id);
                if (activeBundle?.id) {
                  url.searchParams.set('bundle', activeBundle.id);
                }
                const shareUrl = url.toString();
                const shareTitle = `${product.title} - পাইকারি গ্রুপ বাই বান্ডিল`;
                const shareText = `সরাসরি পাইকারি মূল্যে "${product.title}" কিনুন। গ্রুপ বাই স্লট বুক করুন!`;

                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: shareTitle,
                      text: shareText,
                      url: shareUrl,
                    });
                    return;
                  } catch (err: any) {
                    if (err?.name === 'AbortError') return;
                  }
                }

                navigator.clipboard.writeText(shareUrl).then(() => {
                  setCopiedShareLink(true);
                  setTimeout(() => setCopiedShareLink(false), 2500);
                }).catch(() => {});
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                copiedShareLink
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
              title="এই বান্ডিলটি মেসেঞ্জার, হোয়াটসঅ্যাপ বা ফেসবুকে শেয়ার করুন"
            >
              {copiedShareLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>লিংক কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>শেয়ার করুন</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Product Banner & Summary */}
          <div className="flex flex-col sm:flex-row gap-4 bg-stone-50 rounded-2xl p-4 border border-stone-200">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full sm:w-36 h-36 object-cover rounded-xl border border-stone-200 shrink-0"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 bg-stone-900 text-white rounded-md">
                    {product.category}
                  </span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    ৳{savingsAmount} সাশ্রয় ({savingsPercent}%)
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                  {product.title}
                </h3>
                
                {/* Available Colors list */}
                {product.availableColors && product.availableColors.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[11px] font-bold text-stone-600">উপলব্ধ কালার:</span>
                    {product.availableColors.map((col) => (
                      <span key={col} className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {col}
                      </span>
                    ))}
                  </div>
                )}

                {/* Product Description */}
                <div className="mt-2 text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-900 block text-[11px] uppercase tracking-wider text-emerald-800">পণ্যের বিবরণ (Description):</span>
                  <p className="leading-relaxed whitespace-pre-line text-xs font-medium text-stone-800">
                    {product.description || 'পণ্যের বিস্তারিত বিবরণ পেতে সহায়তা প্রয়োজন হলে মেসেজ দিন।'}
                  </p>
                </div>
              </div>

              {/* 3 Price Options Mini Bar */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-stone-200 text-center">
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-1.5">
                  <span className="text-[10px] text-emerald-800 font-bold block">গ্রুপ বাই</span>
                  <span className="text-xs font-black text-emerald-700">৳{product.groupPrice}<span className="text-[9px]">/পিস</span></span>
                </div>
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-1.5">
                  <span className="text-[10px] text-amber-800 font-bold block">পুরো বান্ডিল</span>
                  <span className="text-xs font-black text-amber-800">৳{product.fullBundlePricePerPiece}<span className="text-[9px]">/পিস</span></span>
                </div>
                <div className="bg-blue-50 border border-blue-300 rounded-xl p-1.5">
                  <span className="text-[10px] text-blue-800 font-bold block">একক ক্রয়</span>
                  <span className="text-xs font-black text-blue-700">৳{product.retailPrice}<span className="text-[9px]">/পিস</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Sample YouTube Video Button */}
          {product.youtubeVideoUrl && (
            <a
              href={product.youtubeVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>▶ স্যাম্পল ভিডিও দেখুন (YouTube-এ ওপেন হবে)</span>
            </a>
          )}

          {/* Vertical Scrolling Image List (Main Image + Additional Images) */}
          <div className="space-y-3 bg-stone-100 p-4 rounded-2xl border border-stone-200">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5 mb-2">
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>পণ্যের বিস্তারিত ছবিসমূহ (নিচের দিকে স্ক্রল করে দেখুন):</span>
            </h4>
            <div className="space-y-3">
              {/* Main Image */}
              <div className="bg-white rounded-xl overflow-hidden border border-stone-300 shadow-xs">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full object-cover max-h-[450px]"
                />
                <div className="p-2.5 bg-stone-50 border-t border-stone-200 text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span>প্রধান ছবি (Main Product Image)</span>
                  <span className="text-[10px] bg-stone-900 text-white px-2 py-0.5 rounded">১/{(product.additionalImageUrls?.filter(u => u.trim()).length || 0) + 1}</span>
                </div>
              </div>

              {/* Additional Images */}
              {product.additionalImageUrls && product.additionalImageUrls.map((imgUrl, idx) => imgUrl.trim() && (
                <div key={idx} className="bg-white rounded-xl overflow-hidden border border-stone-300 shadow-xs">
                  <img
                    src={imgUrl.trim()}
                    alt={`${product.title} - ${idx + 2}`}
                    className="w-full object-cover max-h-[450px]"
                  />
                  <div className="p-2.5 bg-stone-50 border-t border-stone-200 text-xs font-bold text-stone-700 flex items-center justify-between">
                    <span>অতিরিক্ত ছবি #{idx + 1}</span>
                    <span className="text-[10px] bg-stone-900 text-white px-2 py-0.5 rounded">{idx + 2}/{(product.additionalImageUrls?.filter(u => u.trim()).length || 0) + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Option 1: Group Buy Batches & Slots Section */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-200/60 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <div>
                  <h4 className="text-sm font-black text-stone-900">অপশন ১: গ্রুপ বাই ব্যাচ ও সাইজ স্লট</h4>
                  <p className="text-[11px] text-stone-600">১টি ব্যাচের সব কয়টি পণ্য সম্পূর্ণ একই কালারের হবে</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onStartNewBatch(product, undefined, selectedColor);
                }}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ নতুন ব্যাচ শুরু করুন</span>
              </button>
            </div>

            {/* Step 1: Color Selection Filter */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-stone-800 flex items-center gap-1">
                <span className="w-1.5 h-3 bg-emerald-600 rounded-full inline-block"></span>
                <span>১. কালার সিলেক্ট করুন (যে কালারের ব্যাচে জয়েন করতে চান):</span>
              </label>
              <div className="flex flex-wrap gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                {defaultColors.map((col) => {
                  const isActive = selectedColor === col;
                  const matchingCount = productBundles.filter(b => b.color === col).length;
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => handleColorChange(col)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span>{col}</span>
                      {matchingCount > 0 ? (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                          isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800 font-bold'
                        }`}>
                          {matchingCount} ব্যাচ
                        </span>
                      ) : (
                        <span className="text-[8px] px-1 bg-stone-200 text-stone-500 rounded font-normal">নতুন</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Show Batch list & Slots */}
            {displayBundles.length > 0 ? (
              <div className="space-y-4 pt-1">
                {/* Batch Tabs */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-500 block">২. ব্যাচ নির্বাচন করুন:</span>
                    {deliveredBatches.length > 0 && (
                      <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        🚚 {deliveredBatches.length}টি ব্যাচ ডেলিভার্ড
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayBundles.map(bundle => {
                      const isSelected = bundle.id === activeBundle?.id;
                      const isCompleted = bundle.filledSlots >= bundle.totalSlots;
                      const isShipped = bundle.status === 'shipped';
                      const bRevCount = reviews.filter(r => r.bundleId === bundle.id).length;

                      return (
                        <button
                          key={bundle.id}
                          onClick={() => {
                            setSelectedBatchId(bundle.id);
                            if (bundle.color && bundle.color !== selectedColor) {
                              setSelectedColor(bundle.color);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-stone-900 text-white shadow-md ring-2 ring-stone-900'
                              : isShipped
                              ? 'bg-blue-50 text-blue-900 border border-blue-300 hover:bg-blue-100'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                          }`}
                        >
                          <span>ব্যাচ #{bundle.batchNumber}</span>
                          {isShipped ? (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                              isSelected ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
                            }`}>
                              🚚 ডেলিভার্ড {bRevCount > 0 ? `(${bRevCount})` : ''}
                            </span>
                          ) : (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-stone-700 text-white' : 'bg-emerald-200 text-emerald-900'
                            }`}>
                              {bundle.filledSlots}/{bundle.totalSlots} পূর্ণ
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Batch Progress / Delivered Tracker */}
                {activeBundle && (
                  <div className={`rounded-xl p-3.5 border shadow-xs space-y-2 animate-in fade-in duration-200 ${
                    activeBundle.status === 'shipped'
                      ? 'bg-blue-50/80 border-blue-200'
                      : 'bg-white border-emerald-200'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={activeBundle.status === 'shipped' ? 'text-blue-950 font-black' : 'text-stone-700'}>
                        ব্যাচ #{activeBundle.batchNumber} {activeBundle.status === 'shipped' ? '(কুরিয়ারে ডেলিভার্ড সম্পন্ন)' : `প্রগ্রেস (${progressPercent}%)`}
                      </span>
                      <span className={activeBundle.status === 'shipped' ? 'text-blue-800 font-bold bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200' : 'text-emerald-800'}>
                        {activeBundle.status === 'shipped' ? '🚚 ডেলিভারি সম্পন্ন' : `${filledSlots} / ${totalSlots} স্লট পূর্ণ`}
                      </span>
                    </div>
                    {activeBundle.status !== 'shipped' && (
                      <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}
                    <div className="text-[11px] text-stone-600 flex items-center gap-1.5">
                      {activeBundle.status === 'shipped' ? (
                        <span className="text-blue-900 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          🎉 এই ব্যাচের সব পণ্য কুরিয়ারে সফলভাবে ডেলিভারি করা হয়েছে! নিচে এই ব্যাচের গ্রাহকদের রিভিউ ও বাস্তব ছবি দেখতে পারবেন।
                        </span>
                      ) : filledSlots >= totalSlots ? (
                        <span className="text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          স্লট সম্পূর্ণ হয়েছে! হোলসেলার অর্ডার প্রক্রিয়াজাত হচ্ছে।
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          আর মাত্র <strong className="text-stone-900">{remainingSlots} জন</strong> যুক্ত হলেই ব্যাচ কনফার্ম হবে!
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Slots Grid */}
                <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                  <span className="text-xs font-bold text-stone-700 block">৩. আপনার সাইজ নির্বাচন করুন ও বুক করুন:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {(activeBundle?.slots || []).map(slot => {
                      const isAvailable = slot.status === 'available' && activeBundle?.status !== 'shipped';
                      return (
                        <button
                          key={slot.id}
                          disabled={!isAvailable}
                          onClick={() => {
                            if (isAvailable) {
                              onSelectSlot(activeBundle, slot);
                            }
                          }}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            isAvailable
                              ? 'border-emerald-300 bg-white hover:bg-emerald-50 hover:border-emerald-500 shadow-xs cursor-pointer group/slot'
                              : 'border-stone-200 bg-stone-100 text-stone-700 cursor-not-allowed opacity-90'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-bold ${isAvailable ? 'text-stone-900' : 'text-stone-800'}`}>
                              সাইজ {slot.size}
                            </span>
                            {isAvailable ? (
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            ) : (
                              <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                                {activeBundle?.status === 'shipped' ? 'ডেলিভার্ড' : 'বুকড'}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-[11px]">
                            {isAvailable ? (
                              <span className="text-emerald-700 font-bold group-hover/slot:underline flex items-center gap-1">
                                স্লট বুক করুন <ArrowRight className="w-3 h-3" />
                              </span>
                            ) : (
                              <span className="text-stone-600 block truncate font-medium">
                                {slot.userPhoneMasked || 'সংরক্ষিত'} • {activeBundle?.status === 'shipped' ? 'ডেলিভার্ড' : 'বুকড'}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
          ) : (
            <div className="text-center py-10 px-4 bg-white rounded-2xl border border-dashed border-stone-300 space-y-3.5 animate-in fade-in duration-200">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-800">
                  "{selectedColor}" কালারের কোনো সক্রিয় গ্রুপ-বাই ব্যাচ এখনো শুরু হয়নি।
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  আপনিই প্রথম বুকিং করে "{selectedColor}" কালারের ১ নম্বর ব্যাচটি শুরু করতে পারেন!
                </p>
              </div>
              <button
                onClick={() => {
                  onStartNewBatch(product, undefined, selectedColor);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>"{selectedColor}" কালারের ১ম ব্যাচ শুরু করুন</span>
              </button>
            </div>
          )}
        </div>

          {/* Option 2 Direct Purchase Actions (Single Buy) */}
          <div className="pt-2 border-t border-stone-200">
            {/* Option 2: Single Buy */}
            <button
              onClick={() => {
                onSingleBuy(product);
                onClose();
              }}
              className="w-full p-4 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-2xl text-left flex flex-col justify-between transition-all cursor-pointer group/sb shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  <span>সরাসরি অর্ডার: একক ক্রয় (Single Buy)</span>
                </span>
                <span className="text-xs bg-blue-200 text-blue-900 font-black px-2 py-0.5 rounded-full">
                  ১ পিস
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-blue-950">৳{product.retailPrice} (কোনো বান্ডিল মেম্বারশিপের প্রয়োজন নেই)</span>
                <span className="text-xs font-bold text-blue-800 flex items-center gap-1 group-hover/sb:translate-x-1 transition-transform">
                  কিনুন <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          </div>

          {/* Customer Reviews & Photos Section (Batch Specific) */}
          <div className="pt-4 border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                <span className="text-sm">⭐</span>
                <span>
                  {activeBundle ? `ব্যাচ #${activeBundle.batchNumber} এর রিভিউজ ও বাস্তব ছবি` : 'গ্রাহকদের রিভিউজ'} ({activeBatchReviews.length})
                </span>
              </h4>
              {activeBundle && (
                <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-semibold border border-stone-200">
                  ব্যাচ #{activeBundle.batchNumber} {activeBundle.status === 'shipped' ? '• ডেলিভার্ড' : '• চলমান'}
                </span>
              )}
            </div>
            
            {activeBatchReviews.length === 0 ? (
              <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl text-center text-[11px] text-stone-500">
                🌱 {activeBundle ? `ব্যাচ #${activeBundle.batchNumber}` : 'এই ব্যাচ'}-এ এখনও কোনো রিভিউ দেওয়া হয়নি। উপরে অন্য কোনো ডেলিভার্ড ব্যাচে ক্লিক করে ওই ব্যাচের ক্রেতাদের রিভিউ ও বাস্তব ছবি দেখতে পারেন!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                {activeBatchReviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-2 text-left">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-800">{rev.customerName}</span>
                        {activeBundle && (
                          <span className="text-[9px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-medium">
                            ব্যাচ #{activeBundle.batchNumber}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        rev.reviewType === 'happy'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {rev.reviewType === 'happy' ? '😊 সন্তুষ্ট ক্রেতা' : '😟 রিফান্ড অনুরোধ'}
                      </span>
                    </div>
                    {rev.reviewText && (
                      <p className="text-xs text-stone-700 leading-relaxed font-medium">
                        "{rev.reviewText}"
                      </p>
                    )}
                    {rev.reviewImage && (
                      <div className="flex items-center gap-2 pt-0.5">
                        <img
                          src={rev.reviewImage}
                          alt="Review attachment"
                          onClick={() => setZoomedImage(rev.reviewImage || null)}
                          className="w-14 h-14 rounded-xl object-cover border border-stone-200 cursor-zoom-in hover:opacity-90 active:scale-95 transition-all shadow-xs"
                        />
                        <span className="text-[10px] text-stone-400 font-medium">বাস্তব ছবি (ক্লিক করে বড় করুন)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guarantee Footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-stone-500 pt-2 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>১০০% নিরাপদ লেনদেন • ক্যাশ অন ডেলিভারি • মানি ব্যাক গ্যারান্টি</span>
          </div>

        </div>

      {/* Image Zoom Modal Overlay */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-lg w-full max-h-[85vh] flex items-center justify-center">
            <img 
              src={zoomedImage} 
              alt="Zoomed Review Attachment" 
              className="rounded-3xl max-w-full max-h-[80vh] object-contain border border-stone-800 shadow-2xl"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-10 right-0 p-2 bg-stone-900/80 hover:bg-stone-900 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
