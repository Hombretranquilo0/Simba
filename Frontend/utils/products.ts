import { Product } from '@/types/product';
import { Locale } from './i18n';

const API_URL = 'http://localhost:3001';

export const getProducts = async (filters?: { minPrice?: number; maxPrice?: number }): Promise<Product[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    
    const url = `${API_URL}/products${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductById = async (id: number): Promise<Product | undefined> => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) return undefined;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return undefined;
  }
};

export const getProductsByCategory = async (): Promise<Record<string, Product[]>> => {
  const products = await getProducts();
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
  translations: any | undefined,
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
  const translations = product.translations as any;
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
