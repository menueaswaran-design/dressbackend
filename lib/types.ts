export interface AdminUser {
  _id: string;
  firebaseUid: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "product_manager" | "order_manager" | "customer_support";
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  slug: string;
  category: { _id: string; name: string };
  collection?: { _id: string; name: string };
  brand?: string;
  gender?: string;
  tags: string[];
  mrp: number;
  sellingPrice: number;
  costPrice?: number;
  discount: number;
  stock: number;
  lowStockLimit: number;
  images: { url: string; type: string; isPrimary: boolean }[];
  variants: Variant[];
  seo?: { title?: string; description?: string; keywords?: string[] };
  shipping?: { weight?: number; height?: number; width?: number; length?: number; packageType?: string };
  isActive: boolean;
  createdAt: string;
}

export interface Variant {
  sku: string;
  color?: string;
  size?: string;
  price: number;
  stock: number;
  image?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  banner?: string;
  thumbnail?: string;
  parentCategory?: { _id: string; name: string };
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  banner?: string;
  description?: string;
  products: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: { _id: string; name: string; email: string };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  total: number;
  paymentInfo: { method?: string; transactionId?: string; status: string };
  status: OrderStatus;
  createdAt: string;
}

export interface OrderItem {
  product: { _id: string; name: string; images?: { url: string }[] } | string;
  variant?: { color?: string; size?: string; sku?: string };
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus = "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "returned" | "refunded";

export interface Customer {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: "percentage" | "flat" | "buy_x_get_y" | "free_shipping";
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  totalCustomers: number;
  returningCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  monthlyStats: { _id: string; count: number; revenue: number }[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}
