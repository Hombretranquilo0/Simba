'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import API_URL from '@/utils/api';

export type Currency = 'RWF' | 'USD' | 'EUR';

interface Rates { USD: number; EUR: number }

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Rates;
  /** Convert a RWF amount to the selected currency and return a formatted string */
  format: (rwf: number) => string;
  /** Convert a RWF amount to the selected currency numeric value */
  convert: (rwf: number) => number;
  symbol: string;
}

const DEFAULT_RATES: Rates = { USD: 0.000714, EUR: 0.000658 };

const SYMBOLS: Record<Currency, string> = { RWF: 'RWF', USD: '$', EUR: '€' };

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('RWF');
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);

  // Rehydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('simba_currency') as Currency | null;
    if (saved && ['RWF', 'USD', 'EUR'].includes(saved)) {
      setCurrencyState(saved);
    }
  }, []);

  // Fetch rates from backend once on mount
  useEffect(() => {
    fetch(`${API_URL}/currency/rates`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.USD && data?.EUR) {
          setRates({ USD: parseFloat(data.USD), EUR: parseFloat(data.EUR) });
        }
      })
      .catch(() => {}); // silently fall back to defaults
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('simba_currency', c);
  }, []);

  const convert = useCallback(
    (rwf: number): number => {
      if (currency === 'RWF') return rwf;
      if (currency === 'USD') return rwf * rates.USD;
      return rwf * rates.EUR;
    },
    [currency, rates],
  );

  const format = useCallback(
    (rwf: number): string => {
      const value = convert(rwf);
      if (currency === 'RWF') {
        return `${Math.round(value).toLocaleString()} RWF`;
      }
      return `${SYMBOLS[currency]}${value.toFixed(2)}`;
    },
    [convert, currency],
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, rates, format, convert, symbol: SYMBOLS[currency] }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
