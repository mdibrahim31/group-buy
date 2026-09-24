import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { Users, Sparkles, TrendingDown, ArrowRight, ShoppingBag, Layers, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenBundleModal: (product: Product) => void;
  onBuyWholeBundle: (product: Product) => void;
  onSingleBuy: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenBundleModal,
  onBuyWholeBundle,
  onSingleBuy,
}) => {
  const { bundles } = useApp();
  
  // Find all active/existing batches for this product
  const productBundles = bundles
    .filter(b => b.productId === product.id)
    .sort((a, b) => a.batchNumber - b.batchNumber);

  const activeBundle = productBundles.find(b => b.status === 'open') || productBundles[0];

  const savingsAmount = product.retailPrice - product.groupPrice;
  const savingsPercent = Math.round((savingsAmount / product.retailPrice) * 100);

  const totalSlots = activeBundle?.totalSlots || product.bundleSize;
  const filledSlots = activeBundle?.filledSlots || 0;
  const progressPercent = Math.min(100, Math.round((filledSlots / totalSlots) * 100));

  return (
    <div 
      onClick={() => onOpenBundleModal(product)}
      className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col cursor-pointer group"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
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

        {/* 3 Price Options Overlay Banner */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950/95 via-stone-950/80 to-transparent p-3 pt-6 text-white">
          <div className="grid grid-cols-3 gap-1.5 text-center">
            {/* Option 1: Group Buy */}
            <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-lg p-1.5">
              <span className="text-[9px] text-emerald-300 font-bold block">১. গ্রুপ বাই</span>
              <span className="text-xs font-extrabold text-emerald-400">৳{product.groupPrice}</span>
            </div>

            {/* Option 2: Full Bundle */}
            <div className="bg-amber-950/70 border border-amber-500/40 rounded-lg p-1.5">
              <span className="text-[9px] text-amber-300 font-bold block">২. পুরো বান্ডিল</span>
              <span className="text-xs font-extrabold text-amber-300">৳{product.fullBundlePricePerPiece}<span className="text-[9px] font-normal">/পিস</span></span>
            </div>

            {/* Option 3: Single Buy */}
            <div className="bg-blue-950/70 border border-blue-500/40 rounded-lg p-1.5">
              <span className="text-[9px] text-blue-300 font-bold block">৩. একক ক্রয়</span>
              <span className="text-xs font-extrabold text-blue-300">৳{product.retailPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {product.title}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2">
            {product.description}
          </p>

          {/* Active Batch Summary Status */}
          {activeBundle && (
            <div className="mt-3.5 bg-stone-50 rounded-xl p-3 border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-stone-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ব্যাচ #{activeBundle.batchNumber} প্রগ্রেস:</span>
                </span>
                <span className="font-bold text-stone-900">
                  {filledSlots} / {totalSlots} স্লট পূর্ণ ({progressPercent}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Enter Bundle & Slots Footer */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>{productBundles.length}টি ব্যাচ উপলব্ধ</span>
          </div>
          <span className="text-emerald-700 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>স্লট বুক করতে ক্লিক করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

      </div>
    </div>
  );
};
