'use client';

import React, { useState, useEffect } from 'react';

export default function Orders({ token }: { token: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/manager/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Orders Placed</h2>
      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID: #{order.id}</p>
                  <p className="font-bold">{order.user.name}</p>
                  <p className="text-xs text-gray-400">{order.user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-green-600">{order.total.toLocaleString()} RWF</p>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Items</p>
                <ul className="text-sm space-y-1">
                  {order.items.map((item: any) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span className="text-gray-500">{(item.price * item.quantity).toLocaleString()} RWF</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 text-[10px] text-gray-400">
                {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
