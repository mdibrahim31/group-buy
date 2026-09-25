import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { X, ShoppingBag, Truck, Zap, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface SingleBuyModalProps {
  product: Product;
  preselectedSize?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const SingleBuyModal: React.FC<SingleBuyModalProps> = ({
  product,
  preselectedSize,
  onClose,
  onSuccess,
}) => {
  const { user, singleBuyProduct } = useApp();

  const uniqueSizes = Array.from(new Set(product.availableSizes));
  const defaultColors = product.availableColors && product.availableColors.length > 0
    ? product.availableColors
    : ['কালো', 'সাদা', 'ব্রাউন', 'নীল', 'লাল'];

  const [selectedSize, setSelectedSize] = useState<string>(
    preselectedSize || uniqueSizes[0] || 'Free Size'
  );
  const [selectedColor, setSelectedColor] = useState<string>(defaultColors[0] || 'কালো');
  const [quantity, setQuantity] = useState<number>(1);

  const [paymentOption, setPaymentOption] = useState<'token' | 'full' | 'cod'>('token');
  const tokenAdvance = 150;
  const totalPrice = product.retailPrice * quantity;
  const advanceToPay =
    paymentOption === 'token'
      ? tokenAdvance
      : paymentOption === 'full'
      ? totalPrice
      : 0;
  const dueAmount = Math.max(0, totalPrice - advanceToPay);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.deliveryAddress || '');
  const [district, setDistrict] = useState(user?.district || 'ঢাকা');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'COD'>('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSize) {
      setError('দয়া করে সাইজ নির্বাচন করুন।');
      return;
    }
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
      const finalMethod = paymentOption === 'cod' ? 'COD' : paymentMethod;
      const result = singleBuyProduct(
        product.id,
        selectedSize,
        advanceToPay,
        finalMethod,
        fullDeliveryAddress,
        phone.trim(),
        fullName.trim(),
        transactionId.trim(),
        quantity,
        selectedColor
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
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-stone-900">একক ক্রয় (Single Buy)</h2>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  তাত্ক্ষণিক ডেলিভারি
                </span>
              </div>
              <p className="text-xs text-stone-500">
                কোনো গ্রুপ বা স্লটের অপেক্ষা ছাড়া সরাসরি খুচরা অর্ডার
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
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
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{product.description}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xs text-stone-500 font-medium">একক খুচরা মূল্য:</span>
                <span className="text-base font-extrabold text-stone-900">৳{product.retailPrice}</span>
              </div>
            </div>
          </div>

          {/* Instant Dispatch Guarantee Badge */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-xs text-blue-950 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-900">সরাসরি একক পার্সেল সুবিধা:</strong><br />
              এই অর্ডারে কোনো গ্রুপ ব্যাচ পূরণ হওয়ার অপেক্ষা করতে হবে না। অর্ডার নিশ্চিত হওয়া মাত্রই কুরিয়ারে পাঠিয়ে দেওয়া হবে।
            </div>
          </div>

          {/* Size & Quantity & Color Selection */}
          <div className="space-y-3 p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                আপনার সাইজ নির্বাচন করুন *
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-600/30'
                        : 'bg-white border-stone-200 text-stone-800 hover:border-stone-300'
                    }`}
                  >
                    সাইজ {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selection */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                আপনার কালার নির্বাচন করুন *
              </label>
              <div className="flex flex-wrap gap-2">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedColor === color
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-600/30'
                        : 'bg-white border-stone-200 text-stone-800 hover:border-stone-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
              <div>
                <span className="text-xs font-bold text-stone-800">পরিমাণ (পিস):</span>
                <span className="text-[11px] text-stone-500 block">কত পিস নিতে চান?</span>
              </div>
              <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-bold text-stone-900 min-w-[28px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-xs space-y-2">
            <div className="flex justify-between items-center text-stone-700 font-bold">
              <span>মোট মূল্য ({quantity} পিস × ৳{product.retailPrice}):</span>
              <span className="font-extrabold text-blue-700 text-sm">৳{totalPrice.toLocaleString()}</span>
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
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {loading
                  ? 'অর্ডার নেওয়া হচ্ছে...'
                  : `একক অর্ডার (সাইজ ${selectedSize}) কনফার্ম করুন`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
