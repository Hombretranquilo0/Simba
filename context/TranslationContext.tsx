'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { Dictionary, createTranslator } from '@/utils/i18n';

interface TranslationContextType {
  t: (path: string, variables?: Record<string, string>) => string;
  dictionary: Dictionary;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ 
  children, 
  dictionary 
}: { 
  children: ReactNode; 
  dictionary: Dictionary;
}) => {
  const t = createTranslator(dictionary);

  return (
    <TranslationContext.Provider value={{ t, dictionary }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
