'use client';

import React, { useState, useEffect } from 'react';
import { Edit2, Check, X, Loader2 } from 'lucide-react';

export default function Inventory({ token }: { token: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ price: 0, stockQuantity: 0 });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const fetchInventory = () => {
    setLoading(true);
    fetch('http://localhost:3001/manager/inventory', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const startEditing = (product: any) => {
    setEditingId(product.id);
    setEditForm({ price: product.price, stockQuantity: product.stockQuantity });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:3001/manager/product/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          price: parseFloat(editForm.price.toString()),
          stockQuantity: parseInt(editForm.stockQuantity.toString()),
          inStock: parseInt(editForm.stockQuantity.toString()) > 0,
        }),
      });

      if (response.ok) {
        setEditingId(null);
        fetchInventory();
      }
    } catch (error) {
      console.error('Failed to update product', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>Loading inventory...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Current Inventory</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="py-3 px-4 font-semibold">Product Name</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th className="py-3 px-4 font-semibold">Price (RWF)</th>
              <th className="py-3 px-4 font-semibold">Stock</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="py-4 px-4">{product.name}</td>
                <td className="py-4 px-4 text-gray-500">{product.category}</td>
                <td className="py-4 px-4 font-medium">
                  {editingId === product.id ? (
                    <input
                      type="number"
                      className="w-24 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                    />
                  ) : (
                    <span>{product.price.toLocaleString()} RWF</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  {editingId === product.id ? (
                    <input
                      type="number"
                      className="w-20 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700"
                      value={editForm.stockQuantity}
                      onChange={(e) => setEditForm({ ...editForm, stockQuantity: parseInt(e.target.value) })}
                    />
                  ) : (
                    <span className={`font-bold ${product.stockQuantity < 10 ? 'text-orange-500' : 'text-gray-900 dark:text-gray-100'}`}>
                      {product.stockQuantity}
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  {editingId === product.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(product.id)}
                        disabled={updating}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        {updating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing(product)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
