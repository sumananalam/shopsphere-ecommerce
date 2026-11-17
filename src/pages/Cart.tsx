import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function Cart() {
  const { cartItems, updateQuantity, removeFromCart, subtotal, shippingFee, discountAmount, finalTotal, applyCoupon, appliedCoupon } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await applyCoupon(couponCode.trim());
    setCouponMessage({ success: res.success, text: res.message });
    if (res.success) setCouponCode('');
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingCart className="w-16 h-16 text-purple-300 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Please Sign In to View Your Cart</h2>
        <p className="text-xs text-slate-500">Your shopping cart is securely saved with your account.</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-purple-100 text-purple-700 rounded-3xl mx-auto flex items-center justify-center">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore our wide selection of luxury products and add your favorite items to the cart.
        </p>
        <Link
          to="/products"
          className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-bold shadow-lg inline-block hover:from-purple-700 hover:to-indigo-700 transition-colors"
        >
          Start Shopping Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
        <p className="text-xs text-slate-500 mt-1">Review your items, apply coupons, and proceed to secure checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-purple-50 overflow-hidden shrink-0 border border-purple-100 p-2 flex items-center justify-center">
                <img src={item.image_url} alt={item.name} referrerPolicy="no-referrer" className="object-cover w-full h-full rounded-xl" />
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <Link to={`/product/${item.product_id}`} className="font-bold text-slate-900 hover:text-purple-700 text-sm line-clamp-1">
                  {item.name}
                </Link>
                <div className="text-base font-black text-purple-900">${item.price.toFixed(2)}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">In Stock ({item.stock})</div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-purple-50 rounded-xl border border-purple-200 overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="px-3 py-1.5 text-purple-900 hover:bg-purple-100 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="px-3 py-1.5 text-purple-900 hover:bg-purple-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remove item"
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xl space-y-6 sticky top-24">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">Order Summary</h3>

          {/* Coupon Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Promo / Coupon Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Try PURPLE10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600 uppercase font-mono"
              />
              <button type="submit" className="px-4 py-2.5 bg-purple-900 text-white rounded-xl text-xs font-bold hover:bg-purple-800 transition-colors">
                Apply
              </button>
            </div>
            {couponMessage && (
              <p className={`text-[11px] font-semibold ${couponMessage.success ? 'text-emerald-600' : 'text-red-600'}`}>
                {couponMessage.text}
              </p>
            )}
            {appliedCoupon && (
              <p className="text-[11px] text-purple-700 font-bold">Applied Coupon: {appliedCoupon}</p>
            )}
          </form>

          {/* Price Breakdown */}
          <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)} items):</span>
              <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping:</span>
              <span className="font-bold text-emerald-600">
                {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-purple-700 font-bold">
                <span>Coupon Discount:</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-slate-100 text-base font-black text-purple-950">
              <span>Final Total:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Secure 256-Bit Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
