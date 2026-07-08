import { getProductById, getProductTranslation, getRelatedProducts } from '@/utils/products';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Truck, RefreshCw, Star, Info } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductCard from '@/components/ProductCard';
import ShareButtons from '@/components/ShareButtons';
import ProductPrice from '@/components/ProductPrice';
import { createTranslator, getDictionary, Locale, translateCategory } from '@/utils/i18n';
import { TranslationProvider } from '@/context/TranslationContext';
import * as motion from "framer-motion/client"
import { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const product = await getProductById(parseInt(id));
  
  if (!product) return { title: 'Product Not Found' };

  const dictionary = await getDictionary(locale as Locale);
  const t = createTranslator(dictionary);
  const translatedName = getProductTranslation(product, 'name', locale as Locale);
  const translatedCategory = translateCategory(product.category, dictionary);
  const translatedDescription =
    getProductTranslation(product, 'description', locale as Locale) ||
    t('products.descriptionFallback', {
      name: translatedName,
      category: translatedCategory,
    });

  return {
    title: translatedName,
    description: translatedDescription,
    openGraph: {
      title: translatedName,
      description: translatedDescription,
      images: [{ url: product.image }],
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id, locale } = await params;
  const productId = parseInt(id);
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  const [dictionary, related] = await Promise.all([
    getDictionary(locale as Locale),
    getRelatedProducts(product, 5),
  ]);
  const imageUrl = product.image || 'https://via.placeholder.com/600x600?text=No+Image';
  const galleryImages = [imageUrl];
  const translatedName = getProductTranslation(product, 'name', locale as Locale);
  const translatedCategory = translateCategory(product.category, dictionary);
  const t = createTranslator(dictionary);
  const translatedDescription =
    getProductTranslation(product, 'description', locale as Locale) ||
    t('products.descriptionFallback', {
      name: translatedName,
      category: translatedCategory,
    });

  return (
    <TranslationProvider dictionary={dictionary}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="flex mb-10 text-sm font-medium text-gray-500 dark:text-gray-400">
          <Link href={`/${locale}`} className="hover:text-simba-orange dark:hover:text-simba-gold flex items-center gap-2 transition-colors">
            <ArrowLeft size={18} />
            {t('common.backToShop')}
          </Link>
          <span className="mx-3 text-gray-300 dark:text-gray-700">/</span>
          <span className="text-gray-400 dark:text-gray-600 truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Product Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <ProductImageGallery images={galleryImages} alt={translatedName} />
          </motion.div>

          {/* Product Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <span className="inline-block bg-orange-100 dark:bg-simba-gold/15 text-simba-orange dark:text-simba-gold text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
                {translatedCategory}
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
                {translatedName}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-orange-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill={i < 4 ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-400 border-l border-gray-200 dark:border-gray-800 pl-4 uppercase tracking-wider">
                  4.8 (124 reviews)
                </span>
              </div>
            </div>

            <div className="mb-10 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
              <ProductPrice price={product.price} unit={product.unit} per={t('common.per')} />
              <div className="flex items-center gap-2">
                {product.inStock ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-simba-gold/15 rounded-full">
                    <div className="w-2 h-2 bg-simba-orange dark:bg-simba-gold rounded-full animate-pulse" />
                    <span className="text-simba-orange dark:text-simba-gold text-xs font-bold uppercase tracking-wider">
                      {t('common.inStock')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                      {t('common.outOfStock')}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Info size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                    Free Shipping
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter flex items-center gap-2">
                {t('common.description')}
                <div className="h-0.5 flex-grow bg-gray-100 dark:bg-gray-800" />
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                {translatedDescription}
              </p>
            </div>

            <div className="mt-auto">
              <div className="hidden sm:block">
                <AddToCartButton product={product} />
              </div>
              
              {/* Sticky Mobile Button Placeholder (Logic for sticky would be in AddToCartButton or a wrapper) */}
              <div className="fixed bottom-0 left-0 right-0 p-4 pr-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 sm:hidden z-50">
                 <AddToCartButton product={product} />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-10 border-t border-gray-100 dark:border-gray-800 mt-10">
                <div className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-simba-gold/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="text-simba-orange dark:text-simba-gold" size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 mb-1">{t('common.quality')}</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-tight">{t('common.genuine')}</span>
                </div>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-simba-gold/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Truck className="text-simba-orange dark:text-simba-gold" size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 mb-1">{t('common.delivery')}</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-tight">{t('common.fastSecure')}</span>
                </div>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-simba-gold/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <RefreshCw className="text-simba-orange dark:text-simba-gold" size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 mb-1">{t('common.returns')}</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-tight">{t('common.easyReturns')}</span>
                </div>
              </div>

              {/* Social share buttons */}
              <ShareButtons productName={translatedName} price={product.price} />
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length >= 2 && (
          <section className="mt-20 pt-12 border-t border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-8">
              You may also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </div>
    </TranslationProvider>
  );
}
