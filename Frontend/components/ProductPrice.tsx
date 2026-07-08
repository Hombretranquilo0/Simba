'use client';
import { useCurrency } from '@/context/CurrencyContext';

interface Props {
  price: number;
  unit?: string | null;
  per: string;
}

export default function ProductPrice({ price, unit, per }: Props) {
  const { format } = useCurrency();
  return (
    <div className="flex items-baseline gap-3 mb-2 flex-wrap">
      <span className="text-5xl font-black text-simba-orange dark:text-simba-gold tracking-tighter">
        {format(price)}
      </span>
      {unit && (
        <span className="ml-1 text-sm font-bold text-gray-400 uppercase tracking-widest">
          / {per} {unit}
        </span>
      )}
    </div>
  );
}
