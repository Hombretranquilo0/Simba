'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, totalPrice, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  const { t } = useTranslation();
  const params = useParams();
  const locale = params.locale as string;

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login?redirect=cart`);
      return;
    }
    setShowPaymentModal(true);
  };

  const simulatePayment = async () => {
    setIsProcessing(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const response = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total: 500 // User requested exactly 500 RWF for simulation
        })
      });

      if (response.ok) {
        setOrderComplete(true);
        clearCart();
        setTimeout(() => {
          setShowPaymentModal(false);
          router.push(`/${locale}/orders`);
        }, 3000);
      }
    } catch (error) {
      console.error('Payment failed', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isMounted) return null;

  if (items.length === 0 && !orderComplete) {
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
          className="inline-flex items-center gap-3 bg-simba-orange hover:bg-simba-orange text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-simba-orange/20 hover:shadow-simba-orange/40 hover:-translate-y-1 active:translate-y-0"
        >
          <ArrowLeft size={20} />
          {t('common.startShopping')}
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
            >
              {!orderComplete ? (
                <>
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-orange-600">
                      <CreditCard size={40} />
                    </div>
                    <h3 className="text-3xl font-black mb-2">Secure Checkout</h3>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Payment Simulation</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm font-bold text-gray-400">Fixed Promo Rate</span>
                      <span className="text-xl font-black text-simba-orange">500 RWF</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        This is a simulated payment flow. Clicking pay will create your order with status <span className="text-orange-600 font-black">PENDING</span>.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={simulatePayment}
                      disabled={isProcessing}
                      className="w-full bg-black dark:bg-white dark:text-black text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Pay 500 RWF</>
                      )}
                    </motion.button>
                    <button 
                      onClick={() => setShowPaymentModal(false)}
                      className="w-full py-3 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-600 transition-colors"
                    >
                      Cancel Transaction
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-simba-orange rounded-full flex items-center justify-center mx-auto mb-8 text-white shadow-xl shadow-simba-orange/40"
                  >
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                  </motion.div>
                  <h3 className="text-4xl font-black mb-4 tracking-tighter text-gray-900 dark:text-white">Payment Success!</h3>
                  <p className="text-gray-500 font-medium text-lg mb-2">Order #{(Math.random() * 10000).toFixed(0)} Created</p>
                  <p className="text-orange-500 font-black uppercase tracking-widest text-xs animate-pulse">Waiting for manager approval...</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    <Link href={`/${locale}/product/${item.id}`} className="hover:text-simba-orange dark:hover:text-green-500 transition-colors">
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
                      <p className="text-2xl font-black text-simba-orange dark:text-green-500 tracking-tighter">
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
            className="inline-flex items-center gap-3 text-simba-orange dark:text-green-500 font-black hover:gap-5 transition-all mt-6 uppercase tracking-widest text-xs"
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
                <span className="text-simba-orange dark:text-green-500 font-black text-sm">{t('common.free')}</span>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
              <div className="flex justify-between items-end">
                <span className="text-gray-900 dark:text-white font-black uppercase tracking-tighter text-lg">{t('common.total')}</span>
                <div className="text-right">
                  <p className="text-3xl font-black text-simba-orange dark:text-green-500 tracking-tighter">
                    {totalPrice.toLocaleString()} <span className="text-sm">RWF</span>
                  </p>
                </div>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3 text-lg"
            >
              <CreditCard size={22} />
              {t('common.checkout')}
            </motion.button>
            
            <div className="mt-8 flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <div className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                <svg className="w-5 h-5 text-simba-orange" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
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
