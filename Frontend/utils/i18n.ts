export type Locale = 'en' | 'fr' | 'rw';

export const locales: Locale[] = ['en', 'fr', 'rw'];
export const defaultLocale: Locale = 'en';

const dictionaries = {
  en: () => import('@/messages/en.json').then((module) => module.default),
  fr: () => import('@/messages/fr.json').then((module) => module.default),
  rw: () => import('@/messages/rw.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  if (!locales.includes(locale)) {
    return dictionaries[defaultLocale]();
  }
  return dictionaries[locale]();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

export const createTranslator = (dictionary: Dictionary) => {
  return (path: string, variables?: Record<string, string>) => {
    const keys = path.split('.');
    let value: string | Record<string, unknown> | undefined = dictionary as unknown as Record<string, unknown>;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key] as string | Record<string, unknown>;
      } else {
        return path; 
      }
    }
    
    if (typeof value !== 'string') return path;
    
    if (variables) {
      Object.entries(variables).forEach(([key, val]) => {
        value = (value as string).replace(`{${key}}`, val);
      });
    }
    
    return value;
  };
};

export const translateCategory = (category: string, dictionary: Dictionary, productTranslations?: Record<string, string>): string => {
  if (productTranslations) {
    return productTranslations[category] || category;
  }
  const categories = dictionary?.products?.categories as Record<string, string> | undefined;
  if (categories && categories[category]) {
    return categories[category];
  }
  return category;
};
