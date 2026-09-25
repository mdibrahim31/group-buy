import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { X, PlusCircle, CheckCircle, Sparkles, Layers, Info } from 'lucide-react';

interface StartNewBatchModalProps {
  product: Product;
  preselectedSize?: string;
  preselectedColor?: string;
  onClose: () => void;
  onSuccess: (newBatchNumber: number) => void;
}

export const StartNewBatchModal: React.FC<StartNewBatchModalProps> = ({
  product,
  preselectedSize,
  preselectedColor,
  onClose,
  onSuccess,
}) => {
  const { user, createNewBatchForProduct, bundles } = useApp();

  const existingBatchesCount = bundles.filter(b => b.productId === product.id).length;
  const nextBatchNumber = existingBatchesCount + 1;

  const defaultColors = product.availableColors && product.availableColors.length > 0
    ? product.availableColors
    : ['কালো', 'সাদা', 'ব্রাউন', 'নীল', 'লাল'];

  const [selectedSize, setSelectedSize] = useState<string>(
    preselectedSize || product.availableSizes[0] || '৪০'
  );
  const [selectedColor, setSelectedColor] = useState<string>(preselectedColor || defaultColors[0] || 'কালো');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.deliveryAddress || '');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tokenAmount = 150;

  const handleStartBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('আপনার নাম প্রদান করুন।');
      return;
    }
    if (!phone.trim() || phone.length < 11) {
      setError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }
    if (!address.trim()) {
      setError('ডেলিভারি ঠিকানা দিন।');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const result = createNewBatchForProduct(
        product.id,
        selectedSize,
        tokenAmount,
        paymentMethod,
        address,
        phone,
        fullName,
        transactionId.trim(),
        selectedColor
      );

      setLoading(false);
      if (result.success) {
        onSuccess(result.newBatchNumber);
      } else {
        setError(result.message);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">নতুন ব্যাচ চালু করুন (ব্যাচ #{nextBatchNumber})</h2>
              <p className="text-xs text-stone-500">আপনার সাইজ নিশ্চিত করে নতুন দল শুরু করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleStartBatch} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Product Banner */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex gap-3 items-center">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-14 h-14 rounded-lg object-cover border border-stone-200"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-stone-900 text-sm truncate">{product.title}</h4>
              <p className="text-xs text-stone-500">
                এই পণ্যের প্রতি বান্ডিলে <strong className="text-stone-800 font-bold">{product.bundleSize} টি সাইজ</strong> থাকে।
              </p>
              <div className="text-xs font-bold text-emerald-700 mt-0.5">
                গ্রুপ বাই মূল্য: ৳{product.groupPrice} (খুচরা ৳{product.retailPrice})
              </div>
            </div>
          </div>

          {/* Explanatory Info Card */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>কীভাবে এটি কাজ করবে?</strong><br />
              আপনি নতুন ব্যাচ শুরু করে আপনার সাইজ বুক করবেন (১/{product.bundleSize} স্লট পূরণ)।
              বাকি {product.bundleSize - 1} টি সাইজের স্লটে অন্য কাস্টমাররা যুক্ত হবে অথবা আপনিও বন্ধুদের ইনভাইট করে দ্রুত পূর্ণ করতে পারবেন।
            </div>
          </div>

          {/* Select Size to Book First */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
              আপনার কাঙ্ক্ষিত সাইজ নির্বাচন করুন *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Array.from(new Set(product.availableSizes)).map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    selectedSize === size
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : 'border-stone-200 bg-stone-50 text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  সাইজ {size}
                </button>
              ))}
            </div>
          </div>

          {/* Select Color */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
              আপনার পছন্দের কালার নির্বাচন করুন *
            </label>
            <div className="flex flex-wrap gap-2">
              {defaultColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedColor === color
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : 'border-stone-200 bg-stone-50 text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Contact & Address */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">আপনার তথ্য</h4>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">পূর্ণ নাম *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="আপনার নাম"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">মোবাইল নম্বর *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">ডেলিভারি ঠিকানা *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="সম্পূর্ণ ডেলিভারি ঠিকানা..."
                rows={2}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'ব্যাচ তৈরি হচ্ছে...' : `ব্যাচ #${nextBatchNumber} শুরু ও সাইজ ${selectedSize} বুক করুন`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
