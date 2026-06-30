'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { X, Star, ShieldCheck, Truck, RefreshCw, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types/product';
import AddToCartButton from '@/components/AddToCartButton';
import { useTranslation } from '@/context/TranslationContext';
import { translateCategory } from '@/utils/i18n';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  locale,
}: QuickViewModalProps) {
  const { t, dictionary } = useTranslation();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  // Track whether we're mounted on the client (needed for createPortal)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!product || !mounted) return null;

  const imageUrl = product.image || 'https://via.placeholder.com/600x600?text=No+Image';
  const translatedCategory = translateCategory(product.category, dictionary);
  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — portalled to body, always covers full viewport */}
          <motion.div
            key="qv-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            className="bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            key="qv-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view: ${product.name}`}
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', pointerEvents: 'none' }}
          >
            <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">

              {/* Close button */}
              <button
                ref={closeBtnRef}
                onClick={onClose}
                aria-label="Close quick view"
                className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="overflow-y-auto flex-grow">
                <div className="grid sm:grid-cols-2 gap-0">

                  {/* ── Left: Image ─────────────────────────────── */}
                  <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain p-8"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      priority
                    />
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                      {product.discount && product.discount > 0 && (
                        <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-orange-500/30">
                          -{product.discount}%
                        </span>
                      )}
                      {!product.inStock && (
                        <span className="bg-gray-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                          Out of stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Right: Details ──────────────────────────── */}
                  <div className="p-6 sm:p-8 flex flex-col overflow-y-auto">

                    {/* Category + name */}
                    <div className="mb-5">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-simba-orange dark:text-simba-gold mb-3">
                        <Tag size={12} />
                        {translatedCategory}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-3">
                        {product.name}
                      </h2>
                      <div className="flex items-center gap-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < 4 ? 'fill-orange-400 text-orange-400' : 'text-gray-200 dark:text-gray-700'}
                          />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">(12 reviews)</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl">
                      {discountedPrice ? (
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span className="text-3xl font-black text-orange-500 tracking-tighter">
                            {discountedPrice.toLocaleString()}
                          </span>
                          <span className="text-base font-bold text-orange-400 uppercase">RWF</span>
                          <span className="text-base line-through text-gray-400">
                            {product.price.toLocaleString()} RWF
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            {product.price.toLocaleString()}
                          </span>
                          <span className="text-base font-bold text-gray-400 uppercase">RWF</span>
                        </div>
                      )}
                      {product.unit && (
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                          {t('common.per')} {product.unit}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-simba-orange animate-pulse' : 'bg-gray-400'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${product.inStock ? 'text-simba-orange dark:text-simba-gold' : 'text-gray-400'}`}>
                          {product.inStock ? t('common.inStock') : t('common.outOfStock')}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {product.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5 line-clamp-3">
                        {product.description}
                      </p>
                    )}

                    {/* Add to cart */}
                    <div className="mb-4">
                      <AddToCartButton product={product} />
                    </div>

                    {/* View full details link */}
                    <Link
                      href={`/${locale}/product/${product.id}`}
                      onClick={onClose}
                      className="block text-center py-2.5 text-sm font-bold text-simba-orange dark:text-simba-gold border-2 border-simba-orange/20 dark:border-simba-gold/20 rounded-xl hover:bg-orange-50 dark:hover:bg-simba-gold/10 transition-all"
                    >
                      {t('common.viewDetails')} →
                    </Link>

                    {/* Trust badges */}
                    <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                      {[
                        { icon: <ShieldCheck size={16} />, label: t('common.quality'), sub: t('common.genuine') },
                        { icon: <Truck size={16} />, label: t('common.delivery'), sub: t('common.fastSecure') },
                        { icon: <RefreshCw size={16} />, label: t('common.returns'), sub: t('common.easyReturns') },
                      ].map(({ icon, label, sub }) => (
                        <div key={label} className="flex flex-col items-center text-center">
                          <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-simba-gold/10 flex items-center justify-center text-simba-orange dark:text-simba-gold mb-1.5">
                            {icon}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</span>
                          <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 leading-tight">{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Portal renders directly onto document.body — escapes ALL parent stacking contexts
  return createPortal(modalContent, document.body);
}
