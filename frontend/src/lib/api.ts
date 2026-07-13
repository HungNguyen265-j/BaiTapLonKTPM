// Đường dẫn tương đối: Next.js proxy /api sang gateway (xem next.config.js)
// nên chạy được từ mọi nguồn truy cập: localhost, IP LAN, hay link tunnel
const API_BASE = "/api";

export interface Session {
  token: string;
  role: "ADMIN" | "CUSTOMER";
  name: string;
  email: string;
  customerId: string | null;
}

const SESSION_KEY = "salehub_session";

export function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const session = loadSession();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options?.headers,
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, body?.message || `Lỗi ${res.status}, vui lòng thử lại`);
  }
  return body as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPost<T>(path: string, data: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(data) });
}

export function apiDelete(path: string): Promise<null> {
  return request<null>(path, { method: "DELETE" });
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ProductDto {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  basePrice: number;
  salePrice: number | null;
  unit: string | null;
  status: string;
}

export interface OrderItemDto {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  id: string;
  orderCode: string;
  status: string;
  totalAmount: number;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItemDto[];
}
