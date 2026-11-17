import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

export function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Please Sign In to View Your Orders</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Orders & Tracking</h1>
        <p className="text-xs text-slate-500 mt-1">Review your order history, delivery status, and tracking numbers</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-purple-100 h-40 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-purple-100 space-y-4">
          <Package className="w-16 h-16 text-purple-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">No Orders Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't placed any orders yet. Explore our collections and start your luxury shopping experience.
          </p>
          <Link to="/products" className="px-6 py-2.5 bg-purple-700 text-white rounded-xl text-xs font-bold inline-block">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-purple-900">Order #PC-{order.id}</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-[11px] font-bold rounded-full">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-[11px] text-slate-400 font-semibold">TRACKING NUMBER</div>
                  <div className="text-xs font-mono font-bold text-slate-800">{order.tracking_number}</div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ordered Items</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</div>
                        <div className="text-[11px] text-slate-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                      </div>
                      <div className="text-xs font-black text-purple-900">
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Footer & Total */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-600">
                  <span className="font-semibold">Shipping Address:</span> {order.street}, {order.city}, {order.state} {order.postal_code}
                </div>
                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="text-xs text-slate-500">Total Amount:</div>
                  <div className="text-lg font-black text-purple-950">${order.final_amount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
