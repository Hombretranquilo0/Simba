'use client';

import { getProducts } from '@/utils/products';
import ProductCard from '@/components/ProductCard';
import { useTranslation } from '@/context/TranslationContext';
import { translateCategory } from '@/utils/i18n';
import { useSearch } from '@/context/SearchContext';
import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Product } from '@/types/product';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PriceSlider from '@/components/PriceSlider';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoryPage() {
  const params = useParams();
  const locale = params.locale as string;
  const slug = decodeURIComponent(params.slug as string);

  const [products, setProducts] = useState<Product[]>([]);
  const { dictionary, t } = useTranslation();
  const {
    priceRange, setPriceRange,
    minPriceLimit, maxPriceLimit,
    setMinPriceLimit, setMaxPriceLimit,
    inStockOnly, setInStockOnly,
  } = useSearch();
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name-asc'>('name-asc');

  useEffect(() => {
    getProducts().then(all => {
      const cat = all.filter(p => p.category === slug);
      setProducts(cat);
      if (cat.length > 0) {
        const prices = cat.map(p => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setMinPriceLimit(min);
        setMaxPriceLimit(max);
        setPriceRange([min, max]);
      }
    });
  }, [slug]);

  const filtered = useMemo(() => {
    let result = products.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1] && (!inStockOnly || p.inStock)
    );
    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [products, priceRange, inStockOnly, sortBy]);

  const translatedCategory = translateCategory(slug, dictionary);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex mb-8 text-sm font-medium text-gray-500 dark:text-gray-400">
        <Link href={`/${locale}`} className="hover:text-simba-orange flex items-center gap-2 transition-colors">
          <ArrowLeft size={16} />
          Back to Shop
        </Link>
        <span className="mx-3 text-gray-300 dark:text-gray-700">/</span>
        <span className="text-gray-900 dark:text-white font-bold">{translatedCategory}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-10 pb-20">
        {/* Sidebar */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="sticky top-28 space-y-8">
            <PriceSlider min={minPriceLimit} max={maxPriceLimit} />

            <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
                Filters
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`w-full text-left px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                    inStockOnly
                      ? 'text-simba-orange bg-orange-50 dark:bg-simba-gold/10'
                      : 'text-gray-500 hover:text-simba-orange hover:bg-orange-50 dark:hover:bg-simba-gold/10'
                  }`}
                >
                  {inStockOnly ? '✓ In Stock Only' : 'In Stock Only'}
                </button>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">Sort By</p>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-simba-orange/20"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-grow">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-3 h-10 bg-simba-orange rounded-full" />
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {translatedCategory}
              </h1>
              <p className="text-sm text-gray-500">{filtered.length} {t('common.items')} available</p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
              <p className="text-gray-500 font-medium">No products found with current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map(product => (
                  <motion.div key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ProductCard product={product} locale={locale} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
