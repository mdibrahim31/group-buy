import React from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { X, Bookmark, Trash2, ArrowRight, Layers, Users, TrendingDown, Sparkles } from 'lucide-react';

interface SavedBundlesModalProps {
  onViewBundle: (product: Product) => void;
}

export const SavedBundlesModal: React.FC<SavedBundlesModalProps> = ({ onViewBundle }) => {
  const {
    savedProductIds,
    savedModalOpen,
    setSavedModalOpen,
    products,
    bundles,
    toggleSaveProduct,
  } = useApp();

  if (!savedModalOpen) return null;

  const savedProducts = products.filter(p => savedProductIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Bookmark className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                  সেভ করা বান্ডিলসমূহ
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {savedProducts.length}টি
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                আপনার পছন্দের বান্ডিল ও স্লটগুলোর সংরক্ষিত তালিকা
              </p>
            </div>
          </div>

          <button
            onClick={() => setSavedModalOpen(false)}
            className="w-9 h-9 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {savedProducts.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3 bg-stone-50/70 rounded-2xl border border-dashed border-stone-300">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
                <Bookmark className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-stone-800">
                আপনার কোনো সেভ করা বান্ডিল নেই
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                পছন্দের প্রোডাক্ট বা বান্ডিল পরবর্তীতে দেখার জন্য কার্ডের উপর বুকমার্ক (🔖) আইকন অথবা বান্ডিল পেজের সেভ বাটনে ট্যাপ করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedProducts.map(product => {
                const productBundles = bundles
                  .filter(b => b.productId === product.id)
                  .sort((a, b) => a.batchNumber - b.batchNumber);

                const activeBundle = productBundles.find(b => b.status === 'open') || productBundles[0];
                const totalSlots = activeBundle?.totalSlots || product.bundleSize;
                const filledSlots = activeBundle?.filledSlots || 0;
                const progressPercent = Math.min(100, Math.round((filledSlots / totalSlots) * 100));
                const savingsAmount = product.retailPrice - product.groupPrice;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                  >
                    {/* Left: Product Thumbnail & Info */}
                    <div className="flex gap-3.5 items-center flex-1 min-w-0">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-20 h-20 rounded-xl object-cover border border-stone-200 shrink-0 shadow-3xs"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-stone-900 text-white px-2 py-0.5 rounded">
                            {product.category}
                          </span>
                          <span className="text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            ৳{savingsAmount} সাশ্রয়
                          </span>
                        </div>
                        <h4 className="font-bold text-stone-900 text-sm sm:text-base truncate leading-snug">
                          {product.title}
                        </h4>
                        <div className="text-xs font-black text-emerald-700">
                          ৳{product.groupPrice} <span className="text-[10px] font-normal text-stone-500">/পিস (খুচরা ৳{product.retailPrice})</span>
                        </div>

                        {/* Batch summary */}
                        {activeBundle && (
                          <div className="flex items-center gap-2 text-[11px] text-stone-600 pt-0.5">
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ব্যাচ #{activeBundle.batchNumber}: {filledSlots}/{totalSlots} বুকড</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSavedModalOpen(false);
                          onViewBundle(product);
                        }}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                      >
                        <span>বান্ডিল দেখুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSaveProduct(product.id)}
                        className="p-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-stone-200 hover:border-rose-200"
                        title="রিমুভ করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>পছন্দের সব বান্ডিল সহজে এক জায়গায় পেয়ে যান</span>
          <button
            onClick={() => setSavedModalOpen(false)}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
