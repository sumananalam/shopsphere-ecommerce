import React, { useState } from 'react';
import { ShieldCheck, Truck, Headphones, RotateCcw, Send } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-purple-950 text-purple-200 pt-16 pb-12 border-t border-purple-900 mt-20">
      {/* Features Bar */}
      <div className="max-w-7xl mx-auto px-4 pb-12 border-b border-purple-900/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-900/30 border border-purple-800/40">
          <Truck className="w-8 h-8 text-purple-400 shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm">Free Express Shipping</h4>
            <p className="text-xs text-purple-300">On all orders over $100</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-900/30 border border-purple-800/40">
          <ShieldCheck className="w-8 h-8 text-purple-400 shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm">Secure Payment</h4>
            <p className="text-xs text-purple-300">100% secure checkout guarantee</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-900/30 border border-purple-800/40">
          <RotateCcw className="w-8 h-8 text-purple-400 shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm">Easy 30-Day Returns</h4>
            <p className="text-xs text-purple-300">Hassle-free refunds & exchanges</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-900/30 border border-purple-800/40">
          <Headphones className="w-8 h-8 text-purple-400 shrink-0" />
          <div>
            <h4 className="font-bold text-white text-sm">24/7 VIP Support</h4>
            <p className="text-xs text-purple-300">Dedicated shopping assistants</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 border-b border-purple-900/60">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow">
              <span className="text-xl font-black text-white">SS</span>
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">ShopSphere</span>
          </div>
          <p className="text-xs text-purple-300 max-w-sm leading-relaxed">
            ShopSphere is your premier luxury e-commerce destination, offering curated top-tier electronics, fashion, beauty, and lifestyle products with lightning-fast delivery and absolute satisfaction guaranteed.
          </p>
          <div className="pt-2">
            <p className="text-xs font-semibold text-white mb-2">Subscribe to Exclusive Deals</p>
            {subscribed ? (
              <p className="text-xs text-green-300 font-medium">Thank you for subscribing to ShopSphere VIP newsletter!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-purple-900/50 border border-purple-700/60 text-white placeholder-purple-400 text-xs px-4 py-2.5 rounded-xl flex-1 focus:outline-none focus:border-purple-400"
                />
                <button type="submit" aria-label="Subscribe to newsletter" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white tracking-wide">Shop Categories</h4>
          <ul className="space-y-2 text-xs text-purple-300">
            <li><a href="/products?category=electronics" className="hover:text-white transition-colors">Electronics & Gadgets</a></li>
            <li><a href="/products?category=fashion" className="hover:text-white transition-colors">Fashion & Apparel</a></li>
            <li><a href="/products?category=home-kitchen" className="hover:text-white transition-colors">Home & Kitchen</a></li>
            <li><a href="/products?category=beauty-personal-care" className="hover:text-white transition-colors">Beauty & Personal Care</a></li>
            <li><a href="/products?category=books" className="hover:text-white transition-colors">Books & Education</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white tracking-wide">Customer Service</h4>
          <ul className="space-y-2 text-xs text-purple-300">
            <li><a href="/orders" className="hover:text-white transition-colors">Track Your Order</a></li>
            <li><a href="/cart" className="hover:text-white transition-colors">Shopping Cart</a></li>
            <li><a href="/wishlist" className="hover:text-white transition-colors">My Wishlist</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Returns & Refunds</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Help Center & FAQ</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white tracking-wide">About ShopSphere</h4>
          <ul className="space-y-2 text-xs text-purple-300">
            <li><a href="#" className="hover:text-white transition-colors">Our Story & Vision</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers & Press</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-purple-400 gap-4">
        <p>&copy; 2026 ShopSphere Inc. All rights reserved. Designed with premium purple theme.</p>
        <div className="flex items-center gap-6">
          <span className="hover:text-white cursor-pointer">Privacy</span>
          <span className="hover:text-white cursor-pointer">Terms</span>
          <span className="hover:text-white cursor-pointer">Security</span>
          <span className="hover:text-white cursor-pointer">Site Map</span>
        </div>
      </div>
    </footer>
  );
}
