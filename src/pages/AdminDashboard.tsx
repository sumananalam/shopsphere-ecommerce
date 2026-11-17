import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, ShoppingCart, DollarSign, Plus, Trash2, Edit, ShieldCheck, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Product, Category, Order } from '../types';

export function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<{ totalUsers: number; totalProducts: number; totalOrders: number; totalRevenue: number; recentOrders: any[] } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users'>('overview');

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCatId, setProdCatId] = useState(1);
  const [prodPrice, setProdPrice] = useState('');
  const [prodOrigPrice, setProdOrigPrice] = useState('');
  const [prodStock, setProdStock] = useState('100');
  const [prodBrand, setProdBrand] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');

  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));

    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setProdCatId(data[0].id);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!user || !isAdmin) {
      return;
    }
    fetchData();
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-purple-300 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Admin Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You must be logged in as an administrator (e.g. admin@purplecart.com / admin123) to access the admin dashboard.
        </p>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-purple-700 text-white rounded-xl text-xs font-bold">
          Return to Home
        </button>
      </div>
    );
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      category_id: Number(prodCatId),
      name: prodName,
      description: prodDesc,
      price: Number(prodPrice),
      original_price: prodOrigPrice ? Number(prodOrigPrice) : Number(prodPrice) * 1.2,
      discount_percentage: prodOrigPrice ? Math.round(((Number(prodOrigPrice) - Number(prodPrice)) / Number(prodOrigPrice)) * 100) : 15,
      stock: Number(prodStock),
      brand: prodBrand,
      is_featured: 1,
      is_best_seller: 1,
      is_deal: 1,
      images: prodImage ? [prodImage] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800']
    };

    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-purple-700" /> Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage products, inventory, customers, and store operations</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-purple-50 p-1.5 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-purple-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products' ? 'bg-purple-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders' ? 'bg-purple-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Orders & Status
          </button>
        </div>
      </div>

      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                <Users className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stats.totalUsers}</div>
              <p className="text-[11px] text-emerald-600 font-medium">Registered customers</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Products</span>
                <Package className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stats.totalProducts}</div>
              <p className="text-[11px] text-purple-600 font-medium">In active inventory</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stats.totalOrders}</div>
              <p className="text-[11px] text-emerald-600 font-medium">Successfully processed</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-[11px] text-emerald-600 font-medium">Paid orders total</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900">Recent Customer Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="py-3 font-bold text-purple-900">#PC-{ord.id}</td>
                      <td className="py-3 font-medium text-slate-800">{ord.user_name || 'Customer'}</td>
                      <td className="py-3 font-black text-slate-900">${ord.final_amount.toFixed(2)}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full font-bold text-[10px]">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">{new Date(ord.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900">Product Management</h3>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProdName('');
                setProdPrice('');
                setProdOrigPrice('');
                setProdStock('100');
                setProdBrand('');
                setProdDesc('');
                setProdImage('');
                setIsProductModalOpen(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50/70 border-b border-purple-100 text-slate-600 font-bold">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 overflow-hidden shrink-0 border p-1">
                        <img src={prod.images?.[0]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-lg" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <div className="text-[10px] text-purple-600">{prod.brand}</div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{prod.category_name || 'General'}</td>
                    <td className="p-4 font-black text-purple-900">${prod.price.toFixed(2)}</td>
                    <td className="p-4 font-semibold text-emerald-600">{prod.stock} units</td>
                    <td className="p-4 font-bold text-slate-800">{prod.rating} ★</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setProdName(prod.name);
                          setProdCatId(prod.category_id);
                          setProdPrice(String(prod.price));
                          setProdOrigPrice(String(prod.original_price || ''));
                          setProdStock(String(prod.stock));
                          setProdBrand(prod.brand);
                          setProdDesc(prod.description);
                          setProdImage(prod.images?.[0] || '');
                          setIsProductModalOpen(true);
                        }}
                        className="p-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && stats && (
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900">Manage Orders & Status</h3>
          <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden p-6 space-y-4">
            {stats.recentOrders.map((ord: any) => (
              <div key={ord.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-purple-900">Order #PC-{ord.id}</span>
                    <span className="text-xs text-slate-500">by {ord.user_name}</span>
                  </div>
                  <div className="text-xs font-black text-slate-900">Total: ${ord.final_amount.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={ord.status}
                    onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                    className="px-3 py-2 rounded-xl border border-purple-200 text-xs font-bold bg-white text-purple-950 outline-none cursor-pointer"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsProductModalOpen(false)} aria-label="Close product modal" className="absolute top-6 right-6 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={prodCatId}
                    onChange={(e) => setProdCatId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodOrigPrice}
                    onChange={(e) => setProdOrigPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
