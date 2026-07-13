export type Screen =
  | "login"
  | "dashboard"
  | "products"
  | "channels"
  | "inventory"
  | "orders"
  | "shipping"
  | "promotions"
  | "crm"
  | "reports"
  | "settings";

export interface RevenueDataPoint {
  name: string;
  shopee: number;
  lazada: number;
  tiki: number;
}

export interface ChannelData {
  name: string;
  value: number;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  channels: string[];
  status: string;
}

export interface Order {
  id: string;
  code?: string;
  customer: string;
  channel: string;
  total: number;
  status: string;
  date?: string;
  items: number;
  createdAt?: string;
  paymentMethod?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  total: number;
  tier: string;
  lastOrder: string;
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  discount: string;
  type: string;
  start: string;
  end: string;
  used: number;
  limit: number;
  status: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  warehouse: number;
  shopee: number;
  lazada: number;
  tiki: number;
  alert: number;
  status: string;
}

export interface ShippingOrder {
  id: string;
  customer: string;
  carrier: string;
  trackingCode: string;
  status: string;
  from: string;
  to: string;
  eta: string;
}

export interface Channel {
  name: string;
  color: string;
  bg: string;
  border: string;
  connected: boolean;
  products: number;
  orders: number;
  revenue: number;
  lastSync: string;
  apiStatus: string;
  logo: string;
}

export interface ModalProps {
  onClose: () => void;
}
