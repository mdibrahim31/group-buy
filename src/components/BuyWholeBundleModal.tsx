import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, Package, ShieldCheck, Sparkles, TrendingDown, Truck, ArrowRight } from 'lucide-react';

interface BuyWholeBundleModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export const BuyWholeBundleModal: React.FC<BuyWholeBundleModalProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  const { user, buyWholeBundle } = useApp();

  const pricePerPiece = product.fullBundlePricePerPiece || product.groupPrice;
  const totalBundlePrice = pricePerPiece * product.bundleSize;
  const retailTotal = product.retailPrice * product.bundleSize;
  const totalSavings = retailTotal - totalBundlePrice;
  const singleSavingsDiff = (product.groupPrice - pricePerPiece) * product.bundleSize;

  const tokenAmount = 500; // token advance for whole bundle
  const dueAmount = totalBundlePrice - tokenAmount;

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.deliveryAddress || '');
  const [district, setDistrict] = useState(user?.district || 'ঢাকা');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('আপনার নাম লিখুন।');
      return;
    }
    if (!phone.trim() || phone.length < 11) {
      setError('সঠিক ১১ ডিজিটের ফোন নম্বর প্রদান করুন।');
      return;
    }
    if (!address.trim()) {
      setError('ডেলিভারি ঠিকানা প্রদান করুন।');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const fullDeliveryAddress = `${address.trim()}, ${district}`;
      const result = buyWholeBundle(
        product.id,
        tokenAmount,
        paymentMethod,
        fullDeliveryAddress,
        phone.trim(),
        fullName.trim(),
        transactionId.trim()
      );

      setLoading(false);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-stone-900">সম্পূর্ণ বান্ডিল কিনুন ({product.bundleSize} পিস)</h2>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded">
                  বিশেষ ছাড়
                </span>
              </div>
              <p className="text-xs text-stone-500">অন্য গ্রাহকের জন্য অপেক্ষা ছাড়া সরাসরি পাইকারি ক্রয়</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
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
              className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-200"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-stone-900 text-sm truncate">{product.title}</h4>
              <p className="text-xs text-stone-500 mt-0.5">
                বান্ডিলের ভেতরে থাকবে: <strong className="text-stone-800 font-semibold">{product.bundleSize} টি বিভিন্ন সাইজের সেট</strong>
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {product.availableSizes.map(s => (
                  <span key={s} className="bg-stone-200 text-stone-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Instant Dispatch Guarantee Badge */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 flex items-start gap-2.5">
            <Truck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-900">তাত্ক্ষণিক ডেলিভারি সুবিধা:</strong><br />
              যেহেতু আপনি পুরো বান্ডিলটি একাই নিচ্ছেন, তাই অন্য কোনো গ্রাহক যুক্ত হওয়ার জন্য অপেক্ষা করতে হবে না। অর্ডার নিশ্চিত হওয়া মাত্রই হোলসেলার থেকে মাল পাঠিয়ে দেওয়া হবে।
            </div>
          </div>

          {/* Price & Extra Discount Breakdown */}
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-xs space-y-2">
            <div className="flex justify-between text-stone-600">
              <span>একক গ্রুপ বাই মূল্য:</span>
              <del className="text-stone-400">৳{product.groupPrice} / পিস</del>
            </div>

            <div className="flex justify-between items-center text-emerald-800 font-bold bg-emerald-100/60 p-2 rounded-lg border border-emerald-200">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>সম্পূর্ণ বান্ডিলে বিশেষ অফার রেট:</span>
              </span>
              <span className="text-sm font-extrabold text-emerald-800">৳{pricePerPiece} / পিস</span>
            </div>

            <div className="flex justify-between text-stone-700 font-medium">
              <span>বান্ডিলের মোট মূল্য ({product.bundleSize} পিস × ৳{pricePerPiece}):</span>
              <span className="font-bold text-stone-900 text-sm">৳{totalBundlePrice.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-rose-700 font-medium text-[11px]">
              <span>খুচরা বাজার দরের চেয়ে মোট সাশ্রয়:</span>
              <span>৳{totalSavings.toLocaleString()} টাকা!</span>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
              <div>
                <div className="font-semibold text-stone-700">বুকিং টোকেন অগ্রিম:</div>
                <div className="text-[11px] text-stone-500">বাকি ৳{dueAmount.toLocaleString()} ক্যাশ অন ডেলিভারি</div>
              </div>
              <div className="text-base font-extrabold text-emerald-700">৳{tokenAmount}</div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">ডেলিভারির তথ্য</h4>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <label className="block text-xs font-semibold text-stone-700 mb-1">জেলা *</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="যেমন: ঢাকা"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">পূর্ণ ডেলিভারি ঠিকানা *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="বাসা, রোড, থানা..."
                rows={2}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Payment Selection */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              টোকেন পেমেন্ট (৳{tokenAmount})
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'bKash', name: 'বিকাশ', number: '01700-112233' },
                { id: 'Nagad', name: 'নগদ', number: '01800-445566' },
                { id: 'Rocket', name: 'রকেট', number: '01900-778899' }
              ].map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === method.id
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-900 shadow-xs'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="text-xs font-bold">{method.name}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{method.number}</div>
                </button>
              ))}
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
              <div className="flex items-center justify-between">
                <span>
                  আমাদের <strong>{paymentMethod === 'bKash' ? 'বিকাশ' : paymentMethod === 'Nagad' ? 'নগদ' : 'রকেট'}</strong> পার্সোনাল নম্বর:
                </span>
                <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                  {paymentMethod === 'bKash' ? '01700-112233' : paymentMethod === 'Nagad' ? '01800-445566' : '01900-778899'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                উপরের নম্বরে ৳{tokenAmount} সেন্ড মানি করে নিচের বক্সে ট্রানজেকশন আইডি দিন (ঐচ্ছিক):
              </p>
              <input
                type="text"
                placeholder="ট্রানজেকশন আইডি (TrxID) ঐচ্ছিক"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Package className="w-4 h-4" />
              <span>
                {loading
                  ? 'অর্ডার নেওয়া হচ্ছে...'
                  : `৳${tokenAmount} টোকেন দিয়ে পুরো বান্ডিল (৳${totalBundlePrice.toLocaleString()}) নিশ্চিত করুন`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
