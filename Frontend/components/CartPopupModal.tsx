'use client';

import { useCartPopup } from '@/context/CartPopupContext';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Check, Trash2 } from 'lucide-react';
import { useParams, usePathname } from 'next/navigation';

export default function CartPopupModal() {
  const { isOpen, product: lastAdded, closePopup } = useCartPopup();
  const { items, totalPrice, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const { format } = useCurrency();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const pathname = usePathname();

  // Only show on home page and category pages
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const isCategory = pathname.includes(`/${locale}/category/`);
  if (!isHome && !isCategory) return null;

  return (
    <AnimatePresence>
      {isOpen && lastAdded && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
            onClick={closePopup}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col max-h-[85vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header — names the product just added */}
              <div className="flex items-center gap-2.5 px-5 py-4 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-900/30 flex-shrink-0 rounded-t-3xl">
                <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-white" strokeWidth={3} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest leading-none">
                    Added to cart
                  </p>
                  <p className="text-xs text-orange-500/80 dark:text-orange-400/60 font-medium truncate mt-0.5">
                    {lastAdded.name}
                  </p>
                </div>
                <span className="ml-auto text-[10px] font-black text-orange-400 uppercase tracking-widest flex-shrink-0">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Scrollable cart items list */}
              <div className="overflow-y-auto flex-grow divide-y divide-gray-50 dark:divide-gray-800">
                {items.map(item => (
                  <div key={item.id} className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${item.id === lastAdded.id ? 'bg-orange-50/60 dark:bg-orange-900/10' : ''}`}>
                    {/* Image */}
                    <div className="relative w-14 h-14 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden">
                      <Image
                        src={item.image || 'https://via.placeholder.com/56x56?text=?'}
                        alt={item.name}
                        fill
                        className="object-contain p-1.5"
                        sizes="56px"
                      />
                    </div>

                    {/* Name + price */}
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-black text-gray-900 dark:text-white line-clamp-1 leading-snug">
                        {item.name}
                      </p>
                      <p className="text-xs font-bold text-orange-500 mt-0.5">
                        {format(item.price)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-100 hover:text-orange-600 transition-all disabled:opacity-30"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center font-black text-gray-900 dark:text-white text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        aria-label="Increase quantity"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-100 hover:text-orange-600 transition-all"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Line total + remove */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-1">
                      <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                        {format(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total + actions — pinned to bottom */}
              <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 px-5 pt-4 pb-5 space-y-3 rounded-b-3xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Total</span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">
                    {format(totalPrice)}
                  </span>
                </div>

                <Link
                  href={`/${locale}/cart`}
                  onClick={closePopup}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black py-3.5 rounded-2xl shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all text-sm"
                >
                  <ShoppingCart size={16} />
                  Done shopping? Go to Cart
                </Link>
                <button
                  onClick={closePopup}
                  className="w-full py-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-black text-xs uppercase tracking-widest transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
