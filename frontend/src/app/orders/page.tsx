"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, RefreshCw, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { apiGet, apiPost, type OrderDto, type PageResponse } from "@/lib/api";

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-sky-50 text-sky-700 border-sky-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  REFUNDED: "bg-slate-50 text-slate-600 border-slate-200",
};

// Trạng thái kết thúc — backend không cho chuyển tiếp nữa
const terminalStatuses = new Set(["COMPLETED", "CANCELLED", "REFUNDED"]);

const sourceLabels: Record<string, string> = {
  MANUAL: "Thủ công",
  WEBSITE: "Website",
  SHOPEE: "Shopee",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  API: "Website",
};

const tabs = [
  { key: "all", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xử lý" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "CANCELLED", label: "Đã hủy" },
];

interface AdminOrder extends OrderDto {
  customerName: string;
  source: string;
}

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[status] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await apiGet<PageResponse<AdminOrder>>("/orders/search?page=0&size=100");
      setOrders(page.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được đơn hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (order: AdminOrder, newStatus: string) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = newStatus === "CANCELLED"
        ? await apiPost<AdminOrder>(`/orders/${order.id}/cancel`, {})
        : await apiPost<AdminOrder>(`/orders/${order.id}/status`, { newStatus, note: "Admin cập nhật trạng thái" });
      setOrders(prev => prev.map(o => (o.id === updated.id ? { ...o, ...updated } : o)));
      setSelected(prev => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cập nhật trạng thái thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const tabCounts = tabs.reduce((acc, t) => {
    acc[t.key] = t.key === "all" ? orders.length : orders.filter(o => o.status === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  const filtered = activeTab === "all" ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý đơn hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Tổng số {orders.length} đơn hàng</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Tải lại
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.label}
            <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs ${
              activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
              <th className="pb-3 pr-4 pl-4 pt-3">Mã đơn</th>
              <th className="pb-3 pr-4 pt-3">Khách hàng</th>
              <th className="pb-3 pr-4 pt-3">Nguồn</th>
              <th className="pb-3 pr-4 pt-3">Ngày đặt</th>
              <th className="pb-3 pr-4 pt-3">Sản phẩm</th>
              <th className="pb-3 pr-4 pt-3 text-right">Tổng tiền</th>
              <th className="pb-3 pr-4 pt-3">Trạng thái</th>
              <th className="pb-3 pr-4 pt-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                <td className="py-3 pr-4 pl-4">
                  <span className="font-mono text-xs text-blue-600">{order.orderCode}</span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-bold text-blue-700">
                      {(order.customerName || "?").charAt(0)}
                    </div>
                    <span className="font-medium text-slate-900">{order.customerName || "—"}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-slate-500">{sourceLabels[order.source] ?? order.source}</td>
                <td className="py-3 pr-4 text-slate-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : ""}
                </td>
                <td className="py-3 pr-4 text-slate-700">{(order.items ?? []).length} SP</td>
                <td className="py-3 pr-4 text-right font-medium text-slate-900">
                  {formatCurrency(order.totalAmount)}
                </td>
                <td className="py-3 pr-4"><Badge status={order.status} /></td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => setSelected(order)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !loading && (
          <div className="py-12 text-center text-sm text-slate-400">
            {orders.length === 0 ? "Chưa có đơn hàng nào" : "Không tìm thấy đơn hàng phù hợp"}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selected.orderCode}</h2>
                <div className="mt-1"><Badge status={selected.status} /></div>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <div><span className="text-slate-400">Khách:</span> {selected.customerName || "—"}</div>
              <div><span className="text-slate-400">Ngày đặt:</span> {selected.createdAt ? new Date(selected.createdAt).toLocaleString("vi-VN") : ""}</div>
              <div><span className="text-slate-400">Thanh toán:</span> {selected.paymentMethod ?? "—"}</div>
              {selected.notes && <div><span className="text-slate-400">Ghi chú:</span> {selected.notes}</div>}
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 divide-y divide-slate-50">
              {(selected.items ?? []).map((it, i) => (
                <div key={i} className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-slate-700">{it.productName} × {it.quantity}</span>
                  <span className="font-medium text-slate-900">{formatCurrency(it.totalPrice ?? it.unitPrice * it.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between px-3 py-2 text-sm font-bold">
                <span>Tổng tiền</span>
                <span className="text-blue-600">{formatCurrency(selected.totalAmount)}</span>
              </div>
            </div>

            {!terminalStatuses.has(selected.status) && (
              <div className="mt-5">
                <div className="text-xs font-medium text-slate-400 mb-2">Chuyển trạng thái</div>
                <div className="flex flex-wrap gap-2">
                  {["CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "COMPLETED", "CANCELLED"]
                    .filter(s => s !== selected.status)
                    .map(s => (
                      <button
                        key={s}
                        disabled={updating}
                        onClick={() => changeStatus(selected, s)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                          s === "CANCELLED"
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {statusLabels[s]}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
