'use client';

import Link from 'next/link';
import { ShoppingCart, Search, Menu, X, User as UserIcon, LogOut, LayoutDashboard, ShoppingBag as OrdersIcon, ChevronDown } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import API_URL from '@/utils/api';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/TranslationContext';
import { useAuth } from '@/context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { Locale } from '@/utils/i18n';
import { translateCategory } from '@/utils/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const Navbar = ({ locale }: { locale: Locale }) => {
  const { searchTerm, setSearchTerm } = useSearch();
  const { totalItems } = useCart();
  const { t, dictionary } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(r => r.ok ? r.json() : [])
      .then((products: any[]) => {
        const cats = [...new Set(products.map((p: any) => p.category as string))].sort();
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setIsCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Open categories when Shop Now is clicked
  useEffect(() => {
    const handler = () => setIsCatOpen(true);
    window.addEventListener('open-categories', handler);
    return () => window.removeEventListener('open-categories', handler);
  }, []);

  return (
    <nav className="sticky top-0 z-50 glass dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex-shrink-0 group">
          <motion.h1 
            whileHover={{ scale: 1.05 }}
            className="text-xl font-black text-simba-orange dark:text-simba-gold tracking-tighter sm:text-2xl"
          >
            SIMBA<span className="text-orange-500">SHOP</span>
          </motion.h1>
        </Link>

        {/* Categories Dropdown */}
        <div ref={catRef} className="hidden md:block relative flex-shrink-0">
          <button
            onClick={() => setIsCatOpen(v => !v)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all"
          >
            {t('navbar.categories')}
            <ChevronDown size={16} className={`transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isCatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 max-h-[70vh] overflow-y-auto"
              >
                {categories.map(cat => (
                  <Link
                    key={cat}
                    href={`/${locale}/category/${encodeURIComponent(cat)}`}
                    onClick={() => setIsCatOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-simba-orange dark:hover:text-simba-gold hover:bg-orange-50 dark:hover:bg-simba-gold/10 transition-colors"
                  >
                    {translateCategory(cat, dictionary)}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-grow max-w-xl relative group">
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-full px-5 py-2.5 pl-12 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-transparent focus:border-simba-orange/30 dark:focus:border-simba-gold/30 rounded-2xl focus:ring-0 outline-none transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-3 text-gray-400 group-focus-within:text-simba-orange transition-colors" size={20} />
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
            <Link href={`/${locale}/about`} className="px-3 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-simba-orange dark:hover:text-simba-gold transition-colors">
              About
            </Link>
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

          {/* User Auth Section */}
          <div className="relative">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-simba-gold/10 flex items-center justify-center text-simba-orange dark:text-simba-gold font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden lg:block text-sm font-medium">{user?.name}</span>
                </button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                        <p className="text-sm font-bold truncate">{user?.email}</p>
                      </div>

                      <Link 
                        href={`/${locale}/orders`}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors border-b border-gray-50 dark:border-gray-800"
                      >
                        <OrdersIcon size={16} />
                        My Orders
                      </Link>
                      
                      {user?.role === 'manager' && (
                        <Link 
                          href={`/${locale}/manager`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-4 py-2 text-sm text-simba-orange hover:bg-orange-50 dark:hover:bg-simba-gold/10 flex items-center gap-2 transition-colors border-b border-gray-50 dark:border-gray-800"
                        >
                          <LayoutDashboard size={16} />
                          Manager Dashboard
                        </Link>
                      )}

                      <button 
                        onClick={() => { logout(); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link 
                  href={`/${locale}/login`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-simba-orange transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href={`/${locale}/signup`}
                  className="px-4 py-2 text-sm font-medium text-white bg-simba-orange hover:bg-orange-600 rounded-xl transition-all shadow-md shadow-simba-orange/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

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
                className="w-full px-5 py-3 pl-12 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-simba-orange/50 outline-none"
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
