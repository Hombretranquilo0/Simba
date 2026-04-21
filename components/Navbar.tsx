'use client';

import Link from 'next/link';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/TranslationContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { Locale } from '@/utils/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const Navbar = ({ locale }: { locale: Locale }) => {
  const { searchTerm, setSearchTerm } = useSearch();
  const { totalItems } = useCart();
  const { t } = useTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex-shrink-0 group">
          <motion.h1 
            whileHover={{ scale: 1.05 }}
            className="text-xl font-black text-green-700 dark:text-green-500 tracking-tighter sm:text-2xl"
          >
            SIMBA<span className="text-orange-500">SHOP</span>
          </motion.h1>
        </Link>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-grow max-w-xl relative group">
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-full px-5 py-2.5 pl-12 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-transparent focus:border-green-600/30 dark:focus:border-green-500/30 rounded-2xl focus:ring-0 outline-none transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-3 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-1 sm:gap-3">
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher currentLocale={locale} />
            <ThemeToggle />
          </div>
          
          <div className="md:hidden">
            <ThemeToggle />
          </div>

          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <Search size={22} />
          </button>
          
          <Link href={`/${locale}/cart`} className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors group">
            <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-950 shadow-lg shadow-orange-500/40"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
            <Menu size={24} />
          </button>
        </div>
      </div>
      
      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden mt-3 overflow-hidden"
          >
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder={t('common.search')}
                className="w-full px-5 py-3 pl-12 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-green-500/50 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-4 top-3.5 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 py-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('navbar.categories')}</span>
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
