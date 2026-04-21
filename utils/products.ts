import productsData from '@/data/products.json';
import { Product, ApiResponse } from '@/types/product';
import { Locale } from './i18n';

export const getProducts = (): Product[] => {
  return (productsData as ApiResponse).products;
};

export const getProductById = (id: number): Product | undefined => {
  return (productsData as ApiResponse).products.find((p: Product) => p.id === id);
};

export const getProductsByCategory = (): Record<string, Product[]> => {
  const products = getProducts();
  return products.reduce((acc, product: Product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
};

const translateField = (
  value: string | undefined,
  translations: Record<string, string> | undefined,
  locale: Locale,
  fallback: string
): string => {
  if (translations && translations[locale]) {
    return translations[locale];
  }
  return value || fallback;
};

export const getProductTranslation = (
  product: Product,
  field: 'name' | 'category' | 'description',
  locale: Locale
): string => {
  const translations = product.translations;
  switch (field) {
    case 'name':
      return translateField(product.name, translations?.name, locale, product.name);
    case 'category':
      return translateField(product.category, translations?.category, locale, product.category);
    case 'description':
      return translateField(product.description, translations?.description, locale, product.description || '');
    default:
      return product.name;
  }
};
