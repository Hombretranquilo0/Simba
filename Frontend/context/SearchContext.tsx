'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface SearchContextType {
  searchTerm: string;
  debouncedSearchTerm: string;
  setSearchTerm: (term: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minPriceLimit: number;
  maxPriceLimit: number;
  setMinPriceLimit: (price: number) => void;
  setMaxPriceLimit: (price: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [minPriceLimit, setMinPriceLimit] = useState(0);
  const [maxPriceLimit, setMaxPriceLimit] = useState(1000000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const pathname = usePathname();

  // Clear search term whenever the user navigates to a different page
  useEffect(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, [pathname]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  return (
    <SearchContext.Provider 
      value={{ 
        searchTerm, 
        debouncedSearchTerm, 
        setSearchTerm,
        priceRange,
        setPriceRange,
        minPriceLimit,
        maxPriceLimit,
        setMinPriceLimit,
        setMaxPriceLimit,
        inStockOnly,
        setInStockOnly
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
