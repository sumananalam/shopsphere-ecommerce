import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export function Wishlist() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/wishlist?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setWishlistProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Heart className="w-16 h-16 text-purple-300 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Please Sign In to View Your Wishlist</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Saved Wishlist</h1>
        <p className="text-xs text-slate-500 mt-1">Products you have saved for later and quick move to cart</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl h-80 animate-pulse border border-purple-100" />
          ))}
        </div>
      ) : wishlistProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-purple-100 space-y-4">
          <Heart className="w-16 h-16 text-purple-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any product card while browsing to save items to your wishlist.
          </p>
          <Link to="/products" className="px-6 py-2.5 bg-purple-700 text-white rounded-xl text-xs font-bold inline-block">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
