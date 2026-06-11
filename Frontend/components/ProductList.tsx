'use client';

import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import { useSearch } from '@/context/SearchContext';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductGridSkeleton } from './ProductSkeleton';
import { translateCategory } from '@/utils/i18n';
import { useParams } from 'next/navigation';
import PriceSlider from './PriceSlider';

interface ProductListProps {
  initialProducts: Product[];
}

const ProductList = ({ initialProducts }: ProductListProps) => {
  const { 
    debouncedSearchTerm, 
    priceRange, 
    setMinPriceLimit, 
    setMaxPriceLimit,
    minPriceLimit,
    maxPriceLimit,
    setPriceRange,
    inStockOnly,
    setInStockOnly
  } = useSearch();
  const { t, dictionary } = useTranslation();
  const params = useParams();
  const locale = params.locale as string;
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name-asc'>('name-asc');

  // Initialize price limits based on initialProducts
  useEffect(() => {
    if (initialProducts.length > 0) {
      const prices = initialProducts.map(p => p.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setMinPriceLimit(min);
      setMaxPriceLimit(max);
      
      // Only set initial price range if it's the first load (default values)
      if (priceRange[0] === 0 && priceRange[1] === 1000000) {
        setPriceRange([min, max]);
      }
    }
  }, [initialProducts, setMinPriceLimit, setMaxPriceLimit, setPriceRange, priceRange]);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    let results = [...initialProducts];

    // Search filter
    if (debouncedSearchTerm.trim()) {
      const lowerSearch = debouncedSearchTerm.toLowerCase();
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerSearch) ||
          translateCategory(product.category, dictionary).toLowerCase().includes(lowerSearch)
      );
    }

    // Price filter
    results = results.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // In Stock filter
    if (inStockOnly) {
      results = results.filter((product) => product.inStock);
    }

    // Sorting
    results.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });

    return results;
  }, [debouncedSearchTerm, initialProducts, dictionary, priceRange, inStockOnly, sortBy]);

  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc, product: Product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [filteredProducts]);

  const categories = Object.keys(groupedProducts).sort();

  if (isInitialLoading) {
    return <ProductGridSkeleton />;
  }

  const handleResetFilters = () => {
    setPriceRange([minPriceLimit, maxPriceLimit]);
    setInStockOnly(false);
    setSortBy('name-asc');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 pb-20">
      {/* Sidebar Filters */}
      <aside className="lg:w-72 flex-shrink-0 space-y-8">
        <div className="sticky top-28 space-y-8">
          <PriceSlider min={minPriceLimit} max={maxPriceLimit} />
          
          <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
              Quick Filters
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => setPriceRange([minPriceLimit, maxPriceLimit])}
                className="w-full text-left px-4 py-2 text-sm font-bold text-gray-500 hover:text-simba-orange hover:bg-orange-50 dark:hover:bg-green-900/20 rounded-xl transition-all"
              >
                Reset Price
              </button>
              <button 
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`w-full text-left px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                  inStockOnly 
                    ? 'text-simba-orange bg-orange-50 dark:bg-green-900/20' 
                    : 'text-gray-500 hover:text-simba-orange hover:bg-orange-50 dark:hover:bg-green-900/20'
                }`}
              >
                {inStockOnly ? '✓ In Stock Only' : 'In Stock Only'}
              </button>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">Sort By</p>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
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

      {/* Main Content */}
      <div className="flex-grow space-y-20">
        {filteredProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800"
          >
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-full mb-6 text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('common.noProducts')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-md text-lg">
              {debouncedSearchTerm ? t('common.noProductsDesc', { searchTerm: debouncedSearchTerm }) : "No products found with current filters."}
            </p>
            <button 
              onClick={handleResetFilters}
              className="mt-8 text-simba-orange dark:text-green-500 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          categories.map((category, categoryIdx) => (
            <motion.section 
              key={category} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: categoryIdx * 0.1 }}
              className="scroll-mt-24"
            >
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-10 bg-simba-orange dark:bg-green-500 rounded-full shadow-lg shadow-simba-orange/20" />
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {translateCategory(category, dictionary)}
                    </h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {groupedProducts[category].length} {t('common.items')} available
                    </p>
                  </div>
                </div>
                
                <button className="text-simba-orange dark:text-green-500 font-bold text-sm hover:underline flex items-center gap-1">
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                <AnimatePresence mode="popLayout">
                  {groupedProducts[category].map((product) => (
                    <ProductCard key={product.id} product={product} locale={locale} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
