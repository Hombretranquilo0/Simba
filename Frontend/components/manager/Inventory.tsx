'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Edit2, Check, X, Loader2, Search, Package, Tag, Hash, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '@/utils/api';

export default function Inventory({ token, onUnauthorized }: { token: string; onUnauthorized?: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ price: 0, stockQuantity: 0, discount: 0 });
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all products (no search)
  const fetchAllProducts = () => {
    setLoading(true);
    fetch(`${API_URL}/manager/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text();
          if (res.status === 401 || res.status === 403) onUnauthorized?.();
          throw new Error(`${res.status}: ${body}`);
        }
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Inventory fetch error:', err);
        setProducts([]);
        setLoading(false);
      });
  };

  // Search products using AI
  const searchProducts = (query: string) => {
    setLoading(true);
    fetch(`${API_URL}/ai/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Search failed');
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('AI search error, falling back to full inventory:', err);
        // Fallback: fetch all products and filter locally by name/category
        setLoading(true);
        fetch(`${API_URL}/manager/inventory`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch inventory');
            return res.json();
          })
          .then((data) => {
            const allProducts = Array.isArray(data) ? data : [];
            const lowerQuery = query.toLowerCase();
            const filtered = allProducts.filter(
              (p: any) =>
                p.name.toLowerCase().includes(lowerQuery) ||
                (p.category && p.category.toLowerCase().includes(lowerQuery))
            );
            setProducts(filtered);
            setLoading(false);
          })
          .catch((fallbackErr) => {
            console.error('Fallback fetch also failed:', fallbackErr);
            setProducts([]);
            setLoading(false);
          });
      });
  };

  // Fetch all products on mount and when token changes
  useEffect(() => {
    fetchAllProducts();
  }, [token]);

  // When searchQuery changes, perform search or fetch all if empty
  useEffect(() => {
    if (searchQuery.trim() === '') {
      fetchAllProducts();
    } else {
      searchProducts(searchQuery);
    }
  }, [searchQuery]);

  const startEditing = (product: any) => {
    setEditingId(product.id);
    setEditForm({ price: product.price, stockQuantity: product.stockQuantity, discount: product.discount ?? 0 });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/manager/product/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          price: parseFloat(editForm.price.toString()),
          stockQuantity: parseInt(editForm.stockQuantity.toString()),
          inStock: parseInt(editForm.stockQuantity.toString()) > 0,
          discount: parseFloat(editForm.discount.toString()) || null,
        }),
      });

      if (response.ok) {
        setEditingId(null);
        // Refetch based on current search state
        if (searchQuery.trim() === '') {
          fetchAllProducts();
        } else {
          searchProducts(searchQuery);
        }
      }
    } catch (error) {
      console.error('Failed to update product', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-500 font-medium">Loading inventory from database...</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Product Inventory</h2>
          <div className="flex items-center gap-2 mt-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit">
            <Activity size={10} />
            <span>Synced with Database</span>
          </div>
        </div>

        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" size={18} />
          <input
            type="text"
            placeholder="Search products or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">
                  <div className="flex items-center gap-2"><Package size={14} /> Product</div>
                </th>
                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">
                  <div className="flex items-center gap-2"><Tag size={14} /> Category</div>
                </th>
                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">
                  <div className="flex items-center gap-2"><Hash size={14} /> Price</div>
                </th>
                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Stock</th>
                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Discount</th>
                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Status</th>
                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              <AnimatePresence mode="popLayout">
                {products.map((product) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={product.id}
                    className="group hover:bg-gray-50/50 dark:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-5 px-6 font-bold text-gray-900 dark:text-white">{product.name}</td>
                    <td className="py-5 px-6">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-500">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      {editingId === product.id ? (
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-blue-500 rounded-xl px-2 py-1">
                          <span className="text-xs font-bold text-blue-500">RWF</span>
                          <input
                            type="number"
                            className="w-24 bg-transparent outline-none font-bold text-sm"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="font-black text-gray-900 dark:text-white">
                          {product.price.toLocaleString()} <span className="text-[10px] text-gray-400">RWF</span>
                        </span>
                      )}
                    </td>
                    <td className="py-5 px-6">
                      {editingId === product.id ? (
                        <input
                          type="number"
                          className="w-20 px-3 py-2 bg-white dark:bg-gray-800 border border-blue-500 rounded-xl outline-none font-bold text-sm"
                          value={editForm.stockQuantity}
                          onChange={(e) => setEditForm({ ...editForm, stockQuantity: parseInt(e.target.value) })}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`font-black ${product.stockQuantity < 10 ? 'text-orange-500' : 'text-gray-900 dark:text-gray-100'}`}>
                            {product.stockQuantity}
                          </span>
                          {product.stockQuantity < 10 && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-5 px-6">
                      {editingId === product.id ? (
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-blue-500 rounded-xl px-2 py-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-16 bg-transparent outline-none font-bold text-sm"
                            value={editForm.discount}
                            onChange={(e) => setEditForm({ ...editForm, discount: parseFloat(e.target.value) })}
                          />
                          <span className="text-xs font-bold text-blue-500">%</span>
                        </div>
                      ) : (
                        product.discount ? (
                          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-black">
                            -{product.discount}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )
                      )}
                    </td>
                    <td className="py-5 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        product.inStock
                          ? 'bg-orange-100 dark:bg-simba-gold/15 text-simba-orange dark:text-simba-gold'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {product.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex justify-center gap-2">
                        {editingId === product.id ? (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => saveEdit(product.id)}
                              disabled={updating}
                              className="p-2 bg-simba-orange text-white rounded-xl shadow-lg shadow-orange-200 dark:shadow-none disabled:opacity-50"
                            >
                              {updating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={cancelEditing}
                              className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl"
                            >
                              <X size={18} />
                            </motion.button>
                          </>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => startEditing(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                          >
                            <Edit2 size={18} />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="py-20 text-center">
              <div className="inline-flex p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full text-gray-400 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No products found</h3>
              <p className="text-gray-500">Try adjusting your search query</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
