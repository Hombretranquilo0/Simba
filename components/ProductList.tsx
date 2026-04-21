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

interface ProductListProps {
  initialProducts: Product[];
}

const ProductList = ({ initialProducts }: ProductListProps) => {
  const { debouncedSearchTerm } = useSearch();
  const { t, dictionary } = useTranslation();
  const params = useParams();
  const locale = params.locale as string;
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return initialProducts;
    
    const lowerSearch = debouncedSearchTerm.toLowerCase();
    return initialProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerSearch) ||
        translateCategory(product.category, dictionary).toLowerCase().includes(lowerSearch)
    );
  }, [debouncedSearchTerm, initialProducts, dictionary]);

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

  if (filteredProducts.length === 0) {
    return (
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
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 text-green-700 dark:text-green-500 font-bold hover:underline"
        >
          Clear filters
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-20 pb-20">
      {categories.map((category, categoryIdx) => (
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
              <div className="w-3 h-10 bg-green-600 dark:bg-green-500 rounded-full shadow-lg shadow-green-600/20" />
              <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {translateCategory(category, dictionary)}
                </h2>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {groupedProducts[category].length} {t('common.items')} available
                </p>
              </div>
            </div>
            
            <button className="text-green-700 dark:text-green-500 font-bold text-sm hover:underline flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {groupedProducts[category].map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      ))}
    </div>
  );
};

export default ProductList;
