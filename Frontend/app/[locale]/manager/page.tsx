'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Inventory from '@/components/manager/Inventory';
import Orders from '@/components/manager/Orders';
import Revenue from '@/components/manager/Revenue';
import { LayoutDashboard, Package, ShoppingCart, DollarSign } from 'lucide-react';

export default function ManagerDashboard() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'manager') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'manager') {
    return null;
  }

  const tabs = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LayoutDashboard className="text-simba-orange" />
          Manager Dashboard
        </h1>
        <div className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
          Welcome back, <span className="font-bold text-gray-900 dark:text-white">{user.name}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-simba-orange text-white shadow-lg shadow-simba-orange/20'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-grow bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 min-h-[600px]">
          {activeTab === 'inventory' && <Inventory token={token!} />}
          {activeTab === 'orders' && <Orders token={token!} />}
          {activeTab === 'revenue' && <Revenue token={token!} />}
        </div>
      </div>
    </div>
  );
}
