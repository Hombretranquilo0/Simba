import { Product } from '@/types/product';
import { Locale } from './i18n';
import API_URL from './api';

export const getProducts = async (filters?: {
  minPrice?: number;
  maxPrice?: number;
  branchId?: string;
}): Promise<Product[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.branchId) params.append('branchId', filters.branchId);

    const url = `${API_URL}/products${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const getProductById = async (id: number, branchId?: string): Promise<Product | undefined> => {
  try {
    const params = branchId ? `?branchId=${encodeURIComponent(branchId)}` : '';
    const response = await fetch(`${API_URL}/products/${id}${params}`);
    if (!response.ok) return undefined;
    return await response.json();
  } catch {
    return undefined;
  }
};

export const getProductsByCategory = async (branchId?: string): Promise<Record<string, Product[]>> => {
  const products = await getProducts({ branchId });
  return products.reduce((acc, product: Product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
};

const translateField = (
  value: string | undefined,
  translations: any | undefined,
  locale: Locale,
  fallback: string,
): string => {
  if (translations && translations[locale]) return translations[locale];
  return value || fallback;
};

export const getRelatedProducts = async (product: Product, limit = 5, branchId?: string): Promise<Product[]> => {
  const all = await getProducts({ branchId });
  const others = all.filter((p) => p.id !== product.id);

  const maxPrice = Math.max(...others.map((p) => p.price), 1);
  const scored = others.map((p) => {
    const categoryScore = p.category === product.category ? 100 : 0;
    const priceScore = 50 * (1 - Math.abs(p.price - product.price) / maxPrice);
    return { product: p, score: categoryScore + priceScore };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit).map((s) => s.product);
  return top.length >= 2 ? top : top;
};

export const getProductTranslation = (
  product: Product,
  field: 'name' | 'category' | 'description',
  locale: Locale,
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
