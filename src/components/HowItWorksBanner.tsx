import React from 'react';
import { Package, Users, Truck, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

export const HowItWorksBanner: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white rounded-2xl p-6 md:p-8 my-6 shadow-sm border border-stone-700/60 overflow-hidden relative">
      {/* Background subtle glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
          <Tag className="w-3.5 h-3.5" />
          <span>গ্রুপ বায়িং সিস্টেম • সরাসরি হোলসেলার মূল্য</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3">
          খুচরা বিক্রেতার অতিরিক্ত লাভ বাদ দিন, <br className="hidden sm:inline" />
          সবাই মিলে <span className="text-emerald-400">বান্ডিল মূল্যে</span> জুতা ও পোশাক কিনুন!
        </h2>
        
        <p className="text-stone-300 text-sm md:text-base leading-relaxed max-w-2xl mb-8">
          হোলসেলার সাধারণ গ্রাহককে ১ পিস বিক্রি করে না। তাই আমরা নির্দিষ্ট সাইজের গ্রাহকদের একত্রিত করি।
          প্রতিটি বান্ডিলের স্লট পূরণ হলেই সরাসরি কারখানা বা হোলসেলার থেকে মাল সরবরাহ করা হয়।
        </p>

        {/* 4 Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
              ১
            </div>
            <h3 className="font-semibold text-sm text-stone-100 mb-1">সাইজ স্লট পছন্দ</h3>
            <p className="text-xs text-stone-400 leading-normal">
              আপনার পছন্দের সাইজের খালি স্লট সিলেক্ট করুন অথবা নতুন ব্যাচ শুরু করুন।
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
              ২
            </div>
            <h3 className="font-semibold text-sm text-stone-100 mb-1">টোকেন অ্যাডভান্স</h3>
            <p className="text-xs text-stone-400 leading-normal">
              মাত্র ১৫০ টাকা টোকেন দিয়ে স্লট বুক করুন। বাকি টাকা ক্যাশ অন ডেলিভারি।
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
              ৩
            </div>
            <h3 className="font-semibold text-sm text-stone-100 mb-1">বান্ডিল পূর্ণ হওয়া</h3>
            <p className="text-xs text-stone-400 leading-normal">
              ৬টি (বা নির্ধারিত) স্লট পূর্ণ হলে সরাসরি হোলসেলার থেকে নতুন বান্ডিল কেনা হবে।
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
              ৪
            </div>
            <h3 className="font-semibold text-sm text-stone-100 mb-1">হোম ডেলিভারি</h3>
            <p className="text-xs text-stone-400 leading-normal">
              খুচরা মূল্যের চেয়ে ৬০-৭০% কম খরচে সরাসরি আপনার ঠিকানায় পার্সেল পৌঁছাবে।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
