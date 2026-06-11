'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, CreditCard } from 'lucide-react';

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

  if (loading) return <div>Loading revenue stats...</div>;
  if (!stats) return <div>No data available.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Financial Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-900/20">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-green-500 rounded-lg text-white">
              <DollarSign size={20} />
            </div>
            <span className="text-sm font-medium text-green-700 dark:text-green-400 uppercase tracking-wider">Total Revenue</span>
          </div>
          <p className="text-3xl font-black text-green-600">{stats.totalRevenue.toLocaleString()} RWF</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg text-white">
              <ShoppingBag size={20} />
            </div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">Orders</span>
          </div>
          <p className="text-3xl font-black text-blue-600">{stats.orderCount}</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/20">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-orange-500 rounded-lg text-white">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-medium text-orange-700 dark:text-orange-400 uppercase tracking-wider">Avg Order Value</span>
          </div>
          <p className="text-3xl font-black text-orange-600">
            {stats.orderCount > 0 ? (stats.totalRevenue / stats.orderCount).toLocaleString() : '0'} RWF
          </p>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-lg font-bold mb-6">Revenue Chart (Last 7 Days)</h3>
        <div className="h-64 flex items-end gap-2 px-4 border-b border-l border-gray-100 dark:border-gray-800">
          {Object.entries(stats.revenueByDay).sort((a, b) => a[0].localeCompare(b[0])).slice(-7).map(([day, amount]: [string, any]) => {
            const maxAmount = Math.max(...Object.values(stats.revenueByDay) as number[]);
            const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
            return (
              <div key={day} className="flex-grow flex flex-col items-center group relative">
                <div 
                  className="w-full bg-green-500 rounded-t-lg transition-all duration-500 group-hover:bg-green-400 cursor-pointer"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {amount.toLocaleString()} RWF
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-gray-400 font-bold transform -rotate-45 origin-top-left whitespace-nowrap">
                  {new Date(day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Daily Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(stats.revenueByDay).length === 0 ? (
            <p className="text-gray-500">No daily data available yet.</p>
          ) : (
            Object.entries(stats.revenueByDay).sort((a, b) => b[0].localeCompare(a[0])).map(([day, amount]: [string, any]) => (
              <div key={day} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/20 rounded-xl">
                <span className="font-medium">{new Date(day).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="font-bold text-green-600">{amount.toLocaleString()} RWF</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import { DollarSign } from 'lucide-react';
