import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, ShieldCheck, Star, Award, TrendingUp } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';

export function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [dealsProducts, setDealsProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));

    fetch('/api/products?featured=true&limit=4')
      .then(res => res.json())
      .then(data => setFeaturedProducts(data))
      .catch(err => console.error(err));

    fetch('/api/products?deal=true&limit=4')
      .then(res => res.json())
      .then(data => setDealsProducts(data))
      .catch(err => console.error(err));

    fetch('/api/products?bestSeller=true&limit=4')
      .then(res => res.json())
      .then(data => setBestSellers(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white shadow-2xl p-8 md:p-14 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Background decorative glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-purple-800/60 border border-purple-600/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-200">
              <Sparkles className="w-4 h-4 text-purple-300" /> ShopSphere Exclusive Season Launch
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
              Discover the <span className="bg-gradient-to-r from-purple-400 via-lavender-300 to-purple-200 bg-clip-text text-transparent">Ultimate Luxury</span> Shopping
            </h1>
            <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
              Explore millions of top-tier electronics, designer fashion, smart home essentials, and artisanal delights. Experience lightning-fast express delivery and VIP rewards.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/products"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-sm shadow-xl hover:shadow-purple-500/25 transition-all flex items-center gap-2"
              >
                Shop All Collections <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products?deal=true"
                className="px-8 py-4 rounded-2xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-white font-bold text-sm transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-400" /> Today's Deals
              </Link>
            </div>
          </div>

          <div className="relative z-10 w-full lg:w-1/2 flex justify-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-700/40 max-w-lg aspect-[16/9] w-full">
              <img
                src="/src/assets/images/hero_purple_banner_1794888007297.jpg"
                alt="PurpleCart Luxury Collection"
                referrerPolicy="no-referrer"
                className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shop by Category</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Explore our wide variety of curated departments</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1">
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group bg-white rounded-3xl p-6 border border-purple-100 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-20 h-20 rounded-2xl bg-purple-50 overflow-hidden flex items-center justify-center p-2 shadow-inner group-hover:scale-110 transition-transform">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="object-cover w-full h-full rounded-xl"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">{cat.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's Deals Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-3xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Today's Lightning Deals</h2>
              <p className="text-xs text-purple-200">Limited time offers with massive savings up to 40% OFF</p>
            </div>
          </div>
          <Link to="/products?deal=true" className="px-5 py-2.5 bg-white text-purple-950 font-bold text-xs rounded-xl shadow hover:bg-purple-50 transition-colors">
            See All Deals
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealsProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Best Sellers</h2>
              <p className="text-xs text-slate-500">Most popular products loved by our customers</p>
            </div>
          </div>
          <Link to="/products?bestSeller=true" className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1">
            View All Best Sellers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-purple-800 via-indigo-950 to-purple-950 text-white p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative">
          <div className="space-y-4 max-w-lg z-10">
            <span className="bg-purple-600/50 text-purple-200 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/40">
              VIP MEMBER REWARDS
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Join ShopSphere Premium Today</h2>
            <p className="text-purple-200 text-sm">
              Get free unlimited express shipping, 5% cashback on all purchases, and priority 24/7 customer support for only $9.99/month.
            </p>
            <div className="pt-2">
              <Link to="/products" className="px-6 py-3.5 bg-white text-purple-950 font-bold text-xs rounded-2xl shadow-xl hover:bg-purple-100 transition-colors inline-block">
                Explore Membership Perks
              </Link>
            </div>
          </div>
          <div className="z-10 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center space-y-3">
            <TrendingUp className="w-12 h-12 text-lavender-300" />
            <div className="text-3xl font-black">50,000+</div>
            <div className="text-xs text-purple-200 font-medium">Satisfied VIP Shoppers Worldwide</div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured Collections</h2>
              <p className="text-xs text-slate-500">Hand-picked premium selections for you</p>
            </div>
          </div>
          <Link to="/products?featured=true" className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1">
            View All Featured <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Customer Reviews Highlight */}
      <section className="max-w-7xl mx-auto px-4 bg-purple-50/60 rounded-3xl p-10 border border-purple-100 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-purple-950">What Our Shoppers Say</h2>
          <p className="text-xs text-slate-600">Rated 4.9 / 5.0 stars from over 15,000 verified customer reviews</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 space-y-3">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-slate-700 italic">"The PurpleAura wireless headphones are absolute perfection! Sound quality is pristine, and delivery arrived in less than 24 hours."</p>
            <div className="text-xs font-bold text-purple-900">— Marcus S., Verified Buyer</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 space-y-3">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-slate-700 italic">"ShopSphere's purple aesthetic and smooth checkout made shopping effortless. The Royal Velvet hoodie is my new favorite piece!"</p>
            <div className="text-xs font-bold text-purple-900">— Olivia R., Fashion Enthusiast</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 space-y-3">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-slate-700 italic">"Customer support is exceptionally responsive, and the quality of products exceeds expectations every single time."</p>
            <div className="text-xs font-bold text-purple-900">— David K., Tech Reviewer</div>
          </div>
        </div>
      </section>
    </div>
  );
}
