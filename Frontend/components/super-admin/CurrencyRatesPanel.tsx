'use client';

import React, { useState, useEffect } from 'react';
import API_URL from '@/utils/api';
import { DollarSign, Save, RefreshCw } from 'lucide-react';

interface Props { token: string }

export default function CurrencyRatesPanel({ token }: Props) {
  const [usd, setUsd] = useState('');
  const [eur, setEur] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/currency/rates`);
      const data = await res.json();
      setUsd(String(data.USD));
      setEur(String(data.EUR));
      setUpdatedAt(data.updatedAt);
    } catch {
      setError('Failed to load current rates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRates(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const parsedUsd = parseFloat(usd);
    const parsedEur = parseFloat(eur);
    if (isNaN(parsedUsd) || parsedUsd <= 0 || isNaN(parsedEur) || parsedEur <= 0) {
      setError('Both rates must be positive numbers.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/currency/rates`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ USD: parsedUsd, EUR: parsedEur }),
      });
      if (!res.ok) throw new Error('Failed to save rates');
      const data = await res.json();
      setUpdatedAt(data.updatedAt);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper: show intuitive "1 USD = X RWF" alongside the stored rate
  const toRwf = (rate: string) => {
    const n = parseFloat(rate);
    if (!n || n <= 0) return '—';
    return Math.round(1 / n).toLocaleString();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <DollarSign size={20} className="text-simba-orange" />
          Currency Exchange Rates
        </h2>
        <button onClick={fetchRates} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors" title="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Set how many USD / EUR equal 1 RWF. These rates are used site-wide for the currency switcher display.
        {updatedAt && (
          <span className="ml-2 text-xs text-gray-400">Last updated: {new Date(updatedAt).toLocaleString()}</span>
        )}
      </p>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-simba-orange" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5 max-w-md">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm font-bold">✓ Rates updated successfully.</p>}

          {/* USD */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
              USD Rate <span className="text-gray-400 font-normal normal-case">(1 RWF = ? USD)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.000001"
                min="0.000001"
                value={usd}
                onChange={(e) => setUsd(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-simba-orange/40"
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">
                ≈ 1 USD = <strong className="text-gray-700 dark:text-gray-300">{toRwf(usd)} RWF</strong>
              </span>
            </div>
          </div>

          {/* EUR */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
              EUR Rate <span className="text-gray-400 font-normal normal-case">(1 RWF = ? EUR)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.000001"
                min="0.000001"
                value={eur}
                onChange={(e) => setEur(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-simba-orange/40"
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">
                ≈ 1 EUR = <strong className="text-gray-700 dark:text-gray-300">{toRwf(eur)} RWF</strong>
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-simba-orange text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-md shadow-simba-orange/20"
          >
            {saving ? <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-white" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save Rates'}
          </button>
        </form>
      )}
    </div>
  );
}
