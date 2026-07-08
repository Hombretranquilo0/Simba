'use client';

import { useCurrency, Currency } from '@/context/CurrencyContext';

const OPTIONS: { value: Currency; label: string }[] = [
  { value: 'RWF', label: 'RWF' },
  { value: 'USD', label: '$' },
  { value: 'EUR', label: '€' },
];

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      role="group"
      aria-label="Select currency"
      className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5 border border-gray-200 dark:border-gray-700"
    >
      {OPTIONS.map((o) => {
        const active = currency === o.value;
        return (
          <button
            key={o.value}
            onClick={() => setCurrency(o.value)}
            aria-pressed={active}
            className={`
              relative px-2.5 py-1 text-xs font-black rounded-lg transition-all duration-150 select-none
              ${active
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }
            `}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
