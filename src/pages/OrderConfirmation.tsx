import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, ShieldCheck } from 'lucide-react';

export function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const trackingNumber = location.state?.trackingNumber || 'PC-' + Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-3xl mx-auto flex items-center justify-center shadow-2xl animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Order Placed Successfully!</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Thank you for shopping with ShopSphere. Your order has been successfully placed and is now being prepared for express shipment.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-purple-100 shadow-xl space-y-6 text-left max-w-xl mx-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">ORDER ID</div>
            <div className="text-base font-black text-purple-900">#PC-{id}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-semibold">TRACKING NUMBER</div>
            <div className="text-sm font-mono font-bold text-slate-800">{trackingNumber}</div>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-purple-700 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Estimated Delivery: 2-3 Business Days</div>
              <div className="text-[11px] text-slate-400">Shipped via ShopSphere Express Logistics</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Payment Status: Paid (Secure Sandbox)</div>
              <div className="text-[11px] text-slate-400">Receipt sent to your registered email</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/orders"
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-xl hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center gap-2"
        >
          <Package className="w-4 h-4" /> View My Orders & Tracking
        </Link>
        <Link
          to="/products"
          className="px-8 py-3.5 rounded-2xl bg-white border border-purple-200 text-purple-900 text-xs font-bold hover:bg-purple-50 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
