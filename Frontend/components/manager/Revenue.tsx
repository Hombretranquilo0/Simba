'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, CreditCard, DollarSign, BarChart3, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Revenue({ token }: { token: string }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/manager/revenue', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      <p className="text-gray-500 font-medium">Fetching real-time financial data...</p>
    </div>
  );
  
  if (!stats) return (
    <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 text-center">
      <p className="text-red-600 font-bold">Failed to retrieve revenue data from database.</p>
    </div>
  );

  const revenueEntries = Object.entries(stats.revenueByDay).sort((a, b) => a[0].localeCompare(b[0]));
  const maxAmount = Math.max(...Object.values(stats.revenueByDay) as number[], 1000);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black tracking-tight">Financial Analytics</h2>
        <div className="flex items-center gap-2 bg-orange-100 dark:bg-green-900/30 text-simba-orange dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <Clock size={12} />
          <span>Live Database Feed</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-simba-orange rounded-2xl text-white shadow-lg shadow-orange-200 dark:shadow-none">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                {stats.totalRevenue.toLocaleString()} <span className="text-sm font-medium text-gray-400">RWF</span>
              </h3>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-simba-orange"
            />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-none">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Orders</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.orderCount}</h3>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.7 }}
              className="h-full bg-blue-500"
            />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-200 dark:shadow-none">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Avg Order</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                {stats.orderCount > 0 ? Math.round(stats.totalRevenue / stats.orderCount).toLocaleString() : '0'} <span className="text-sm font-medium text-gray-400">RWF</span>
              </h3>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.9 }}
              className="h-full bg-orange-500"
            />
          </div>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm mb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black flex items-center gap-2">
              <BarChart3 size={20} className="text-simba-orange" />
              Revenue Trend
            </h3>
            <p className="text-sm text-gray-400">Earnings over the last 7 days</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-simba-orange rounded-sm"></div>
              <span>Daily Revenue</span>
            </div>
          </div>
        </div>

        <div className="h-72 flex items-end gap-3 px-2 pt-10 border-b border-gray-100 dark:border-gray-800 relative">
          {/* Y-Axis labels (approximate) */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-300 font-bold -ml-8">
            <span>{maxAmount.toLocaleString()}</span>
            <span>{(maxAmount / 2).toLocaleString()}</span>
            <span>0</span>
          </div>

          {revenueEntries.map(([day, amount]: [string, any], index) => {
            const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 2; // Min height for visibility
            return (
              <div key={day} className="flex-grow flex flex-col items-center group relative h-full justify-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                  className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-xl transition-all duration-300 group-hover:from-simba-orange group-hover:to-orange-300 cursor-pointer relative"
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-black py-2 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-xl pointer-events-none transform group-hover:-translate-y-2">
                    {amount.toLocaleString()} RWF
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900"></div>
                  </div>
                </motion.div>
                <div className="mt-4 text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                  {new Date(day).toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
                <div className="text-[9px] text-gray-300 font-medium">
                  {new Date(day).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
          <Clock size={20} className="text-blue-500" />
          Recent Daily Logs
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {revenueEntries.slice().reverse().map(([day, amount]: [string, any]) => (
            <motion.div 
              key={day}
              whileHover={{ x: 10 }}
              className="flex justify-between items-center p-5 bg-white dark:bg-gray-900 border border-gray-50 dark:border-gray-800 rounded-2xl shadow-sm"
            >
              <div className="flex flex-col">
                <span className="font-black text-gray-900 dark:text-white">
                  {new Date(day).toLocaleDateString(undefined, { weekday: 'long' })}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(day).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-lg font-black ${amount > 0 ? 'text-simba-orange' : 'text-gray-300'}`}>
                  {amount.toLocaleString()} RWF
                </span>
                <div className={`w-2 h-2 rounded-full ${amount > 0 ? 'bg-simba-orange animate-pulse' : 'bg-gray-200'}`}></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

