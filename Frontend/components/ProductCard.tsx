'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/TranslationContext';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSearch } from '@/context/SearchContext';
import { translateCategory } from '@/utils/i18n';
import { useState } from 'react';
import QuickViewModal from '@/components/QuickViewModal';
import { useCurrency } from '@/context/CurrencyContext';
import { useCartPopup } from '@/context/CartPopupContext';

interface ProductCardProps {
  product: Product;
  locale?: string;
}

const ProductCard = ({ product, locale: propLocale }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { t, dictionary } = useTranslation();
  const { searchTerm } = useSearch();
  const params = useParams();
  const locale = propLocale || (params.locale as string);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const translatedCategory = translateCategory(product.category, dictionary);
  const { format } = useCurrency();
  const { openPopup } = useCartPopup();

  // Fallback image if product image is missing or invalid
  const imageUrl = product.image || 'https://via.placeholder.com/300x300?text=No+Image';

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-orange-200 dark:bg-orange-900/50 text-orange-900 dark:text-orange-100 rounded-sm px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // Logic for badges (simulated for UI)
  const isNew = product.id % 5 === 0;
  const isPopular = product.id % 7 === 0;
  const discountedPrice = product.discount ? Math.round(product.price * (1 - product.discount / 100)) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.discount && product.discount > 0 && (
          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-orange-500/20">
            -{product.discount}%
          </span>
        )}
        {isNew && (
          <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20">
            New
          </span>
        )}
        {isPopular && (
          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-orange-500/20">
            Popular
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        {/* Clicking the image goes to the product page */}
        <Link
          href={`/${locale}/product/${product.id}`}
          className="absolute inset-0"
          tabIndex={-1}
          aria-label={`View ${product.name}`}
        >
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-6 group-hover:scale-110 transition-transform duration-700 ease-in-out"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </Link>

        {/* Quick View button — shown on hover, sits above the link */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              setQuickViewOpen(true);
            }}
            aria-label={`Quick view ${product.name}`}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="pointer-events-auto bg-white dark:bg-gray-900 flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full shadow-xl text-simba-orange dark:text-simba-gold font-bold text-xs uppercase tracking-widest border border-white/80 dark:border-gray-700"
          >
            <Eye size={15} />
            Quick View
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[10px] font-bold text-simba-orange dark:text-simba-gold uppercase tracking-widest">
            {translatedCategory}
          </span>
        </div>

        <Link href={`/${locale}/product/${product.id}`} className="hover:text-simba-orange dark:hover:text-simba-gold transition-colors">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base leading-snug line-clamp-2 min-h-[2.5rem] mb-2 group-hover:text-simba-orange dark:group-hover:text-simba-gold transition-colors">
            {highlightText(product.name, searchTerm)}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className={i < 4 ? "fill-orange-400 text-orange-400" : "text-gray-300 dark:text-gray-700"} />
          ))}
          <span className="text-xs text-gray-400 ml-1">(12)</span>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              {discountedPrice ? (
                <>
                  <span className="text-xl font-black text-orange-500">
                    {format(discountedPrice)}
                  </span>
                  <span className="text-sm line-through text-gray-400">
                    {format(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-black text-gray-900 dark:text-white">
                  {format(product.price)}
                </span>
              )}
              {product.unit && (
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {t('common.per')} {product.unit}
                </span>
              )}
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-simba-orange hover:bg-orange-600 dark:bg-simba-gold dark:hover:bg-simba-gold/80 text-white p-3 rounded-xl transition-colors shadow-lg shadow-simba-orange/20 active:shadow-none" 
              title={t('common.addToCart')}
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
                openPopup(product);
              }}
            >
              <ShoppingCart size={20} />
            </motion.button>
          </div>

          <Link 
            href={`/${locale}/product/${product.id}`}
            className="block text-center py-2.5 text-sm font-bold text-simba-orange dark:text-simba-gold border-2 border-simba-orange/10 dark:border-simba-gold/10 rounded-xl hover:bg-orange-50 dark:hover:bg-simba-gold/10 transition-all duration-300"
          >
            {t('common.viewDetails')}
          </Link>
        </div>
      </div>

      {/* Quick View Modal — rendered inside the card so each card manages its own modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        locale={locale}
      />
    </motion.div>
  );
};

export default ProductCard;
