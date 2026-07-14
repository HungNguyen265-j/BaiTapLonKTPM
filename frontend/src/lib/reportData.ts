import { apiGet, type PageResponse } from "@/lib/api";

// Dữ liệu tổng hợp cho Dashboard + Báo cáo.
// Ưu tiên lấy từ report-service (đúng kiến trúc microservices);
// nếu service đó không chạy thì frontend tự tính từ API đơn hàng (dự phòng).

export interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  revenueByChannel: Record<string, number>;
  revenueByDay: Record<string, number>; // "2026-02-23" -> doanh thu
  source: "report-service" | "frontend";
}

export interface OrderLite {
  id: string;
  orderCode: string;
  status: string;
  source: string;
  totalAmount: number;
  customerName: string | null;
  createdAt: string;
  items?: { quantity: number }[];
}

interface ReportApiResponse {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  revenueByChannel: Record<string, number> | null;
  revenueByDay: Record<string, number> | null;
}

export async function fetchOrdersInRange(startDate: string, endDate: string): Promise<OrderLite[]> {
  const page = await apiGet<PageResponse<OrderLite>>(
    `/orders/search?startDate=${startDate}&endDate=${endDate}&page=0&size=500`
  );
  return page.content ?? [];
}

export async function loadDashboardData(startDate: string, endDate: string): Promise<DashboardData> {
  try {
    const r = await apiGet<ReportApiResponse>(
      `/reports/dashboard?startDate=${startDate}&endDate=${endDate}`
    );
    return {
      totalRevenue: r.totalRevenue ?? 0,
      totalOrders: r.totalOrders ?? 0,
      totalCustomers: r.totalCustomers ?? 0,
      revenueByChannel: r.revenueByChannel ?? {},
      revenueByDay: r.revenueByDay ?? {},
      source: "report-service",
    };
  } catch {
    // report-service không phản hồi -> tự tính từ API đơn hàng + khách hàng
    const [orders, customersPage] = await Promise.all([
      fetchOrdersInRange(startDate, endDate),
      apiGet<PageResponse<unknown>>("/customers/search?page=0&size=1"),
    ]);
    const valid = orders.filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED");
    const revenueByChannel: Record<string, number> = {};
    const revenueByDay: Record<string, number> = {};
    let totalRevenue = 0;
    for (const o of valid) {
      const amount = o.totalAmount ?? 0;
      totalRevenue += amount;
      const channel = o.source ?? "UNKNOWN";
      revenueByChannel[channel] = (revenueByChannel[channel] ?? 0) + amount;
      const day = (o.createdAt ?? "").slice(0, 10);
      if (day) revenueByDay[day] = (revenueByDay[day] ?? 0) + amount;
    }
    return {
      totalRevenue,
      totalOrders: orders.length,
      totalCustomers: customersPage.totalElements ?? 0,
      revenueByChannel,
      revenueByDay,
      source: "frontend",
    };
  }
}

// Gộp API (đăng ký web cũ) vào WEBSITE khi hiển thị
export function mergeWebsiteChannels(byChannel: Record<string, number>): Record<string, number> {
  const merged: Record<string, number> = {};
  for (const [key, value] of Object.entries(byChannel)) {
    const k = key === "API" ? "WEBSITE" : key;
    merged[k] = (merged[k] ?? 0) + value;
  }
  return merged;
}

export const channelColors: Record<string, string> = {
  WEBSITE: "#10B981",
  SHOPEE: "#EE4D2D",
  FACEBOOK: "#1877F2",
  TIKTOK: "#0F172A",
  MANUAL: "#64748B",
  UNKNOWN: "#94A3B8",
};

export const channelLabels: Record<string, string> = {
  WEBSITE: "Website",
  SHOPEE: "Shopee",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  MANUAL: "Thủ công",
  UNKNOWN: "Khác",
};

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
