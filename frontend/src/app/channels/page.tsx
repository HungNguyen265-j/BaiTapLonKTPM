"use client";

import { useEffect, useState } from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  Plus,
  Package,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { apiGet, type OrderDto, type PageResponse, type ProductDto } from "@/lib/api";
import AddChannelModal from "@/components/channels/AddChannelModal";

interface Channel {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  products?: number;
  orders?: number;
  revenue?: number;
  lastSync?: string;
  apiStatus?: "ok" | "warn" | "error";
}

interface SyncRecord {
  id: string;
  time: string;
  channel: string;
  type: "Sản phẩm" | "Đơn hàng" | "Tồn kho";
  count: number;
  status: "success" | "error" | "syncing";
}

// Shopee/Lazada/Tiki: số liệu minh hoạ (chưa tích hợp API sàn). Website: số liệu THẬT, nạp từ backend.
const staticChannels: Channel[] = [
  { id: "shopee", name: "Shopee", logo: "🛍", connected: true, products: 48, orders: 1240, revenue: 398_000_000, lastSync: "08:32", apiStatus: "ok" },
  { id: "lazada", name: "Lazada", logo: "🏪", connected: true, products: 35, orders: 672, revenue: 213_000_000, lastSync: "08:30", apiStatus: "ok" },
  { id: "tiki", name: "Tiki", logo: "📦", connected: true, products: 22, orders: 318, revenue: 99_000_000, lastSync: "08:28", apiStatus: "warn" },
];

const syncHistory: SyncRecord[] = [
  { id: "S001", time: "08:32 25/06", channel: "Shopee", type: "Sản phẩm", count: 48, status: "success" },
  { id: "S002", time: "08:32 25/06", channel: "Shopee", type: "Đơn hàng", count: 15, status: "success" },
  { id: "S003", time: "08:30 25/06", channel: "Lazada", type: "Sản phẩm", count: 35, status: "success" },
  { id: "S004", time: "08:30 25/06", channel: "Lazada", type: "Đơn hàng", count: 8, status: "success" },
  { id: "S005", time: "08:28 25/06", channel: "Tiki", type: "Sản phẩm", count: 22, status: "success" },
  { id: "S006", time: "08:28 25/06", channel: "Tiki", type: "Tồn kho", count: 50, status: "success" },
  { id: "S007", time: "07:15 24/06", channel: "Tiki", type: "Đơn hàng", count: 12, status: "error" },
  { id: "S008", time: "06:00 24/06", channel: "Shopee", type: "Tồn kho", count: 120, status: "success" },
];

const apiStatusMap: Record<string, { label: string; className: string }> = {
  ok: { label: "API OK", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  warn: { label: "API Chậm", className: "bg-amber-50 text-amber-700 border-amber-200" },
  error: { label: "API Lỗi", className: "bg-red-50 text-red-700 border-red-200" },
};

const syncStatusMap: Record<string, { label: string; className: string }> = {
  success: { label: "Thành công", className: "bg-emerald-50 text-emerald-700" },
  error: { label: "Thất bại", className: "bg-red-50 text-red-700" },
  syncing: { label: "Đang đồng bộ", className: "bg-blue-50 text-blue-700" },
};

export default function ChannelsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [website, setWebsite] = useState<Channel>({
    id: "website", name: "Website", logo: "🌐", connected: true,
    products: 0, orders: 0, revenue: 0, lastSync: "—", apiStatus: "ok",
  });

  useEffect(() => {
    (async () => {
      try {
        const [products, webOrders, apiOrders] = await Promise.all([
          apiGet<PageResponse<ProductDto>>("/products/search?page=0&size=1"),
          apiGet<PageResponse<OrderDto>>("/orders/search?source=WEBSITE&page=0&size=100"),
          apiGet<PageResponse<OrderDto>>("/orders/search?source=API&page=0&size=100"),
        ]);
        const all = [...webOrders.content, ...apiOrders.content];
        setWebsite(w => ({
          ...w,
          products: products.totalElements,
          orders: webOrders.totalElements + apiOrders.totalElements,
          revenue: all.reduce((s, o) => s + (o.totalAmount ?? 0), 0),
          lastSync: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        }));
      } catch {
        setWebsite(w => ({ ...w, apiStatus: "error" }));
      }
    })();
  }, []);

  const channels = [...staticChannels, website];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kênh bán hàng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý các kênh bán hàng đã kết nối
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Thêm kênh bán
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {channels.map((ch) => (
          <div
            key={ch.id}
            className={cn(
              "rounded-xl border bg-white p-5 transition-shadow hover:shadow-sm",
              ch.connected ? "border-slate-200" : "border-2 border-dashed border-slate-300"
            )}
          >
            {ch.connected ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
                      {ch.logo}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{ch.name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs font-medium text-emerald-600">Đã kết nối</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                      apiStatusMap[ch.apiStatus ?? "ok"]?.className
                    )}
                  >
                    {apiStatusMap[ch.apiStatus ?? "ok"]?.label}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-4 rounded-lg bg-slate-50 p-4">
                  <div className="text-center">
                    <div className="flex justify-center">
                      <Package className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-1 text-lg font-bold text-slate-900">{ch.products}</p>
                    <p className="text-xs text-slate-400">Sản phẩm</p>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center">
                      <ShoppingCart className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-1 text-lg font-bold text-slate-900">{ch.orders}</p>
                    <p className="text-xs text-slate-400">Đơn hàng</p>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {formatCurrency(ch.revenue!).replace("₫", "")}đ
                    </p>
                    <p className="text-xs text-slate-400">Doanh thu</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <RefreshCw className="h-3 w-3" />
                    Đồng bộ lúc {ch.lastSync}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                      <RefreshCw className="h-3 w-3" />
                      Đồng bộ ngay
                    </button>
                    <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                      <Settings className="h-3 w-3" />
                      Cài đặt
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-4xl">{ch.logo}</span>
                <h3 className="mt-3 text-base font-bold text-slate-900">{ch.name}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Kết nối để quản lý sản phẩm và đơn hàng
                </p>
                <button className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                  <Wifi className="h-4 w-4" />
                  Kết nối
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-1 text-base font-semibold text-slate-900">
          Lịch sử đồng bộ
        </h3>
        <p className="mb-4 text-xs text-slate-400">
          Nhật ký đồng bộ dữ liệu gần đây
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
                <th className="pb-3 pr-4">Thời gian</th>
                <th className="pb-3 pr-4">Kênh</th>
                <th className="pb-3 pr-4">Loại</th>
                <th className="pb-3 pr-4">Số lượng</th>
                <th className="pb-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {syncHistory.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-slate-50 transition hover:bg-slate-50/50"
                >
                  <td className="py-3 pr-4 text-xs text-slate-500">{record.time}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
                      {channels.find((c) => c.name === record.channel)?.logo}{" "}
                      {record.channel}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{record.type}</td>
                  <td className="py-3 pr-4 font-medium text-slate-900">
                    {record.count.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        syncStatusMap[record.status]?.className
                      )}
                    >
                      {record.status === "success" && "Thành công"}
                      {record.status === "error" && "Thất bại"}
                      {record.status === "syncing" && "Đang đồng bộ"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddChannelModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
