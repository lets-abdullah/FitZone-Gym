import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import productsData from '../../data/products.json';
import { Product } from '../types';

const initialProducts = productsData as Product[];

export default function AdminApp() {
  // Synchronized state with the exact same localStorage database key
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData && prodData.length > 0) {
            setProducts(prodData);
          }
        }
      } catch (e) {
        console.warn("Error fetching products from MongoDB database, using fallback", e);
      }

      try {
        const ordRes = await fetch('/api/orders');
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          setOrders(ordData);
        }
      } catch (e) {
        console.warn("Error fetching orders from MongoDB database, using fallback", e);
      }
    };

    fetchAdminData();
  }, []);

  const [activePlanName] = useState<string | null>(() => {
    return localStorage.getItem('fitzone_active_plan_name');
  });

  const [activePlanExpiry] = useState<string | null>(() => {
    return localStorage.getItem('fitzone_active_plan_expiry');
  });

  const handleProductsChange = async (newProducts: Product[]) => {
    // Find the edited / newly added product
    setProducts(newProducts);
    
    // Attempt backend database synchronization for each modified product item
    for (const p of newProducts) {
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        });
      } catch (e) {
        console.warn("Failed syncing individual product modifications to MongoDB collection", e);
      }
    }
  };

  const handleAddOrder = async (newOrder: any) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed pushing order to MongoDB backend database", e);
    }
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleNavigateHome = () => {
    // Redirects browser completely to the separate main user website
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <AdminDashboard
        products={products}
        onProductsChange={handleProductsChange}
        orders={orders}
        onAddOrder={handleAddOrder}
        activePlanName={activePlanName}
        activePlanExpiry={activePlanExpiry}
        onNavigateHome={handleNavigateHome}
      />
    </div>
  );
}
