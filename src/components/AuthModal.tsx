import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Phone, User as UserIcon, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, login, register } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(phone, password);
        if (res.success) {
          setSuccess(res.message);
          setTimeout(() => setAuthModalOpen(false), 500);
        } else {
          setError(res.message);
        }
      } else {
        const res = await register(phone, password, fullName, address, district);
        if (res.success) {
          setSuccess(res.message);
          setTimeout(() => setAuthModalOpen(false), 500);
        } else {
          setError(res.message);
        }
      }
    } catch {
      setError('একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setPhone('01712345678');
    setPassword('123456');
    setFullName('আহমেদ হাসান');
    setAddress('বাড়ি ১২, রোড ৫, ধানমন্ডি');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            লগইন (Sign In)
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              mode === 'register'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            রেজিস্ট্রেশন (Sign Up)
          </button>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="px-3 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="text-center pb-1">
            <h3 className="text-lg font-bold text-stone-900">
              {mode === 'login' ? 'অ্যাকাউন্টে লগইন করুন' : 'নতুন কাস্টমার অ্যাকাউন্ট'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              ফোন নম্বর ও পাসওয়ার্ড দিয়ে কাস্টমার তথ্য সংরক্ষিত থাকবে
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                আপনার পুরো নাম *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ সাকিব হোসেন"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ফোন নম্বর *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              পাসওয়ার্ড *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  ডেলিভারির ঠিকানা (বাসা/দোকান) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <textarea
                    required
                    rows={2}
                    placeholder="রোড, বাড়ি নং, এলাকা..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  জেলা
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="ঢাকা">ঢাকা</option>
                  <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                  <option value="সিলেট">সিলেট</option>
                  <option value="রাজশাহী">রাজশাহী</option>
                  <option value="খুলনা">খুলনা</option>
                  <option value="বরিশাল">বরিশাল</option>
                  <option value="রংপুর">রংপুর</option>
                  <option value="ময়মনসিংহ">ময়মনসিংহ</option>
                  <option value="অন্যান্য">অন্যান্য জেলা</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>যাচাই করা হচ্ছে...</span>
              </>
            ) : mode === 'login' ? (
              'লগইন করুন'
            ) : (
              'রেজিস্ট্রেশন সম্পন্ন করুন'
            )}
          </button>

          <div className="pt-2 text-center border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>পরীক্ষা করার জন্য:</span>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              ডেমো তথ্য বসান
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
