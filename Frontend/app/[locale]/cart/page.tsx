'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { items, totalPrice, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useTranslation();
  const params = useParams();
  const locale = params.locale as string;

  // Handle hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 py-32 text-center"
      >
        <div className="bg-gray-50 dark:bg-gray-900 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <ShoppingBag className="text-gray-300 dark:text-gray-700" size={64} />
        </div>
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{t('common.emptyCart')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto text-lg font-medium">
          {t('common.emptyCartDesc')}
        </p>
        <Link 
          href={`/${locale}`} 
          className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-green-600/20 hover:shadow-green-600/40 hover:-translate-y-1 active:translate-y-0"
        >
          <ArrowLeft size={20} />
          {t('common.startShopping')}
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">{t('common.cart')}</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            {items.length} {t('common.items')} in your bag
          </p>
        </div>
        <button 
          onClick={clearCart}
          className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm font-black transition-colors flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl w-fit"
        >
          <Trash2 size={18} />
          {t('common.clearCart')}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {items.map((item: import('@/types/product').CartItem) => (
              <motion.div 
                key={item.id} 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="group bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-6 items-center transition-all duration-300"
              >
                <div className="relative w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-2xl flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src={item.image || 'https://via.placeholder.com/150x150?text=No+Image'}
                    alt={item.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                
                <div className="flex-grow min-w-0 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/${locale}/product/${item.id}`} className="hover:text-green-700 dark:hover:text-green-500 transition-colors">
                      <h3 className="font-black text-gray-900 dark:text-gray-100 text-xl truncate pr-6 tracking-tight">{item.name}</h3>
                    </Link>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 transition-colors flex-shrink-0 p-1"
                      aria-label={t('common.remove')}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50 dark:border-gray-800/50">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-1 border border-gray-100 dark:border-gray-700">
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => decreaseQuantity(item.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-xl transition-all disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={18} />
                      </motion.button>
                      <span className="w-12 text-center font-black text-gray-900 dark:text-gray-200 text-lg">{item.quantity}</span>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => increaseQuantity(item.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-xl transition-all"
                      >
                        <Plus size={18} />
                      </motion.button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 line-through mb-1">
                        {item.price.toLocaleString()} RWF
                      </p>
                      <p className="text-2xl font-black text-green-700 dark:text-green-500 tracking-tighter">
                        {(item.price * item.quantity).toLocaleString()} <span className="text-sm">RWF</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <Link 
            href={`/${locale}`} 
            className="inline-flex items-center gap-3 text-green-700 dark:text-green-500 font-black hover:gap-5 transition-all mt-6 uppercase tracking-widest text-xs"
          >
            <ArrowLeft size={16} />
            {t('common.continueShopping')}
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 sticky top-28 transition-all"
          >
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">{t('common.orderSummary')}</h2>
            
            <div className="space-y-5 mb-10">
              <div className="flex justify-between text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">
                <span>{t('common.subtotal')}</span>
                <span className="text-gray-900 dark:text-gray-100 text-sm font-black">{totalPrice.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">
                <span>{t('common.deliveryFee')}</span>
                <span className="text-green-600 dark:text-green-500 font-black text-sm">{t('common.free')}</span>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
              <div className="flex justify-between items-end">
                <span className="text-gray-900 dark:text-white font-black uppercase tracking-tighter text-lg">{t('common.total')}</span>
                <div className="text-right">
                  <p className="text-3xl font-black text-green-700 dark:text-green-500 tracking-tighter">
                    {totalPrice.toLocaleString()} <span className="text-sm">RWF</span>
                  </p>
                </div>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3 text-lg"
            >
              <CreditCard size={22} />
              {t('common.checkout')}
            </motion.button>
            
            <div className="mt-8 flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <div className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              </div>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed tracking-wider">
                {t('common.taxesNotice')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
