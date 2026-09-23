import React, { useState } from 'react';
import { Product, Bundle, BundleSlot } from '../types';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, ShieldCheck, AlertCircle, ShoppingBag, CreditCard, Sparkles } from 'lucide-react';

interface BookingModalProps {
  product: Product;
  bundle: Bundle;
  slot: BundleSlot;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  product,
  bundle,
  slot,
  onClose,
  onSuccess,
}) => {
  const { user, bookSlot, setAuthModalOpen } = useApp();

  const tokenAmount = Math.min(150, product.groupPrice);
  const dueAmount = Math.max(0, product.groupPrice - tokenAmount);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.deliveryAddress || '');
  const [district, setDistrict] = useState(user?.district || 'ঢাকা');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const result = bookSlot(
        bundle.id,
        slot.id,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              সরাসরি হোলসেলার বুকিং
            </span>
            <h2 className="text-lg font-bold text-stone-900 mt-1">স্লট কনফার্মেশন</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Summary Box */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex gap-3 items-center">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-200"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-stone-900 text-sm truncate">{product.title}</h4>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                <span className="bg-stone-900 text-white font-bold px-2 py-0.5 rounded">
                  সাইজ: {slot.size}
                </span>
                <span className="text-stone-500 font-medium">
                  ব্যাচ #{bundle.batchNumber}
                </span>
              </div>
              <div className="text-xs text-stone-600 mt-1">
                গ্রুপ বাই মূল্য: <strong className="text-emerald-700 font-bold">৳{product.groupPrice}</strong>
                <span className="text-stone-400 line-through ml-2">৳{product.retailPrice}</span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100 text-xs space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>গ্রুপ বাই মোট মূল্য:</span>
              <span className="font-semibold text-stone-900">৳{product.groupPrice}</span>
            </div>
            <div className="flex justify-between text-emerald-800 font-medium">
              <span>টোকেন অগ্রিম (এখন প্রদেয়):</span>
              <span className="font-bold text-emerald-700">৳{tokenAmount}</span>
            </div>
            <div className="flex justify-between text-stone-600 pt-1.5 border-t border-emerald-200/60 font-semibold">
              <span>ডেলিভারির সময় প্রদেয় (COD):</span>
              <span className="text-stone-900">৳{dueAmount}</span>
            </div>
            <p className="text-[11px] text-stone-500 pt-1">
              * বান্ডিলের সবকটি সাইজ বুকড হওয়া মাত্র হোলসেলার থেকে মাল সরবরাহ হবে। সময়মতো বান্ডিল না হলে অগ্রিম টাকা সম্পূর্ণ রিফান্ড হবে।
            </p>
          </div>

          {/* Customer Details */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">ডেলিভারির তথ্য</h4>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">পূর্ণ নাম *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="যেমন: তানভীর আহমেদ"
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
                  placeholder="ঢাকা / চট্টগ্রাম / রাজশাহী..."
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
                placeholder="বাসা নং, রোড নং, এলাকা, থানা..."
                rows={2}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Payment Method for Token 150 Tk */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              টোকেন পেমেন্ট মাধ্যম (৳{tokenAmount})
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
                উপরের নম্বরে ৳{tokenAmount} সেন্ড মানি করে নিচের বক্সে ট্রানজেকশন আইডি দিন (অথবা বুকিং শেষে পাঠান):
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

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'প্রসেসিং হচ্ছে...' : `৳${tokenAmount} টোকেন দিয়ে স্লট কনফার্ম করুন`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
