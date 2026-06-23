'use client';

import { getProducts } from '@/utils/products';
import ProductList from '@/components/ProductList';
import ProductCard from '@/components/ProductCard';
import { useTranslation } from '@/context/TranslationContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { Tag } from 'lucide-react';

import { useSearch } from '@/context/SearchContext';
import API_URL from '@/utils/api';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [discounted, setDiscounted] = useState<Product[]>([]);
  const { t } = useTranslation();
  const params = useParams();
  const locale = params.locale as string;
  const { priceRange, inStockOnly, setPriceRange, minPriceLimit, maxPriceLimit } = useSearch();

  useEffect(() => {
    getProducts().then(setProducts);
    fetch(`${API_URL}/products/discounted`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setDiscounted(Array.isArray(data) ? data : []))
      .catch(() => setDiscounted([]));
  }, []);

  // Reset price filter to defaults whenever home page mounts
  useEffect(() => {
    if (minPriceLimit < maxPriceLimit) {
      setPriceRange([minPriceLimit, maxPriceLimit]);
    }
  }, [minPriceLimit, maxPriceLimit]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      {/* Banner/Hero Section */}
      <section className="relative rounded-[3rem] p-10 sm:p-20 mb-20 overflow-hidden bg-simba-orange dark:bg-simba-gold/20 border border-simba-orange/20 shadow-2xl shadow-simba-gold/10">
        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="inline-block bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-6 shadow-lg shadow-orange-500/30">
              Welcome to Simba
            </span>
            <h2 className="text-5xl sm:text-7xl font-black mb-8 text-white tracking-tighter leading-[0.9]">
              {t('common.freshness')}
            </h2>
            <p className="text-orange-50/80 dark:text-simba-gold/60 text-xl mb-12 leading-relaxed max-w-xl font-medium">
              {t('common.shopTagline')}
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.dispatchEvent(new CustomEvent('open-categories'))}
                className="bg-white text-simba-orange font-black py-5 px-10 rounded-2xl transition-all shadow-xl shadow-white/10 hover:shadow-white/20 text-lg"
              >
                {t('common.shopNow')}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-simba-orange/30 backdrop-blur-md text-white border-2 border-white/20 font-black py-5 px-10 rounded-2xl transition-all text-lg"
              >
                View Deals
              </motion.button>
            </div>
          </motion.div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-simba-orange/20 dark:bg-simba-gold/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-orange-500/10 rounded-full blur-2xl" />
        
        {/* Floating fruit shapes (simulated) */}
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-16 h-16 bg-white/5 rounded-full backdrop-blur-sm hidden lg:block"
        />
        <motion.div 
          animate={{ y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute bottom-40 right-40 w-12 h-12 bg-orange-500/20 rounded-full backdrop-blur-sm hidden lg:block"
        />
      </section>

      {/* Discounted Products Section */}
      {discounted.length > 0 && (() => {
        const visible = discounted.filter(
          p => p.price >= priceRange[0] && p.price <= priceRange[1] && (!inStockOnly || p.inStock)
        );
        if (visible.length === 0) return null;
        return (
          <section className="mb-16">
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
              {visible.map(product => (
                <div key={product.id} className="flex-shrink-0 w-52">
                  <ProductCard product={product} locale={locale} />
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      <ProductList initialProducts={products} />
    </motion.div>
  );
}
