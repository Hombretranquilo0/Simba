'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product } from '@/types/product';

interface CartPopupContextType {
  isOpen: boolean;
  product: Product | null;
  openPopup: (product: Product) => void;
  closePopup: () => void;
}

const CartPopupContext = createContext<CartPopupContextType | undefined>(undefined);

export function CartPopupProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const openPopup = useCallback((p: Product) => {
    setProduct(p);
    setIsOpen(true);
  }, []);

  const closePopup = useCallback(() => {
    setIsOpen(false);
    // Keep product in state until animation finishes
    setTimeout(() => setProduct(null), 300);
  }, []);

  return (
    <CartPopupContext.Provider value={{ isOpen, product, openPopup, closePopup }}>
      {children}
    </CartPopupContext.Provider>
  );
}

export function useCartPopup() {
  const ctx = useContext(CartPopupContext);
  if (!ctx) throw new Error('useCartPopup must be used within CartPopupProvider');
  return ctx;
}
