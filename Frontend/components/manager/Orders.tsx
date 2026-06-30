'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, User, Mail, Calendar, CreditCard, Clock, CheckCircle2, AlertCircle, Timer, Hash, Truck, ShoppingBag, Phone, MapPin, ExternalLink } from 'lucide-react';
import API_URL from '@/utils/api';

export default function Orders({ token, onUnauthorized }: { token: string; onUnauthorized?: () => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`${API_URL}/manager/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text();
          if (res.status === 401 || res.status === 403) onUnauthorized?.();
          throw new Error(`${res.status}: ${body}`);
        }
        return res.json();
      })
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Orders fetch error:', err);
        setOrders([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const updateStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      <p className="text-gray-500 font-medium">Retrieving latest orders...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Recent Orders</h2>
          <div className="flex items-center gap-2 mt-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit">
            <Timer size={10} />
            <span>Live Order Feed</span>
          </div>
        </div>
        <div className="text-sm font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl">
          Total: {orders.length}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {orders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800"
            >
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-bold">No orders found in database.</p>
            </motion.div>
          ) : (
            orders.map((order, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={order.id} 
                className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-grow space-y-4">
                    <div className="flex items-center justify-between lg:justify-start lg:gap-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500">
                          <Hash size={16} />
                        </div>
                        <span className="text-sm font-black text-gray-400">ORDER #{order.id}</span>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                        order.status === 'completed' ? 'bg-orange-100 text-simba-orange' : 
                        order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {order.status === 'completed' && <CheckCircle2 size={12} />}
                        {order.status === 'pending' && <Clock size={12} className="animate-pulse" />}
                        {order.status === 'cancelled' && <AlertCircle size={12} />}
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Customer</p>
                          <p className="font-bold text-gray-900 dark:text-white">{order?.user?.name ?? 'Unknown User'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-500">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Placed On</p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {order?.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fulfillment details */}
                    <div className={`rounded-2xl p-4 border ${order.fulfillmentType === 'pickup' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900' : 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        {order.fulfillmentType === 'pickup'
                          ? <ShoppingBag size={14} className="text-blue-500" />
                          : <Truck size={14} className="text-orange-500" />}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${order.fulfillmentType === 'pickup' ? 'text-blue-600' : 'text-orange-600'}`}>
                          {order.fulfillmentType === 'pickup' ? 'Pickup' : 'Delivery'}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                        {order.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={12} className="flex-shrink-0 text-gray-400" />
                            <span>{order.phone}</span>
                          </div>
                        )}
                        {order.fulfillmentType === 'delivery' && order.deliveryNotes && (
                          <div className="flex items-start gap-2">
                            <MapPin size={12} className="flex-shrink-0 text-gray-400 mt-0.5" />
                            <span>{order.deliveryNotes}</span>
                          </div>
                        )}
                        {order.fulfillmentType === 'delivery' && order.locationLink && (
                          <div className="flex items-center gap-2">
                            <ExternalLink size={12} className="flex-shrink-0 text-gray-400" />
                            <a href={order.locationLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-[220px]">
                              View on map
                            </a>
                          </div>
                        )}
                        {order.fulfillmentType === 'pickup' && order.pickupName && (
                          <div className="flex items-center gap-2">
                            <User size={12} className="flex-shrink-0 text-gray-400" />
                            <span>{order.pickupName}</span>
                          </div>
                        )}
                        {order.fulfillmentType === 'pickup' && order.pickupTime && (
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="flex-shrink-0 text-gray-400" />
                            <span>{order.pickupTime}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Package size={12} /> Items Ordered
                      </p>
                      <ul className="space-y-2">
                        {order?.items?.map((item: any) => (
                          <li key={item.id} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              <span className="text-blue-500 font-black mr-2">{item.quantity}x</span>
                              {item?.product?.name ?? 'Unknown Product'}
                            </span>
                            <span className="font-black text-gray-900 dark:text-white">{(item.price * item.quantity).toLocaleString()} RWF</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="lg:w-64 lg:border-l border-gray-100 dark:border-gray-800 lg:pl-6 flex flex-col justify-between">
                    <div className="text-right lg:text-left mb-4 lg:mb-0">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <h3 className="text-3xl font-black text-simba-orange leading-none">
                        {order.total.toLocaleString()} <span className="text-sm font-medium opacity-60">RWF</span>
                      </h3>
                    </div>
                    
                    {order.status === 'pending' ? (
                      <div className="flex flex-col gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateStatus(order.id, 'completed')}
                          className="w-full py-3 bg-simba-orange text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 dark:shadow-none"
                        >
                          Confirm Order
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateStatus(order.id, 'cancelled')}
                          className="w-full py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                        >
                          Decline
                        </motion.button>
                      </div>
                    ) : (
                      <div className="py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Processed
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
