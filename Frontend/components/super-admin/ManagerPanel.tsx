'use client';

import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '@/utils/api';
import branches from '@/data/branches';
import { UserPlus, Trash2, RefreshCw, Lock, ChevronDown } from 'lucide-react';

interface Manager {
  id: number;
  email: string;
  name: string;
  managedBranchId: string | null;
}

interface Props {
  token: string;
}

export default function ManagerPanel({ token }: Props) {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', managedBranchId: '' });
  const [formError, setFormError] = useState('');

  // Reassign state: managerId -> new branchId string
  const [reassigning, setReassigning] = useState<Record<number, string>>({});
  const [reassignLoading, setReassignLoading] = useState<number | null>(null);

  // Remove loading
  const [removeLoading, setRemoveLoading] = useState<number | null>(null);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/super-admin/managers`, { headers });
      if (!res.ok) throw new Error('Failed to load managers');
      const data = await res.json();
      setManagers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchManagers(); }, [fetchManagers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.managedBranchId) { setFormError('Please select a branch.'); return; }
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/super-admin/managers`, {
        method: 'POST', headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create manager');
      setForm({ name: '', email: '', password: '', managedBranchId: '' });
      setShowCreate(false);
      fetchManagers();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleReassign = async (managerId: number) => {
    const newBranch = reassigning[managerId];
    if (!newBranch) return;
    setReassignLoading(managerId);
    try {
      const res = await fetch(`${API_URL}/super-admin/managers/${managerId}/reassign`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ managedBranchId: newBranch }),
      });
      if (!res.ok) throw new Error('Reassign failed');
      setReassigning((prev) => { const n = { ...prev }; delete n[managerId]; return n; });
      fetchManagers();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setReassignLoading(null);
    }
  };

  const handleRemove = async (managerId: number, name: string) => {
    if (!confirm(`Remove manager "${name}"? This cannot be undone.`)) return;
    setRemoveLoading(managerId);
    try {
      const res = await fetch(`${API_URL}/super-admin/managers/${managerId}`, {
        method: 'DELETE', headers,
      });
      if (!res.ok) throw new Error('Remove failed');
      fetchManagers();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRemoveLoading(null);
    }
  };

  const branchName = (id: string | null) =>
    branches.find((b) => b.id === id)?.shortName ?? id ?? '—';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Managers</h2>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-simba-orange text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-md shadow-simba-orange/20"
        >
          <UserPlus size={16} />
          {showCreate ? 'Cancel' : 'Add Manager'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 p-5 bg-orange-50 dark:bg-orange-900/10 border border-simba-orange/20 rounded-2xl space-y-3">
          <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider mb-1">New Manager Account</h3>
          {formError && <p className="text-red-600 text-sm">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full Name"
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-simba-orange/40"
            />
            <input
              required type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-simba-orange/40"
            />
            <input
              required type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-simba-orange/40"
            />
            <select
              required value={form.managedBranchId}
              onChange={(e) => setForm({ ...form, managedBranchId: e.target.value })}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-simba-orange/40"
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.shortName}</option>
              ))}
            </select>
          </div>
          <button
            type="submit" disabled={creating}
            className="px-5 py-2 bg-simba-orange text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {creating ? 'Creating…' : 'Create Manager'}
          </button>
        </form>
      )}

      {/* Manager list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-simba-orange" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : managers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Lock size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No managers yet</p>
          <p className="text-sm mt-1">Create one using the button above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {managers.map((m) => {
            const pendingBranch = reassigning[m.id] ?? m.managedBranchId ?? '';
            return (
              <div
                key={m.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{m.name}</p>
                  <p className="text-xs text-gray-500 truncate">{m.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                    {branchName(m.managedBranchId)}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Reassign select + button */}
                  <select
                    value={pendingBranch}
                    onChange={(e) => setReassigning({ ...reassigning, [m.id]: e.target.value })}
                    className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-simba-orange/40"
                  >
                    <option value="">Select branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.shortName}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleReassign(m.id)}
                    disabled={
                      reassignLoading === m.id ||
                      !reassigning[m.id] ||
                      reassigning[m.id] === m.managedBranchId
                    }
                    title="Save reassignment"
                    className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/60 disabled:opacity-30 transition-colors"
                  >
                    {reassignLoading === m.id
                      ? <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-blue-600" />
                      : <RefreshCw size={14} />
                    }
                  </button>
                  <button
                    onClick={() => handleRemove(m.id, m.name)}
                    disabled={removeLoading === m.id}
                    title="Remove manager"
                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/60 disabled:opacity-30 transition-colors"
                  >
                    {removeLoading === m.id
                      ? <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-red-500" />
                      : <Trash2 size={14} />
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
