import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Phone, User as UserIcon, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

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

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      const res = login(phone, password);
      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => setAuthModalOpen(false), 500);
      } else {
        setError(res.message);
      }
    } else {
      const res = register(phone, password, fullName, address, district);
      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => setAuthModalOpen(false), 500);
      } else {
        setError(res.message);
      }
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
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
              mode === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            লগইন (Sign In)
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
              mode === 'register'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            রেজিস্ট্রেশন (Sign Up)
          </button>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="px-3 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="text-center pb-1">
            <h3 className="text-lg font-bold text-stone-900">
              {mode === 'login' ? 'অ্যাকাউন্টে লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              ফোন নম্বর ও পাসওয়ার্ড দিয়ে সরাসরি যুক্ত থাকুন
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">আপনার পূর্ণ নাম *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">মোবাইল নম্বর *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">পাসওয়ার্ড *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="গোপন পাসওয়ার্ড"
                className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">জেলা *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="ঢাকা / চট্টগ্রাম / সিলেট..."
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">ডেলিভারি ঠিকানা</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাসা, রোড, থানা..."
                  rows={2}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            {mode === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
          </button>

          {/* Quick Demo Helper */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              ডেমো তথ্য অটো ফিল করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
