import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Truck, Lock, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function Checkout() {
  const { cartItems, subtotal, shippingFee, discountAmount, finalTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.name || '');
  const [street, setStreet] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Springfield');
  const [state, setState] = useState('OR');
  const [postalCode, setPostalCode] = useState('97477');
  const [country, setCountry] = useState('United States');
  const [phone, setPhone] = useState(user?.phone || '+15550199283');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [submitting, setSubmitting] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cartItems.length === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          shippingAddress: { fullName, street, city, state, postalCode, country, phone },
          items: cartItems,
          totalAmount: subtotal,
          shippingFee,
          discountAmount,
          finalTotal,
          paymentMethod
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      clearCart();
      navigate(`/order-confirmation/${data.orderId}`, { state: { trackingNumber: data.trackingNumber } });
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
      setSubmitting(false);
    }
  };

  if (!user || cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Your cart is empty or you are not signed in</h2>
        <button onClick={() => navigate('/products')} className="px-6 py-2.5 bg-purple-700 text-white rounded-xl text-xs font-bold">
          Return to Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Secure Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">Please enter your shipping address and payment method to complete your order</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Shipping & Payment Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address Card */}
          <div className="bg-white p-8 rounded-3xl border border-purple-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-700" /> Shipping Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Province</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white p-8 rounded-3xl border border-purple-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-700" /> Payment Method
            </h3>

            <div className="space-y-3">
              {[
                { id: 'Credit Card', label: 'Credit / Debit Card (Sandbox Demo)', desc: 'Visa, MasterCard, Amex securely processed' },
                { id: 'UPI', label: 'UPI / Instant Mobile Payment', desc: 'Google Pay, PhonePe, Apple Pay' },
                { id: 'Cash on Delivery', label: 'Cash on Delivery (COD)', desc: 'Pay with cash upon delivery' }
              ].map(method => (
                <label
                  key={method.id}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === method.id ? 'border-purple-600 bg-purple-50/50 shadow-sm' : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 text-purple-600"
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{method.label}</div>
                    <div className="text-[11px] text-slate-500">{method.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {paymentMethod === 'Credit Card' && (
              <div className="space-y-4 pt-4 border-t border-slate-100 bg-purple-50/40 p-4 rounded-2xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Card Number</label>
                  <input type="text" placeholder="4532 •••• •••• 8892" defaultValue="4532 8892 1092 8892" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                    <input type="text" placeholder="MM/YY" defaultValue="12/28" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                    <input type="password" placeholder="123" defaultValue="889" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary & Place Order */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xl space-y-6 sticky top-24">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">Order Summary</h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs gap-2">
                <div className="truncate flex-1">
                  <span className="font-bold text-slate-800">{item.quantity}x</span> {item.name}
                </div>
                <span className="font-bold text-slate-900 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span className="font-bold text-emerald-600">{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-purple-700 font-bold">
                <span>Discount:</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-slate-100 text-base font-black text-purple-950">
              <span>Total Amount:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            {submitting ? 'Processing Order...' : 'Place Order Now'}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
            <Lock className="w-4 h-4 text-purple-600" />
            <span>Guaranteed Safe & Secure Checkout</span>
          </div>
        </div>
      </form>
    </div>
  );
}
