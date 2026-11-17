import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => void;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  finalTotal: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  appliedCoupon: string | null;
  couponDiscount: number;
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  const refreshCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    try {
      const res = await fetch(`/api/cart?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      return;
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId, quantity })
      });
      if (res.ok) {
        await refreshCart();
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) return;
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId, quantity })
      });
      if (res.ok) {
        await refreshCart();
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await refreshCart();
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const applyCoupon = async (code: string) => {
    try {
      const sub = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal: sub })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Invalid coupon' };
      }
      setAppliedCoupon(data.code);
      setCouponDiscount(data.discountAmount);
      return { success: true, message: `Coupon ${data.code} applied successfully! -$${data.discountAmount}` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to apply coupon' };
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const discountAmount = couponDiscount;
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      shippingFee,
      discountAmount,
      finalTotal,
      applyCoupon,
      appliedCoupon,
      couponDiscount,
      cartCount,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
