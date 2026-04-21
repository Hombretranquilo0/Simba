'use client';

import { getProducts } from '@/utils/products';
import ProductList from '@/components/ProductList';
import { useTranslation } from '@/context/TranslationContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Home() {
  const products = getProducts();
  const { t } = useTranslation();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      {/* Banner/Hero Section */}
      <section className="relative rounded-[3rem] p-10 sm:p-20 mb-20 overflow-hidden bg-green-700 dark:bg-green-900/40 border border-green-600/20 shadow-2xl shadow-green-900/20">
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
            <p className="text-green-50/80 dark:text-green-200/60 text-xl mb-12 leading-relaxed max-w-xl font-medium">
              {t('common.shopTagline')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}`}>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-green-800 font-black py-5 px-10 rounded-2xl transition-all shadow-xl shadow-white/10 hover:shadow-white/20 text-lg"
                >
                  {t('common.shopNow')}
                </motion.button>
              </Link>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600/30 backdrop-blur-md text-white border-2 border-white/20 font-black py-5 px-10 rounded-2xl transition-all text-lg"
              >
                View Deals
              </motion.button>
            </div>
          </motion.div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-500/20 dark:bg-green-400/10 rounded-full blur-3xl animate-pulse" />
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

      <ProductList initialProducts={products} />
    </motion.div>
  );
}
