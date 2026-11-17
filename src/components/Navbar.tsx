import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Heart, Search, User as UserIcon, Menu, X, MapPin, ShieldCheck, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Category } from '../types';

export function Navbar({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('New York 10001');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (user) {
      fetch(`/api/wishlist?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setWishlistCount(Array.isArray(data) ? data.length : 0))
        .catch(err => console.error(err));
    } else {
      setWishlistCount(0);
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    navigate(`/products?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white shadow-xl">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-xl font-black text-white tracking-wider">SS</span>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-lavender-300 bg-clip-text text-transparent">
              ShopSphere
            </span>
            <span className="block text-[10px] text-purple-300 tracking-wider font-medium">LUXURY E-COMMERCE</span>
          </div>
        </Link>

        {/* Delivery Location Selector */}
        <button 
          onClick={() => setIsLocationModalOpen(true)}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 text-xs text-purple-200 transition-colors shrink-0"
        >
          <MapPin className="w-4 h-4 text-purple-400" />
          <div className="text-left">
            <div className="text-[10px] text-purple-300">Deliver to</div>
            <div className="font-semibold text-white truncate max-w-[120px]">{deliveryLocation}</div>
          </div>
        </button>

        {/* Search Bar with Category Select */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex items-center bg-white rounded-xl shadow-md overflow-hidden p-1 border-2 border-purple-400/30 focus-within:border-purple-500 transition-colors">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Select product category"
            className="bg-purple-50 text-purple-950 text-xs font-semibold px-3 py-2 border-r border-purple-200 outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search millions of products, brands & more..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 text-sm text-slate-900 outline-none bg-transparent"
          />
          <button type="submit" aria-label="Search products" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium flex items-center justify-center">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Right Actions: Wishlist, Cart, Account */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-2 rounded-lg hover:bg-purple-800/50 transition-colors flex items-center gap-1.5">
            <Heart className="w-6 h-6 text-purple-300 hover:text-white transition-colors" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {wishlistCount}
              </span>
            )}
            <span className="hidden xl:inline text-xs font-medium">Wishlist</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-xl shadow-lg hover:from-purple-500 hover:to-indigo-500 transition-all font-medium">
            <ShoppingCart className="w-5 h-5 text-white" />
            <span className="hidden sm:inline text-xs">Cart</span>
            {cartCount > 0 && (
              <span className="bg-white text-purple-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-inner">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Account Dropdown */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 transition-colors border border-purple-700/50"
                >
                  <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white shadow">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-white truncate max-w-[100px]">{user.name}</div>
                    <div className="text-[10px] text-purple-300 capitalize">{user.role}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-purple-300" />
                </button>

                {isAccountOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-2xl shadow-2xl py-2 border border-slate-100 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      <Package className="w-4 h-4" /> My Orders & Tracking
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-purple-700 bg-purple-50/50 hover:bg-purple-100 transition-colors font-semibold"
                      >
                        <Settings className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setIsAccountOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold shadow transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 rounded-lg bg-purple-950 text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sub Navbar with Category Links */}
      <nav className="bg-purple-950/80 backdrop-blur-md border-t border-purple-800/40 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 overflow-x-auto py-2 text-xs font-medium text-purple-200 scrollbar-none">
          <Link to="/products" className="hover:text-white transition-colors whitespace-nowrap font-bold text-white flex items-center gap-1">
            <span>⚡ Today's Deals</span>
          </Link>
          <Link to="/products?bestSeller=true" className="hover:text-white transition-colors whitespace-nowrap">
            Best Sellers
          </Link>
          <Link to="/products?featured=true" className="hover:text-white transition-colors whitespace-nowrap">
            Featured
          </Link>
          <span className="text-purple-600">|</span>
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="hover:text-white transition-colors whitespace-nowrap py-1"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Search & Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-purple-950 px-4 py-4 border-t border-purple-800 space-y-4">
          <form onSubmit={handleSearch} className="flex items-center bg-white rounded-xl overflow-hidden">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 text-xs text-slate-900 outline-none"
            />
            <button type="submit" aria-label="Search products" className="bg-purple-600 text-white px-4 py-2">
              <Search className="w-4 h-4" />
            </button>
          </form>
          <div className="space-y-2 text-sm">
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-purple-200">All Products & Deals</Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-purple-300 text-xs"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2 text-purple-900">
                <MapPin className="w-5 h-5 text-purple-600" /> Choose Your Location
              </h3>
              <button onClick={() => setIsLocationModalOpen(false)} aria-label="Close location dialog" className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Delivery options and delivery speeds may vary for different locations.
            </p>
            <input
              type="text"
              placeholder="Enter ZIP code or city (e.g. 90210, Los Angeles)"
              value={tempLocation}
              onChange={(e) => setTempLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (tempLocation.trim()) setDeliveryLocation(tempLocation.trim());
                  setIsLocationModalOpen(false);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow"
              >
                Apply Location
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
