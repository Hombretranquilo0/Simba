'use client';

import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '@/utils/api';
import branches from '@/data/branches';
import {
  Building2, TrendingUp, ShoppingCart, Package,
  Users, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';

interface BranchStat {
  branchId: string;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  revenue: number;
  totalItems: number;
  outOfStock: number;
  managers: { id: number; name: string; email: string }[];
}

interface Overview {
  branches: BranchStat[];
  totals: { revenue: number; orders: number; managers: number };
}

interface Props { token: string }

function fmt(n: number) {
  return n.toLocaleString('en-RW', { maximumFractionDigits: 0 });
}

export default function BranchOverview({ token }: Props) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  // Drilldown data
  const [drillTab, setDrillTab] = useState<'orders' | 'inventory' | 'revenue'>('orders');
  const [drillData, setDrillData] = useState<any>(null);
  const [drillLoading, setDrillLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchOverview = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/super-admin/overview`, { headers });
      if (!res.ok) throw new Error('Failed to load overview');
      setOverview(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const fetchDrill = useCallback(async (branchId: string, tab: 'orders' | 'inventory' | 'revenue') => {
    setDrillLoading(true); setDrillData(null);
    try {
      const res = await fetch(`${API_URL}/super-admin/branch/${branchId}/${tab}`, { headers });
      if (!res.ok) throw new Error('Failed to load data');
      setDrillData(await res.json());
    } catch (e: any) { setDrillData({ error: e.message }); }
    finally { setDrillLoading(false); }
  }, [token]);

  const toggleBranch = (branchId: string) => {
    if (expanded === branchId) { setExpanded(null); setDrillData(null); return; }
    setExpanded(branchId);
    setDrillTab('orders');
    fetchDrill(branchId, 'orders');
  };

  const switchDrillTab = (tab: 'orders' | 'inventory' | 'revenue') => {
    setDrillTab(tab);
    if (expanded) fetchDrill(expanded, tab);
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-simba-orange" />
    </div>
  );

  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  if (!overview) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Branches</h2>
        <button onClick={fetchOverview} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Global totals */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-simba-orange/20 rounded-2xl p-4 text-center">
          <TrendingUp className="mx-auto mb-1 text-simba-orange" size={22} />
          <p className="text-2xl font-black text-gray-900 dark:text-white">{fmt(overview.totals.revenue)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Revenue (RWF)</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-center">
          <ShoppingCart className="mx-auto mb-1 text-blue-500" size={22} />
          <p className="text-2xl font-black text-gray-900 dark:text-white">{overview.totals.orders}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Orders</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-4 text-center">
          <Users className="mx-auto mb-1 text-green-500" size={22} />
          <p className="text-2xl font-black text-gray-900 dark:text-white">{overview.totals.managers}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active Managers</p>
        </div>
      </div>

      {/* Per-branch rows */}
      <div className="space-y-3">
        {overview.branches.map((stat) => {
          const branch = branches.find((b) => b.id === stat.branchId);
          const isOpen = expanded === stat.branchId;
          return (
            <div key={stat.branchId} className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
              {/* Branch header row */}
              <button
                onClick={() => toggleBranch(stat.branchId)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-simba-orange" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                      {branch?.shortName ?? stat.branchId}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{branch?.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(stat.revenue)} RWF</p>
                    <p className="text-xs text-gray-400">Revenue</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.totalOrders}</p>
                    <p className="text-xs text-gray-400">Orders</p>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.managers.length}</p>
                    <p className="text-xs text-gray-400">Managers</p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {/* Drilldown panel */}
              {isOpen && (
                <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-5">
                  {/* Mini stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Revenue', value: `${fmt(stat.revenue)} RWF`, color: 'text-simba-orange' },
                      { label: 'Orders', value: stat.totalOrders, color: 'text-blue-500' },
                      { label: 'Stock Items', value: stat.totalItems, color: 'text-green-500' },
                      { label: 'Out of Stock', value: stat.outOfStock, color: 'text-red-500' },
                    ].map((s) => (
                      <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
                        <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Managers */}
                  {stat.managers.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {stat.managers.map((m) => (
                        <span key={m.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                          <Users size={10} /> {m.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Drill tabs */}
                  <div className="flex gap-2 mb-4">
                    {(['orders', 'inventory', 'revenue'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => switchDrillTab(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                          drillTab === tab
                            ? 'bg-simba-orange text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Drill content */}
                  {drillLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-simba-orange" />
                    </div>
                  ) : drillData?.error ? (
                    <p className="text-red-500 text-sm">{drillData.error}</p>
                  ) : drillTab === 'orders' && Array.isArray(drillData) ? (
                    <DrillOrders orders={drillData} />
                  ) : drillTab === 'inventory' && Array.isArray(drillData) ? (
                    <DrillInventory products={drillData} />
                  ) : drillTab === 'revenue' && drillData ? (
                    <DrillRevenue data={drillData} />
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Drill sub-components ────────────────────────────────────────────────────

function DrillOrders({ orders }: { orders: any[] }) {
  if (orders.length === 0) return <p className="text-sm text-gray-400 py-4 text-center">No orders for this branch yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-700">
            <th className="pb-2 pr-3 font-bold">Customer</th>
            <th className="pb-2 pr-3 font-bold">Total</th>
            <th className="pb-2 pr-3 font-bold">Status</th>
            <th className="pb-2 font-bold">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 10).map((o) => (
            <tr key={o.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-colors">
              <td className="py-2 pr-3 font-medium text-gray-800 dark:text-gray-200">{o.user?.name ?? '—'}</td>
              <td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{fmt(o.total)} RWF</td>
              <td className="py-2 pr-3">
                <span className={`px-2 py-0.5 rounded-full font-bold ${
                  o.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                  o.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-500'
                }`}>{o.status}</span>
              </td>
              <td className="py-2 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length > 10 && <p className="text-xs text-gray-400 mt-2 text-right">Showing 10 of {orders.length}</p>}
    </div>
  );
}

function DrillInventory({ products }: { products: any[] }) {
  const outOfStock = products.filter((p) => !p.inStock);
  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">{products.length} products · {outOfStock.length} out of stock</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-700">
              <th className="pb-2 pr-3 font-bold">Product</th>
              <th className="pb-2 pr-3 font-bold">Category</th>
              <th className="pb-2 pr-3 font-bold">Price</th>
              <th className="pb-2 font-bold">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.filter((p) => !p.inStock).slice(0, 10).map((p) => (
              <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800">
                <td className="py-2 pr-3 font-medium text-gray-800 dark:text-gray-200 truncate max-w-[140px]">{p.name}</td>
                <td className="py-2 pr-3 text-gray-400 truncate max-w-[100px]">{p.category}</td>
                <td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{fmt(p.price)}</td>
                <td className="py-2">
                  <span className="px-2 py-0.5 rounded-full font-bold bg-red-100 dark:bg-red-900/30 text-red-500">
                    {p.stockQuantity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {outOfStock.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">All products in stock ✓</p>}
      </div>
    </div>
  );
}

function DrillRevenue({ data }: { data: { totalRevenue: number; revenueByDay: Record<string, number>; orderCount: number } }) {
  const days = Object.entries(data.revenueByDay);
  const maxVal = Math.max(...days.map(([, v]) => v), 1);
  return (
    <div>
      <div className="flex gap-6 mb-4">
        <div>
          <p className="text-2xl font-black text-simba-orange">{fmt(data.totalRevenue)} RWF</p>
          <p className="text-xs text-gray-400">Total Revenue (completed orders)</p>
        </div>
        <div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{data.orderCount}</p>
          <p className="text-xs text-gray-400">Completed Orders</p>
        </div>
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Last 7 Days</p>
      <div className="flex items-end gap-1.5 h-20">
        {days.map(([day, val]) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-simba-orange/80 transition-all"
              style={{ height: `${(val / maxVal) * 100}%`, minHeight: val > 0 ? '4px' : '2px', opacity: val > 0 ? 1 : 0.2 }}
            />
            <span className="text-[9px] text-gray-400 rotate-45 origin-left">{day.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
