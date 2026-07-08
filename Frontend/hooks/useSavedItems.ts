'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CartItem, Product } from '@/types/product';
import API_URL from '@/utils/api';

/**
 * useSavedItems — manages "Save for Later" functionality.
 * - If authenticated: persists to DB via API
 * - If unauthenticated: keeps a local in-memory list (guest mode)
 */
export function useSavedItems() {
  const { isAuthenticated, token, isLoading: authLoading } = useAuth();
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from API when authenticated — wait for auth to finish loading first
  useEffect(() => {
    // Don't do anything while auth state is still being read from localStorage
    if (authLoading) return;

    if (!isAuthenticated || !token) {
      setLoading(false);
      setSavedItems([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`${API_URL}/saved-items`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((res) => {
        if (res.ok) return res.json();
        // Non-OK response — log and return empty list, don't throw
        console.warn(`Saved items fetch returned ${res.status}. Returning empty list.`);
        return [];
      })
      .then((data) => {
        setSavedItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        // Ignore abort errors — these happen on component unmount, not real failures
        if (err?.name === 'AbortError') return;
        console.warn('Could not load saved items:', err?.message ?? err);
        setSavedItems([]);
        setLoading(false);
      });

    // Cancel the request if the component unmounts or dependencies change
    return () => controller.abort();
  }, [isAuthenticated, token, authLoading]);

  /** Save a product for later */
  const saveForLater = useCallback(
    async (item: CartItem | Product) => {
      const cartItem: CartItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        quantity: 1,
      };

      // Optimistically add to local state
      setSavedItems((prev) => {
        if (prev.some((s) => s.id === cartItem.id)) return prev;
        return [cartItem, ...prev];
      });

      // If authenticated, persist to API
      if (isAuthenticated && token) {
        try {
          await fetch(`${API_URL}/saved-items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId: cartItem.id }),
          });
        } catch (err) {
          console.warn('Failed to save item to server:', err);
        }
      }
    },
    [isAuthenticated, token]
  );

  /** Remove a saved item */
  const removeFromSaved = useCallback(
    async (productId: number) => {
      // Optimistically remove
      setSavedItems((prev) => prev.filter((s) => s.id !== productId));

      // If authenticated, delete from API
      if (isAuthenticated && token) {
        try {
          await fetch(`${API_URL}/saved-items/${productId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          console.warn('Failed to remove saved item from server:', err);
        }
      }
    },
    [isAuthenticated, token]
  );

  /** Move a saved item to the cart (returns the item so caller can addToCart) */
  const moveToCart = useCallback(
    async (item: CartItem) => {
      await removeFromSaved(item.id);
      return item;
    },
    [removeFromSaved]
  );

  return {
    savedItems,
    loading,
    saveForLater,
    removeFromSaved,
    moveToCart,
  };
}
