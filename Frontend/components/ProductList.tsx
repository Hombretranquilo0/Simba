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
import { Loader2, Tag } from 'lucide-react';
import Link from 'next/link';

import API_URL from '@/utils/api';
import { useBranch } from '@/context/BranchContext';

interface ProductListProps {
  initialProducts: Product[];
  discountedProducts?: Product[];
}

const ProductList = ({ initialProducts, discountedProducts = [] }: ProductListProps) => {
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
  const { selectedBranch } = useBranch();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name-asc'>('name-asc');
  const [aiResults, setAiResults] = useState<Product[] | null>(null);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [aiSearching, setAiSearching] = useState(false);

  // AI search effect: when debouncedSearchTerm changes, call backend
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setAiResults(null);
      setAiMessage('');
      setAiSearching(false);
      return;
    }

    setAiSearching(true);
    const controller = new AbortController();

    fetch(`${API_URL}/ai/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: debouncedSearchTerm, branchId: selectedBranch?.id }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('AI search failed');
        return res.json();
      })
      .then((data) => {
        // Handle both { products, message } shape and legacy plain array
        if (data && !Array.isArray(data) && Array.isArray(data.products)) {
          setAiResults(data.products);
          setAiMessage(data.message || '');
        } else {
          setAiResults(Array.isArray(data) ? data : []);
          setAiMessage('');
        }
        setAiSearching(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('AI search error, using client-side filter:', err);
          setAiResults(null);
          setAiMessage('');
          setAiSearching(false);
        }
      });

    return () => controller.abort();
  }, [debouncedSearchTerm]);

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
    // When AI search is active, use AI results
    if (aiResults !== null) {
      let results = [...aiResults];

      // Apply client-side price and inStock filters on top of AI results
      results = results.filter(
        (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
      );
      if (inStockOnly) {
        results = results.filter((product) => product.inStock);
      }

      results.sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return 0;
      });

      return results;
    }

    // Default: client-side filtering
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
  }, [debouncedSearchTerm, initialProducts, dictionary, priceRange, inStockOnly, sortBy, aiResults]);

  // Filter discounted strip using the same active search/AI/price/stock state
  const filteredDiscounted = useMemo(() => {
    if (discountedProducts.length === 0) return [];
    let results = discountedProducts.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1] && (!inStockOnly || p.inStock)
    );
    if (aiResults !== null) {
      const aiIds = new Set(aiResults.map(p => p.id));
      results = results.filter(p => aiIds.has(p.id));
    } else if (debouncedSearchTerm.trim()) {
      const lower = debouncedSearchTerm.toLowerCase();
      results = results.filter(
        p => p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower)
      );
    }
    return results;
  }, [discountedProducts, aiResults, debouncedSearchTerm, priceRange, inStockOnly]);

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

  // All categories from full (unfiltered) product list for sidebar navigation
  const allCategories = useMemo(() => {
    return [...new Set(initialProducts.map(p => p.category))].sort();
  }, [initialProducts]);

  if (isInitialLoading) {
    return (
      <>
        {discountedProducts.length > 0 && (
          <section id="deals" className="mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Tag size={20} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">🔥 On Sale</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Limited-time discounts just for you</p>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {discountedProducts.map(product => (
                <div key={product.id} className="flex-shrink-0 w-52">
                  <ProductCard product={product} locale={locale} />
                </div>
              ))}
            </div>
          </section>
        )}
        <ProductGridSkeleton />
      </>
    );
  }

  const handleResetFilters = () => {
    setPriceRange([minPriceLimit, maxPriceLimit]);
    setInStockOnly(false);
    setSortBy('name-asc');
  };

  return (
    <>
      {/* On Sale strip — filtered by active search/AI/price/stock */}
      {filteredDiscounted.length > 0 && (
        <section id="deals" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Tag size={20} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">🔥 On Sale</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Limited-time discounts just for you</p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-orange-200 dark:scrollbar-thumb-orange-900">
            {filteredDiscounted.map(product => (
              <div key={product.id} className="flex-shrink-0 w-52">
                <ProductCard product={product} locale={locale} />
              </div>
            ))}
          </div>
        </section>
      )}
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
                className="w-full text-left px-4 py-2 text-sm font-bold text-gray-500 hover:text-simba-orange hover:bg-orange-50 dark:hover:bg-simba-gold/10 rounded-xl transition-all"
              >
                Reset Price
              </button>
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
        {aiSearching ? (
          <div className="flex flex-col items-center justify-center py-24 px-4">
            <Loader2 size={48} className="animate-spin text-simba-orange mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Searching...</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md text-lg">
              Analyzing your query &ldquo;{debouncedSearchTerm}&rdquo; with AI...
            </p>
          </div>
        ) : aiMessage ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 px-5 py-3.5 bg-orange-50 dark:bg-simba-gold/10 border border-orange-200 dark:border-simba-gold/20 rounded-2xl text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="flex-shrink-0 mt-0.5 text-base">🤖</span>
              <span>{aiMessage}</span>
            </motion.div>
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
                  {t('common.noProductsDesc', { searchTerm: debouncedSearchTerm })}
                </p>
                <button onClick={handleResetFilters} className="mt-8 text-simba-orange dark:text-simba-gold font-bold hover:underline">
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              categories.map((category, categoryIdx) => (
                <motion.section
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, delay: categoryIdx * 0.1 }}
                  className="scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-10 bg-simba-orange dark:bg-simba-gold rounded-full shadow-lg shadow-simba-orange/20" />
                      <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                          {translateCategory(category, dictionary)}
                        </h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {groupedProducts[category].length} {t('common.items')} available
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/${locale}/category/${encodeURIComponent(category)}`}
                      className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-sm px-5 py-2.5 rounded-2xl shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
                    >
                      View All
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                    <AnimatePresence mode="popLayout">
                      {groupedProducts[category].slice(0, 8).map((product) => (
                        <ProductCard key={product.id} product={product} locale={locale} />
                      ))}
                    </AnimatePresence>
                  </div>
                  {groupedProducts[category].length > 8 && (
                    <div className="mt-8 text-center">
                      <Link
                        href={`/${locale}/category/${encodeURIComponent(category)}`}
                        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
                      >
                        View all {groupedProducts[category].length} products
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </motion.section>
              ))
            )}
          </>
        ) : filteredProducts.length === 0 ? (
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
              className="mt-8 text-simba-orange dark:text-simba-gold font-bold hover:underline"
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
                  <div className="w-3 h-10 bg-simba-orange dark:bg-simba-gold rounded-full shadow-lg shadow-simba-orange/20" />
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {translateCategory(category, dictionary)}
                    </h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {groupedProducts[category].length} {t('common.items')} available
                    </p>
                  </div>
                </div>
                
                <Link
                  href={`/${locale}/category/${encodeURIComponent(category)}`}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-sm px-5 py-2.5 rounded-2xl shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
                >
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                <AnimatePresence mode="popLayout">
                  {groupedProducts[category].slice(0, 8).map((product) => (
                    <ProductCard key={product.id} product={product} locale={locale} />
                  ))}
                </AnimatePresence>
              </div>
              {groupedProducts[category].length > 8 && (
                <div className="mt-8 text-center">
                  <Link
                    href={`/${locale}/category/${encodeURIComponent(category)}`}
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
                  >
                    View all {groupedProducts[category].length} products
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </motion.section>
          ))
        )}
      </div>
    </div>
    </>
  );
};

export default ProductList;
