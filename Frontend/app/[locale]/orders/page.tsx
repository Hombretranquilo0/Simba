'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft, RefreshCcw, Truck, Phone, MapPin, ExternalLink, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/context/TranslationContext';
import API_URL from '@/utils/api';
import { useCurrency } from '@/context/CurrencyContext';

export default function OrdersPage() {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const params = useParams();
  const locale = params.locale as string;
  const { format } = useCurrency();

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-black mb-4">Please login to view your orders</h2>
        <Link href={`/${locale}/login`} className="bg-simba-orange text-white px-8 py-3 rounded-xl font-bold">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">My Orders</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Track your purchase status</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-simba-orange/30 border-t-simba-orange rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-bold">Checking your order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
          <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
          <h3 className="text-2xl font-black mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-8 font-medium">Your purchase history will appear here once you checkout.</p>
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-simba-orange font-black uppercase tracking-widest text-xs">
            <ArrowLeft size={16} /> Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {orders.map((order, index) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
                      <Package size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                      <h3 className="text-xl font-black">#SIMBA-{order.id}</h3>
                      <p className="text-xs text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end justify-center">
                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-2 ${
                      order.status === 'completed' ? 'bg-orange-100 text-simba-orange' : 
                      order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {order.status === 'completed' && <CheckCircle2 size={12} />}
                      {order.status === 'pending' && <Clock size={12} className="animate-pulse" />}
                      {order.status === 'cancelled' && <AlertCircle size={12} />}
                      {order.status}
                    </span>
                    <p className="text-2xl font-black text-simba-orange">{format(order.total)}</p>
                  </div>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-6 mb-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Items Summary</h4>
                  <div className="space-y-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                            <img src={item.product.image || 'https://via.placeholder.com/50'} alt={item.product.name} className="object-contain p-2 w-full h-full" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100">{item.product.name}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-black text-gray-700 dark:text-gray-300">{format(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fulfillment details */}
                <div className={`rounded-2xl p-5 mb-6 border ${order.fulfillmentType === 'pickup' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' : 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {order.fulfillmentType === 'pickup'
                      ? <ShoppingBag size={14} className="text-blue-500" />
                      : <Truck size={14} className="text-orange-500" />}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${order.fulfillmentType === 'pickup' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {order.fulfillmentType === 'pickup' ? 'Pickup' : 'Delivery'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {order.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="flex-shrink-0 text-gray-400" />
                        <span>{order.phone}</span>
                      </div>
                    )}
                    {order.fulfillmentType === 'delivery' && order.deliveryNotes && (
                      <div className="flex items-start gap-2">
                        <MapPin size={13} className="flex-shrink-0 text-gray-400 mt-0.5" />
                        <span>{order.deliveryNotes}</span>
                      </div>
                    )}
                    {order.fulfillmentType === 'delivery' && order.locationLink && (
                      <div className="flex items-center gap-2">
                        <ExternalLink size={13} className="flex-shrink-0 text-gray-400" />
                        <a href={order.locationLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                          View location on map
                        </a>
                      </div>
                    )}
                    {order.fulfillmentType === 'pickup' && order.pickupName && (
                      <div className="flex items-center gap-2">
                        <UserIcon size={13} className="flex-shrink-0 text-gray-400" />
                        <span>Pickup name: {order.pickupName}</span>
                      </div>
                    )}
                    {order.fulfillmentType === 'pickup' && order.pickupTime && (
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="flex-shrink-0 text-gray-400" />
                        <span>Pickup time: {order.pickupTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-simba-orange"></div>
                    Paid via Simulation
                  </div>
                  {order.status === 'pending' && (
                    <div className="flex items-center gap-2 text-orange-500 text-xs font-black uppercase tracking-tighter">
                      <Clock size={14} />
                      Awaiting Confirmation
                    </div>
                  )}
                  {order.status === 'completed' && (
                    <div className="flex items-center gap-2 text-simba-orange text-xs font-black uppercase tracking-tighter">
                      <CheckCircle2 size={14} />
                      Order Confirmed
                    </div>
                  )}
                  {order.status === 'cancelled' && (
                    <div className="flex items-center gap-2 text-red-600 text-xs font-black uppercase tracking-tighter">
                      <AlertCircle size={14} />
                      Order Declined
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
