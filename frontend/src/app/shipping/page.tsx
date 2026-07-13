"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Truck, MapPin, RefreshCw, CheckCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { apiGet, apiPost, ApiError, type PageResponse } from "@/lib/api";

interface ShippingOrder {
  id: string;
  orderCode: string;
  status: string;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  totalAmount: number;
  createdAt: string;
}

// Các đơn vị vận chuyển liên kết (minh họa — tích hợp thật thuộc shipping-service)
const carriers = [
  { key: "ghn", label: "GHN", color: "bg-orange-500" },
  { key: "ghtk", label: "GHTK", color: "bg-green-500" },
  { key: "viettel", label: "Viettel Post", color: "bg-blue-600" },
  { key: "jtexpress", label: "J&T Express", color: "bg-red-500" },
  { key: "ninjavan", label: "Ninja Van", color: "bg-yellow-500" },
];

type Tab = "SHIPPING" | "DELIVERED";

function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("vi-VN");
}

export default function ShippingPage() {
  const [shipping, setShipping] = useState<ShippingOrder[]>([]);
  const [delivered, setDelivered] = useState<ShippingOrder[]>([]);
  const [tab, setTab] = useState<Tab>("SHIPPING");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ship, done] = await Promise.all([
        apiGet<PageResponse<ShippingOrder>>("/orders/search?status=SHIPPING&page=0&size=100"),
        apiGet<PageResponse<ShippingOrder>>("/orders/search?status=DELIVERED&page=0&size=100"),
      ]);
      setShipping(ship.content);
      setDelivered(done.content);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được danh sách vận chuyển");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Đánh dấu đơn đã giao thành công ngay tại trang vận chuyển
  const markDelivered = async (order: ShippingOrder) => {
    setBusyId(order.id);
    setError("");
    try {
      await apiPost(`/orders/${order.id}/status`, {
        newStatus: "DELIVERED",
        note: "Giao hàng thành công (cập nhật từ trang Vận chuyển)",
      });
      await load();
      setTab("DELIVERED");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Cập nhật trạng thái thất bại");
    } finally {
      setBusyId("");
    }
  };

  const list = tab === "SHIPPING" ? shipping : delivered;
  const q = search.toLowerCase();
  const filtered = list.filter(
    (o) =>
      o.orderCode.toLowerCase().includes(q) ||
      (o.customerName ?? "").toLowerCase().includes(q) ||
      (o.customerPhone ?? "").includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý vận chuyển</h1>
          <p className="mt-1 text-sm text-slate-500">
            Đơn chuyển sang trạng thái &quot;Đang giao&quot; ở trang Đơn hàng sẽ xuất hiện tại đây
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Tải lại
        </button>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
          Đơn vị vận chuyển liên kết
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {carriers.map((carrier) => (
            <div
              key={carrier.key}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", carrier.color)}>
                <Truck className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium text-slate-900">{carrier.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          {([
            ["SHIPPING", `Đang giao (${shipping.length})`],
            ["DELIVERED", `Đã giao (${delivered.length})`],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition",
                tab === key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative max-w-md flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
              <th className="pb-3 pr-4 pl-4 pt-3">Mã đơn</th>
              <th className="pb-3 pr-4 pt-3">Khách hàng</th>
              <th className="pb-3 pr-4 pt-3">Địa chỉ giao</th>
              <th className="pb-3 pr-4 pt-3">Tổng tiền</th>
              <th className="pb-3 pr-4 pt-3">Ngày đặt</th>
              <th className="pb-3 pr-4 pt-3">Trạng thái</th>
              {tab === "SHIPPING" && <th className="pb-3 pr-4 pt-3"></th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr
                key={order.id}
                className="border-b border-slate-50 transition hover:bg-slate-50/50"
              >
                <td className="py-3 pr-4 pl-4">
                  <span className="font-mono text-xs text-blue-600">{order.orderCode}</span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-bold text-blue-700">
                      {(order.customerName || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{order.customerName || "—"}</p>
                      <p className="text-xs text-slate-400">{order.customerPhone || ""}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-slate-600 max-w-[240px]">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{order.customerAddress || "Chưa có địa chỉ"}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  {formatCurrency(order.totalAmount)}
                </td>
                <td className="py-3 pr-4 text-slate-500">{formatDate(order.createdAt)}</td>
                <td className="py-3 pr-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      tab === "SHIPPING" ? "text-blue-600 bg-blue-50" : "text-emerald-600 bg-emerald-50"
                    )}
                  >
                    {tab === "SHIPPING" ? "Đang vận chuyển" : "Đã giao"}
                  </span>
                </td>
                {tab === "SHIPPING" && (
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => markDelivered(order)}
                      disabled={busyId === order.id}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      {busyId === order.id ? "Đang lưu..." : "Đã giao xong"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="py-12 text-center text-sm text-slate-400">Đang tải...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            {tab === "SHIPPING"
              ? "Chưa có đơn nào đang giao — sang trang Đơn hàng chuyển một đơn về trạng thái \"Đang giao\" sẽ thấy nó ở đây"
              : "Chưa có đơn nào đã giao xong"}
          </div>
        )}
      </div>
    </div>
  );
}
