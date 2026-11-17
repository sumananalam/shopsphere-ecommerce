export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  rating: number;
  review_count: number;
  stock: number;
  brand: string;
  is_featured: number;
  is_best_seller: number;
  is_deal: number;
  images: string[];
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  original_price?: number;
  quantity: number;
  stock: number;
  slug: string;
  image_url: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  slug: string;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  final_amount: number;
  status: string;
  shipping_address_id: number;
  payment_method: string;
  payment_status: string;
  tracking_number: string;
  created_at: string;
  full_name?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  items: OrderItem[];
}
