import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isLoginTab) {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail('jane@example.com');
    setPassword('password123');
    setIsLoginTab(true);
  };

  const fillDemoAdmin = () => {
    setEmail('admin@purplecart.com');
    setPassword('admin123');
    setIsLoginTab(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg">
            <span className="font-black text-lg">SS</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {isLoginTab ? 'Welcome Back to ShopSphere' : 'Create Your Account'}
          </h3>
          <p className="text-xs text-slate-500">
            {isLoginTab ? 'Sign in to access your cart, wishlist, and orders' : 'Join thousands of VIP shoppers today'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-purple-50 p-1 rounded-2xl">
          <button
            onClick={() => { setIsLoginTab(true); setError(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isLoginTab ? 'bg-white text-purple-900 shadow' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLoginTab(false); setError(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              !isLoginTab ? 'bg-white text-purple-900 shadow' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {!isLoginTab && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="+1 555 019 283"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-600"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xl transition-transform active:scale-95"
          >
            {submitting ? 'Please wait...' : isLoginTab ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-semibold text-slate-500 text-center">Quick Demo Testing Credentials:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoCustomer}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-[11px] font-bold text-center transition-colors border border-purple-200"
            >
              Fill Demo Customer
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[11px] font-bold text-center transition-colors border border-indigo-200"
            >
              Fill Admin Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
