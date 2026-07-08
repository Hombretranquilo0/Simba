'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { LayoutDashboard, Users, Building2, ShieldCheck, DollarSign } from 'lucide-react';
import ManagerPanel from '@/components/super-admin/ManagerPanel';
import BranchOverview from '@/components/super-admin/BranchOverview';
import CurrencyRatesPanel from '@/components/super-admin/CurrencyRatesPanel';

type Tab = 'overview' | 'managers' | 'currency';

export default function SuperAdminDashboard() {
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'super_admin')) {
      router.push(`/${locale}`);
    }
  }, [isLoading, isAuthenticated, user, router, locale]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-simba-orange" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'super_admin') return null;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Branch Overview', icon: Building2 },
    { id: 'managers', label: 'Manager Management', icon: Users },
    { id: 'currency', label: 'Currency Rates', icon: DollarSign },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-simba-orange" />
            Super Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Full control over all branches and managers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
            Welcome, <span className="font-bold text-gray-900 dark:text-white">{user.name}</span>
          </div>
          <button
            onClick={() => { logout(); router.push(`/${locale}/login`); }}
            className="text-sm px-4 py-2 rounded-full border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-56 space-y-2 flex-shrink-0">
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

        {/* Main content */}
        <div className="flex-grow bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 min-h-[600px]">
          {activeTab === 'overview' && <BranchOverview token={token!} />}
          {activeTab === 'managers' && <ManagerPanel token={token!} />}
          {activeTab === 'currency' && <CurrencyRatesPanel token={token!} />}
        </div>
      </div>
    </div>
  );
}
