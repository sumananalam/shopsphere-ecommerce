import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, Check, Plus, Minus, Send } from 'lucide-react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // New review form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setReviews(data.reviews || []);
        setLoading(false);
        // Fetch similar products in same category
        if (data.category_slug) {
          fetch(`/api/products?category=${data.category_slug}&limit=4`)
            .then(res => res.json())
            .then(sim => setSimilarProducts(sim.filter((p: Product) => p.id !== data.id)))
            .catch(err => console.error(err));
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, quantity);
    alert(`Successfully added ${quantity} item(s) to your cart!`);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product.id, quantity);
    navigate('/checkout');
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) {
      alert('Please log in to submit a review.');
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, rating: newRating, comment: newComment })
      });
      if (res.ok) {
        setNewComment('');
        // Refresh reviews
        const revRes = await fetch(`/api/products/${product.id}/reviews`);
        const revData = await revRes.json();
        setReviews(revData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-purple-100 rounded-3xl max-w-2xl mx-auto" />
          <div className="h-8 bg-purple-100 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="px-6 py-2.5 bg-purple-700 text-white rounded-xl text-xs font-bold inline-block">
          Browse All Products
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
      {/* Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Image Gallery */}
        <div className="space-y-4 sticky top-24">
          <div className="aspect-[4/3] bg-purple-50 rounded-3xl overflow-hidden border border-purple-100 shadow-lg flex items-center justify-center p-4">
            <img
              src={images[selectedImage]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full rounded-2xl"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === index ? 'border-purple-600 scale-105 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Controls */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">{product.brand || product.category_name}</span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">{product.name}</h1>
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-3">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-300'}`} />
              ))}
              <span className="ml-2 font-bold text-slate-900 text-sm">{product.rating}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-purple-700 font-semibold">{product.review_count} Verified Ratings</span>
          </div>

          {/* Price & Discount */}
          <div className="bg-purple-50/70 p-6 rounded-3xl border border-purple-100 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-purple-950">${product.price.toFixed(2)}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-base text-slate-400 line-through">${product.original_price.toFixed(2)}</span>
              )}
              {product.discount_percentage ? (
                <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  Save {product.discount_percentage}%
                </span>
              ) : null}
            </div>
            <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Out of Stock'}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity Selector & Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center bg-purple-50 rounded-xl border border-purple-200 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-purple-900 hover:bg-purple-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-purple-900 hover:bg-purple-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 py-4 px-6 rounded-2xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-sm shadow-xl transition-all"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Truck className="w-5 h-5 text-purple-700 shrink-0" />
              <span>Free Express Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
              <span>1 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <RotateCcw className="w-5 h-5 text-purple-700 shrink-0" />
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-8 pt-10 border-t border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Customer Reviews & Ratings</h2>
            <p className="text-xs text-slate-500 mt-1">Real feedback from verified ShopSphere shoppers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Form */}
          <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Write a Customer Review</h3>
            {user ? (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Terrible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Review</label>
                  <textarea
                    rows={4}
                    placeholder="Share your thoughts about this product..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-purple-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Review
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-500">Please sign in to write a review for this product.</p>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-purple-100 text-center text-slate-500 text-xs">
                No reviews yet. Be the first to review this product!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{rev.user_name || 'Anonymous Shopper'}</span>
                    <span className="text-[10px] text-slate-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-300'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="space-y-8 pt-10 border-t border-purple-100">
          <h2 className="text-2xl font-black text-slate-900">Similar Products You May Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
