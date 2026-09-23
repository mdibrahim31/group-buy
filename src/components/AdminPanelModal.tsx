import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldCheck,
  Search,
  Users,
  Package,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  ExternalLink,
  RefreshCcw,
  Lock,
} from 'lucide-react';
import { Customer, Order } from '../types';
import { dbGetAllCustomers, dbGetAllOrders, isSupabaseConfigured, SUPABASE_URL } from '../lib/supabase';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const { orders: localOrders } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [activeTab, setActiveTab] = useState<'orders' | 'customers'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Load customers and orders from Supabase or localStorage
  const refreshAdminData = async () => {
    setLoading(true);
    try {
      // 1. Get from Supabase
      const remoteCustomers = await dbGetAllCustomers();
      const remoteOrders = await dbGetAllOrders();

      // 2. Fallback to localStorage registered customers
      const localUsersDbRaw = localStorage.getItem('groupbuy_registered_customers_db');
      const localUsersDb: Record<string, { user: Customer }> = localUsersDbRaw ? JSON.parse(localUsersDbRaw) : {};
      const localCustArray: Customer[] = Object.values(localUsersDb).map(entry => entry.user);

      // Merge customers
      const custMap = new Map<string, Customer>();
      remoteCustomers.forEach(c => custMap.set(c.id, c));
      localCustArray.forEach(c => {
        if (!custMap.has(c.id)) custMap.set(c.id, c);
      });

      // Merge orders
      const orderMap = new Map<string, Order>();
      remoteOrders.forEach(o => orderMap.set(o.id, o));
      localOrders.forEach(o => {
        if (!orderMap.has(o.id)) orderMap.set(o.id, o);
      });

      setCustomers(Array.from(custMap.values()));
      setAllOrders(Array.from(orderMap.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refreshAdminData();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  // Simple PIN verification (default: 1234 or admin)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '1234' || adminPin === 'admin' || adminPin === '0000') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('ভুল পিন নম্বর। (ডেমো পিন: 1234)');
    }
  };

  // Filter orders by Customer ID or general search
  const filteredOrders = allOrders.filter((order) => {
    if (selectedCustomerId) {
      return order.customerId === selectedCustomerId;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      order.id.toLowerCase().includes(q) ||
      order.customerId?.toLowerCase().includes(q) ||
      order.customerPhone?.includes(q) ||
      order.contactPhone?.includes(q) ||
      order.customerName?.toLowerCase().includes(q) ||
      order.productTitle.toLowerCase().includes(q)
    );
  });

  // Filter customers by search
  const filteredCustomers = customers.filter((cust) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      cust.id.toLowerCase().includes(q) ||
      cust.phone.includes(q) ||
      cust.fullName.toLowerCase().includes(q) ||
      cust.deliveryAddress?.toLowerCase().includes(q) ||
      cust.district?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-stone-200 flex flex-col">
        {/* Admin Header */}
        <div className="p-4 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wide">অ্যাডমিন ড্যাশবোর্ড (Admin Panel)</h2>
                {isSupabaseConfigured() ? (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Supabase লাইভ
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    লোকাল মোড (কী সেট নেই)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400">কাস্টমার ডাটাবেজ ও অর্ডার ট্র্যাকিং কন্ট্রোল</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Auth Screen */}
        {!isAuthenticated ? (
          <div className="p-8 text-center max-w-sm mx-auto my-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">অ্যাডমিন সিকিউরিটি পিন</h3>
              <p className="text-xs text-stone-500 mt-1">
                শুধুমাত্র শপ ম্যানেজারের জন্য। অনুগ্রহ করে ৪ সংখ্যার পিন দিন।
              </p>
            </div>
            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                placeholder="পিন লিখুন (যেমন: 1234)"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              {pinError && <p className="text-xs text-rose-600 font-medium">{pinError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                লগইন করুন
              </button>
              <p className="text-[11px] text-stone-400">ডেমো পিন: <span className="font-mono text-stone-600 font-bold">1234</span></p>
            </form>
          </div>
        ) : (
          <>
            {/* Nav Tabs & Global Search */}
            <div className="border-b border-stone-200 bg-stone-50 p-3 sm:px-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => { setActiveTab('orders'); setSelectedCustomerId(null); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'orders'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>সকল অর্ডার ({allOrders.length})</span>
                </button>
                <button
                  onClick={() => { setActiveTab('customers'); setSelectedCustomerId(null); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'customers'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>কাস্টমার টেবিল ({customers.length})</span>
                </button>
                <button
                  onClick={refreshAdminData}
                  className="p-1.5 bg-white border border-stone-200 text-stone-600 hover:text-stone-900 rounded-lg text-xs cursor-pointer"
                  title="রিফ্রেশ করুন"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Universal Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="কাস্টমার আইডি, ফোন বা অর্ডার আইডি..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* If a customer is selected, show banner */}
            {selectedCustomerId && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-medium">
                  শুধুমাত্র কাস্টমার <strong>{selectedCustomerId}</strong> এর অর্ডারসমূহ ফিল্টার করা আছে।
                </span>
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  সবগুলো অর্ডার দেখুন ✕
                </button>
              </div>
            )}

            {/* Tab Contents */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-10 text-stone-500 text-xs">
                      কোনো অর্ডার পাওয়া যায়নি।
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-stone-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                          <tr>
                            <th className="p-2.5">অর্ডার আইডি</th>
                            <th className="p-2.5">কাস্টমার আইডি ও তথ্য</th>
                            <th className="p-2.5">পণ্য ও সাইজ</th>
                            <th className="p-2.5">মূল্য ও অগ্রিম</th>
                            <th className="p-2.5">ডেলিভারি ঠিকানা</th>
                            <th className="p-2.5">স্ট্যাটাস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {filteredOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="p-2.5 font-mono font-bold text-stone-800 whitespace-nowrap">
                                #{ord.id}
                              </td>
                              <td className="p-2.5">
                                <div className="font-bold text-stone-900">{ord.customerName || 'নামহীন'}</div>
                                <div className="text-stone-500 font-mono text-[11px]">{ord.customerPhone || ord.contactPhone}</div>
                                {ord.customerId && (
                                  <div
                                    onClick={() => setSelectedCustomerId(ord.customerId || null)}
                                    className="text-[10px] text-emerald-700 font-mono font-semibold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 inline-block mt-0.5 cursor-pointer hover:bg-emerald-100"
                                    title="এই কাস্টমারের সব অর্ডার দেখুন"
                                  >
                                    ID: {ord.customerId}
                                  </div>
                                )}
                              </td>
                              <td className="p-2.5">
                                <div className="font-medium text-stone-900 truncate max-w-[150px]">{ord.productTitle}</div>
                                <div className="text-stone-500 text-[11px]">
                                  সাইজ: <span className="font-bold text-stone-800">{ord.size}</span> (ব্যাচ #{ord.batchNumber})
                                </div>
                              </td>
                              <td className="p-2.5 whitespace-nowrap">
                                <div className="font-bold text-emerald-800">৳{ord.groupPrice}</div>
                                <div className="text-[11px] text-stone-500">
                                  পেইড: ৳{ord.advanceAmount} | বাকি: ৳{ord.dueAmount}
                                </div>
                              </td>
                              <td className="p-2.5 text-stone-600 max-w-[160px] truncate" title={ord.deliveryAddress}>
                                {ord.deliveryAddress || 'ঠিকানা নেই'}
                              </td>
                              <td className="p-2.5 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  {ord.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* CUSTOMERS TAB */}
              {activeTab === 'customers' && (
                <div className="space-y-3">
                  {filteredCustomers.length === 0 ? (
                    <div className="text-center py-10 text-stone-500 text-xs">
                      কোনো কাস্টমার অ্যাকাউন্ট পাওয়া যায়নি।
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-stone-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                          <tr>
                            <th className="p-2.5">কাস্টমার আইডি</th>
                            <th className="p-2.5">নাম ও ফোন নম্বর</th>
                            <th className="p-2.5">ডেলিভারি ঠিকানা</th>
                            <th className="p-2.5">জেলা</th>
                            <th className="p-2.5 text-center">মোট অর্ডার</th>
                            <th className="p-2.5 text-right">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {filteredCustomers.map((cust) => {
                            const customerOrdersCount = allOrders.filter(
                              (o) => o.customerId === cust.id || o.customerPhone === cust.phone
                            ).length;

                            return (
                              <tr key={cust.id} className="hover:bg-stone-50/80 transition-colors">
                                <td className="p-2.5 font-mono text-emerald-800 font-semibold whitespace-nowrap">
                                  {cust.id}
                                </td>
                                <td className="p-2.5">
                                  <div className="font-bold text-stone-900">{cust.fullName}</div>
                                  <div className="text-stone-500 font-mono text-[11px]">{cust.phone}</div>
                                </td>
                                <td className="p-2.5 text-stone-600 max-w-[180px] truncate" title={cust.deliveryAddress}>
                                  {cust.deliveryAddress || '—'}
                                </td>
                                <td className="p-2.5 text-stone-700 font-medium whitespace-nowrap">
                                  {cust.district || '—'}
                                </td>
                                <td className="p-2.5 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-800">
                                    {customerOrdersCount} টি
                                  </span>
                                </td>
                                <td className="p-2.5 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => {
                                      setSelectedCustomerId(cust.id);
                                      setActiveTab('orders');
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                                  >
                                    অর্ডারগুলো দেখুন →
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
