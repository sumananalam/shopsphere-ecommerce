import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  const primaryImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addToCart(product.id, 1);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to manage your wishlist.');
      return;
    }
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId: product.id })
      });
      const data = await res.json();
      if (res.ok) {
        setIsWishlisted(data.action === 'added');
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-purple-100 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Discount Badge */}
      {product.discount_percentage && product.discount_percentage > 0 ? (
        <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
          {product.discount_percentage}% OFF
        </span>
      ) : null}

      {/* Wishlist Button */}
      <button
        onClick={toggleWishlist}
        aria-label="Add to wishlist"
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-colors ${
          isWishlisted 
            ? 'bg-purple-600 text-white shadow-md' 
            : 'bg-white/80 text-slate-600 hover:text-purple-600 hover:bg-white shadow'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image Container */}
      <Link to={`/product/${product.id}`} className="relative aspect-[4/3] bg-purple-50/50 overflow-hidden flex items-center justify-center p-4">
        <img
          src={primaryImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 rounded-2xl"
        />
        <div className="absolute inset-0 bg-purple-950/0 group-hover:bg-purple-950/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white text-purple-950 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider mb-1">
            {product.brand || product.category_name || 'ShopSphere Exclusive'}
          </div>
          <Link to={`/product/${product.id}`} className="text-sm font-bold text-slate-900 hover:text-purple-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </Link>
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2">
          <div className="flex items-center text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold text-slate-800 ml-1">{product.rating}</span>
          </div>
          <span className="text-xs text-slate-400">({product.review_count || 0})</span>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-purple-900">${product.price.toFixed(2)}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs text-slate-400 line-through">${product.original_price.toFixed(2)}</span>
              )}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold">
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-2xl transition-all duration-200 flex items-center justify-center ${
              addedAnim 
                ? 'bg-green-600 text-white scale-110 shadow-lg' 
                : product.stock > 0
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-purple-200' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
