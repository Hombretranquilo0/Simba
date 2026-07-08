'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Lock, Trash2, CheckCircle2, AlertCircle,
  Eye, EyeOff, Package, Clock, ShoppingBag, Heart,
  RefreshCcw, LayoutDashboard, LogOut, Settings,
  Truck, Phone, MapPin, ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useSavedItems } from '@/hooks/useSavedItems';
import API_URL from '@/utils/api';

// ── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'orders' | 'saved' | 'settings';
type ToastState = { message: string; type: 'success' | 'error' } | null;

// ── Shared helpers ───────────────────────────────────────────────────────────
const inputClass =
  'w-full px-4 py-3 bg-gray-100/60 dark:bg-gray-800/60 border-2 border-transparent focus:border-simba-orange/40 dark:focus:border-simba-gold/40 rounded-2xl outline-none text-sm font-medium text-gray-900 dark:text-gray-100 transition-all placeholder:text-gray-400';

function InlineToast({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  const ok = toast.type === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold mt-3 ${
        ok
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'
      }`}
    >
      {ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {toast.message}
    </motion.div>
  );
}


// ── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({
  user, locale, setTab, ordersCount, savedCount,
}: {
  user: any; locale: string; setTab: (t: Tab) => void;
  ordersCount: number; savedCount: number;
}) {
  return (
    <div className="space-y-6">
      {/* Avatar + name card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 flex items-center gap-6 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-simba-gold/10 flex items-center justify-center text-simba-orange dark:text-simba-gold font-black text-3xl flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-black tracking-tight truncate">{user?.name ?? '—'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          {user?.role === 'manager' && (
            <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest bg-simba-orange/10 text-simba-orange px-3 py-1 rounded-full">
              Manager
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setTab('orders')}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm hover:border-simba-orange/30 hover:shadow-md transition-all text-left group"
        >
          <div className="w-10 h-10 bg-orange-50 dark:bg-simba-gold/10 rounded-2xl flex items-center justify-center text-simba-orange dark:text-simba-gold mb-3 group-hover:scale-110 transition-transform">
            <Package size={20} />
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{ordersCount}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Orders</p>
        </button>

        <button
          onClick={() => setTab('saved')}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm hover:border-simba-orange/30 hover:shadow-md transition-all text-left group"
        >
          <div className="w-10 h-10 bg-orange-50 dark:bg-simba-gold/10 rounded-2xl flex items-center justify-center text-simba-orange dark:text-simba-gold mb-3 group-hover:scale-110 transition-transform">
            <Heart size={20} />
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{savedCount}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Saved Items</p>
        </button>
      </div>

      {/* Quick links */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-4 shadow-sm space-y-1">
        <button onClick={() => setTab('orders')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-orange-50 dark:hover:bg-simba-gold/10 hover:text-simba-orange dark:hover:text-simba-gold transition-colors text-sm font-bold text-gray-700 dark:text-gray-300">
          <Package size={18} /> My Orders
        </button>
        <button onClick={() => setTab('saved')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-orange-50 dark:hover:bg-simba-gold/10 hover:text-simba-orange dark:hover:text-simba-gold transition-colors text-sm font-bold text-gray-700 dark:text-gray-300">
          <Heart size={18} /> Saved Items
        </button>
        <button onClick={() => setTab('settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-orange-50 dark:hover:bg-simba-gold/10 hover:text-simba-orange dark:hover:text-simba-gold transition-colors text-sm font-bold text-gray-700 dark:text-gray-300">
          <Settings size={18} /> Account Settings
        </button>
        {user?.role === 'manager' && (
          <Link href={`/${locale}/manager`} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-orange-50 dark:hover:bg-simba-gold/10 hover:text-simba-orange dark:hover:text-simba-gold transition-colors text-sm font-bold text-gray-700 dark:text-gray-300">
            <LayoutDashboard size={18} /> Manager Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}


// ── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab({ token, locale }: { token: string; locale: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/orders/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setOrders(await r.json());
    } catch {}
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-simba-orange/30 border-t-simba-orange rounded-full animate-spin mb-4" />
      <p className="text-gray-500 font-bold text-sm">Loading orders…</p>
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
      <ShoppingBag size={56} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
      <h3 className="text-xl font-black mb-2">No orders yet</h3>
      <p className="text-gray-500 text-sm mb-6">Your purchase history will appear here after checkout.</p>
      <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-simba-orange font-black uppercase tracking-widest text-xs">
        <ArrowLeft size={14} /> Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={fetchOrders} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Refresh">
          <RefreshCcw size={16} />
        </button>
      </div>
      <AnimatePresence>
        {orders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-5">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0">
                  <Package size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                  <p className="font-black text-lg">#SIMBA-{order.id}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-1">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                  order.status === 'completed' ? 'bg-orange-100 text-simba-orange' :
                  order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {order.status === 'completed' && <CheckCircle2 size={10} />}
                  {order.status === 'pending' && <Clock size={10} className="animate-pulse" />}
                  {order.status === 'cancelled' && <AlertCircle size={10} />}
                  {order.status}
                </span>
                <p className="text-xl font-black text-simba-orange">{order.total.toLocaleString()} <span className="text-xs font-medium opacity-60">RWF</span></p>
              </div>
            </div>

            <div className="bg-gray-50/60 dark:bg-gray-800/30 rounded-2xl p-4 space-y-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex-shrink-0">
                      <img src={item.product.image || 'https://via.placeholder.com/40'} alt={item.product.name} className="object-contain p-1 w-full h-full" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">{item.product.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-black text-sm text-gray-700 dark:text-gray-300 flex-shrink-0">{(item.price * item.quantity).toLocaleString()} RWF</p>
                </div>
              ))}
            </div>

            {/* Fulfillment details */}
            <div className={`rounded-2xl p-4 border mt-3 ${order.fulfillmentType === 'pickup' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' : 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {order.fulfillmentType === 'pickup'
                  ? <ShoppingBag size={13} className="text-blue-500" />
                  : <Truck size={13} className="text-orange-500" />}
                <span className={`text-[10px] font-black uppercase tracking-widest ${order.fulfillmentType === 'pickup' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {order.fulfillmentType === 'pickup' ? 'Pickup' : 'Delivery'}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                {order.phone && (
                  <div className="flex items-center gap-2"><Phone size={12} className="flex-shrink-0 text-gray-400" /><span>{order.phone}</span></div>
                )}
                {order.fulfillmentType === 'delivery' && order.deliveryNotes && (
                  <div className="flex items-start gap-2"><MapPin size={12} className="flex-shrink-0 text-gray-400 mt-0.5" /><span>{order.deliveryNotes}</span></div>
                )}
                {order.fulfillmentType === 'delivery' && order.locationLink && (
                  <div className="flex items-center gap-2"><ExternalLink size={12} className="flex-shrink-0 text-gray-400" /><a href={order.locationLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View location on map</a></div>
                )}
                {order.fulfillmentType === 'pickup' && order.pickupName && (
                  <div className="flex items-center gap-2"><User size={12} className="flex-shrink-0 text-gray-400" /><span>Pickup name: {order.pickupName}</span></div>
                )}
                {order.fulfillmentType === 'pickup' && order.pickupTime && (
                  <div className="flex items-center gap-2"><Clock size={12} className="flex-shrink-0 text-gray-400" /><span>Pickup time: {order.pickupTime}</span></div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}


// ── Saved Items Tab ──────────────────────────────────────────────────────────
function SavedTab({ locale }: { locale: string }) {
  const { savedItems, loading, removeFromSaved, moveToCart } = useSavedItems();
  const { addToCart } = useCart();

  const handleMoveToCart = async (item: any) => {
    const i = await moveToCart(item);
    addToCart(i as any);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-simba-orange/30 border-t-simba-orange rounded-full animate-spin mb-4" />
      <p className="text-gray-500 font-bold text-sm">Loading saved items…</p>
    </div>
  );

  if (savedItems.length === 0) return (
    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
      <Heart size={56} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
      <h3 className="text-xl font-black mb-2">No saved items</h3>
      <p className="text-gray-500 text-sm mb-6">Items you save from the shop will appear here.</p>
      <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-simba-orange font-black uppercase tracking-widest text-xs">
        <ArrowLeft size={14} /> Browse Products
      </Link>
    </div>
  );

  return (
    <div className="space-y-3">
      {savedItems.map((item) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-4 flex items-center gap-4 shadow-sm"
        >
          <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden">
            <Image
              src={item.image || 'https://via.placeholder.com/64'}
              alt={item.name}
              fill
              className="object-contain p-2"
            />
          </div>
          <div className="flex-grow min-w-0">
            <Link href={`/${locale}/product/${item.id}`} className="font-black text-sm text-gray-900 dark:text-white truncate hover:text-simba-orange transition-colors block">
              {item.name}
            </Link>
            <p className="text-simba-orange font-bold text-sm mt-0.5">{item.price.toLocaleString()} RWF</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleMoveToCart(item)}
              className="text-[10px] font-black uppercase tracking-widest text-simba-orange border border-simba-orange px-3 py-1.5 rounded-xl hover:bg-simba-orange hover:text-white transition-all"
            >
              Add to Cart
            </button>
            <button
              onClick={() => removeFromSaved(item.id)}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}


// ── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ user, token, login, logout, clearCart, locale, router }: {
  user: any; token: string; login: any; logout: any;
  clearCart: any; locale: string; router: any;
}) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileToast, setProfileToast] = useState<ToastState>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordToast, setPasswordToast] = useState<ToastState>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteToast, setDeleteToast] = useState<ToastState>(null);

  useEffect(() => {
    if (profileToast?.type === 'success') {
      const t = setTimeout(() => setProfileToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [profileToast]);

  useEffect(() => {
    if (passwordToast?.type === 'success') {
      const t = setTimeout(() => setPasswordToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [passwordToast]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true); setProfileToast(null);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || 'Failed to update profile.'); }
      login(token, { ...user, name, email });
      setProfileToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err: any) {
      setProfileToast({ message: err.message ?? 'Something went wrong.', type: 'error' });
    } finally { setProfileLoading(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPasswordToast({ message: 'Passwords do not match.', type: 'error' }); return; }
    if (newPassword.length < 6) { setPasswordToast({ message: 'Password must be at least 6 characters.', type: 'error' }); return; }
    setPasswordLoading(true); setPasswordToast(null);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || 'Failed to update password.'); }
      setNewPassword(''); setConfirmPassword('');
      setPasswordToast({ message: 'Password changed successfully!', type: 'success' });
    } catch (err: any) {
      setPasswordToast({ message: err.message ?? 'Something went wrong.', type: 'error' });
    } finally { setPasswordLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE' || !token) return;
    setDeleteLoading(true); setDeleteToast(null);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || 'Failed to delete account.'); }
      clearCart(); logout(); router.push(`/${locale}`);
    } catch (err: any) {
      setDeleteToast({ message: err.message ?? 'Something went wrong.', type: 'error' });
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-50 dark:bg-simba-gold/10 rounded-2xl flex items-center justify-center text-simba-orange dark:text-simba-gold">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Profile Info</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Update your name and email</p>
          </div>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
            <input type="text" className={inputClass} placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Email</label>
            <input type="email" className={inputClass} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <InlineToast toast={profileToast} />
          <button type="submit" disabled={profileLoading} className="w-full py-3 bg-simba-orange hover:bg-orange-600 disabled:opacity-60 text-white font-black rounded-2xl transition-all shadow-md shadow-simba-orange/20 text-sm uppercase tracking-widest">
            {profileLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</span> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-50 dark:bg-simba-gold/10 rounded-2xl flex items-center justify-center text-simba-orange dark:text-simba-gold">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Change Password</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Set a new password</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} className={inputClass + ' pr-12'} placeholder="Min. 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Confirm Password</label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} className={inputClass + ' pr-12'} placeholder="Repeat new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <InlineToast toast={passwordToast} />
          <button type="submit" disabled={passwordLoading} className="w-full py-3 bg-simba-orange hover:bg-orange-600 disabled:opacity-60 text-white font-black rounded-2xl transition-all shadow-md shadow-simba-orange/20 text-sm uppercase tracking-widest">
            {passwordLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Updating…</span> : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-900 border-2 border-red-200 dark:border-red-900/50 rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500">
            <Trash2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-red-600 dark:text-red-400">Danger Zone</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Permanent and irreversible actions</p>
          </div>
        </div>
        {!showDeleteConfirm ? (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Deleting your account will permanently remove all your data including order history. This action <span className="font-bold text-red-500">cannot be undone</span>.
            </p>
            <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-black rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all text-sm uppercase tracking-widest">
              Delete Account
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Type <span className="font-black text-red-500 font-mono">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              className={inputClass + ' border-red-200 dark:border-red-800 focus:border-red-400 dark:focus:border-red-600'}
              placeholder="Type DELETE to confirm"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              autoFocus
            />
            <InlineToast toast={deleteToast} />
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); setDeleteToast(null); }} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm uppercase tracking-widest">Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleteInput !== 'DELETE' || deleteLoading} className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all text-sm uppercase tracking-widest">
                {deleteLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Deleting…</span> : 'Confirm Delete'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}


// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, token, login, logout, isAuthenticated, isLoading } = useAuth();
  const { clearCart } = useCart();
  const { savedItems } = useSavedItems();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push(`/${locale}/login`);
  }, [isLoading, isAuthenticated, locale, router]);

  // Prefetch order count for overview stats
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/orders/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',  label: 'Overview',    icon: <User size={18} /> },
    { id: 'orders',    label: 'Orders',      icon: <Package size={18} /> },
    { id: 'saved',     label: 'Saved Items', icon: <Heart size={18} /> },
    { id: 'settings',  label: 'Settings',    icon: <Settings size={18} /> },
  ];

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-simba-orange/30 border-t-simba-orange rounded-full animate-spin mb-4" />
      <p className="text-gray-500 font-bold">Loading…</p>
    </div>
  );

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex mb-10 text-sm font-medium text-gray-500 dark:text-gray-400">
        <Link href={`/${locale}`} className="hover:text-simba-orange flex items-center gap-2 transition-colors">
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-28 space-y-2">
            {/* User chip */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-5 flex items-center gap-3 mb-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-simba-gold/10 flex items-center justify-center text-simba-orange dark:text-simba-gold font-black text-xl flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Tab buttons */}
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-simba-orange text-white shadow-lg shadow-simba-orange/20'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-simba-gold/10 hover:text-simba-orange dark:hover:text-simba-gold border border-gray-100 dark:border-gray-800'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'orders' && orders.length > 0 && (
                  <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-orange-100 text-simba-orange'}`}>
                    {orders.length}
                  </span>
                )}
                {tab.id === 'saved' && savedItems.length > 0 && (
                  <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === 'saved' ? 'bg-white/20 text-white' : 'bg-orange-100 text-simba-orange'}`}>
                    {savedItems.length}
                  </span>
                )}
              </button>
            ))}

            {/* Manager link */}
            {user?.role === 'manager' && (
              <Link
                href={`/${locale}/manager`}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold bg-white dark:bg-gray-900 text-simba-orange border border-orange-100 dark:border-simba-gold/20 hover:bg-orange-50 dark:hover:bg-simba-gold/10 transition-all"
              >
                <LayoutDashboard size={18} /> Manager Dashboard
              </Link>
            )}

            {/* Logout */}
            <button
              onClick={() => { clearCart(); logout(); router.push(`/${locale}`); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold bg-white dark:bg-gray-900 text-red-500 border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </aside>

        {/* ── Tab content ──────────────────────────────────────────── */}
        <div className="flex-grow min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <OverviewTab
                  user={user}
                  locale={locale}
                  setTab={setActiveTab}
                  ordersCount={orders.length}
                  savedCount={savedItems.length}
                />
              )}
              {activeTab === 'orders' && token && (
                <OrdersTab token={token} locale={locale} />
              )}
              {activeTab === 'saved' && (
                <SavedTab locale={locale} />
              )}
              {activeTab === 'settings' && token && (
                <SettingsTab
                  user={user}
                  token={token}
                  login={login}
                  logout={logout}
                  clearCart={clearCart}
                  locale={locale}
                  router={router}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
