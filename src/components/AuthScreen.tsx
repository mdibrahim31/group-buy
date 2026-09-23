import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Phone, User as UserIcon, MapPin, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppSupport';

interface AuthScreenProps {
  onOpenAdmin: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onOpenAdmin }) => {
  const { login, register } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
        } else {
          setError(res.message);
        }
      } else {
        const res = await register(phone, password, fullName, address, district);
        if (res.success) {
          setSuccess(res.message);
        } else {
          setError(res.message);
        }
      }
    } catch {
      setError('একটি অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Brand Bar */}
      <div className="max-w-md w-full mx-auto text-center pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>সরাসরি হোলসেলার ও ফ্যাক্টরি গ্রুপ-বাই</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          GroupBuy Wholesale
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-sm mx-auto">
          পাইকারি মূল্যে পণ্য কেনার জন্য অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন বা রেজিস্ট্রেশন করুন।
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="max-w-md w-full mx-auto my-6 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            লগইন (Sign In)
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              mode === 'register'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            নতুন রেজিস্ট্রেশন (Sign Up)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="text-left pb-1">
            <h2 className="text-base font-bold text-stone-900">
              {mode === 'login' ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'নতুন কাস্টমার একাউন্ট তৈরি'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {mode === 'login'
                ? 'পূর্বে বুক করা সমস্ত স্লট ও তথ্য স্বয়ংক্রিয়ভাবে লোড হবে'
                : 'আপনার তথ্য সরাসরি ক্লাউড ডাটাবেজে সুরক্ষিত থাকবে'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{error}</span>
              </div>
              {mode === 'login' && error.includes('রেজিস্ট্রেশন') && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className="text-left text-xs font-bold text-emerald-800 hover:underline pl-6 cursor-pointer"
                >
                  👉 নতুন একাউন্ট খুলতে এখানে ক্লিক করুন
                </button>
              )}
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
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
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
                placeholder="আপনার গোপন পাসওয়ার্ড দিন"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  পার্সেল পাওয়ার ঠিকানা (বাসা/দোকান) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <textarea
                    required
                    rows={2}
                    placeholder="রোড, বাড়ি নং, এলাকা (কুরিয়ারে পার্সেল পৌঁছানোর জন্য)..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  জেলা *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="ঢাকা">ঢাকা</option>
                  <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                  <option value="সিলেট">সিলেট</option>
                  <option value="রাজশাহী">রাজশাহী</option>
                  <option value="খুলনা">খুলনা</option>
                  <option value="বরিশাল">বরিশাল</option>
                  <option value="রংপুর">রংপুর</option>
                  <option value="ময়মনসিংহ">ময়মনসিংহ</option>
                  <option value="কুমিল্লা">কুমিল্লা</option>
                  <option value="গাজীপুর">গাজীপুর</option>
                  <option value="নারায়ণগঞ্জ">নারায়ণগঞ্জ</option>
                  <option value="অন্যান্য">অন্যান্য জেলা</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
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

          <div className="pt-3 text-center border-t border-stone-100 text-xs text-stone-500">
            {mode === 'login' ? (
              <span>
                নতুন কাস্টমার?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  রেজিস্ট্রেশন করুন
                </button>
              </span>
            ) : (
              <span>
                ইতোমধ্যে অ্যাকাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  লগইন করুন
                </button>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Bottom Footer & Admin Access */}
      <div className="max-w-md w-full mx-auto text-center pb-4 text-xs text-stone-400 space-y-2">
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://wa.me/8801882208531"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400" />
            <span>সাপোর্ট: 01882208531</span>
          </a>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="text-stone-400 hover:text-stone-200 hover:underline cursor-pointer"
          >
            🔒 অ্যাডমিন প্রবেশ
          </button>
        </div>
        <p className="text-[11px] text-stone-500">© 2026 GroupBuy Wholesale</p>
      </div>
    </div>
  );
};
