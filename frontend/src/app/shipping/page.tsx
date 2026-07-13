"use client";

import { useState } from "react";
import { Search, Package, Truck } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

interface ShippingOrder {
  id: string;
  orderCode: string;
  customer: string;
  carrier: string;
  trackingCode: string;
  status: "pending" | "picked_up" | "in_transit" | "delivered" | "failed";
  from: string;
  to: string;
  eta: string;
}

const carriers = [
  { key: "ghn", label: "GHN", color: "bg-orange-500" },
  { key: "ghtk", label: "GHTK", color: "bg-green-500" },
  { key: "viettell", label: "Viettel Post", color: "bg-blue-600" },
  { key: "jtexpress", label: "J&T Express", color: "bg-red-500" },
  { key: "ninjavan", label: "Ninja Van", color: "bg-yellow-500" },
];

const mockShipping: ShippingOrder[] = [
  { id: "SHIP-001", orderCode: "ORD-001", customer: "Nguyễn Văn An", carrier: "GHN", trackingCode: "GHN123456789", status: "in_transit", from: "Hà Nội", to: "TP.HCM", eta: "2024-03-18" },
  { id: "SHIP-002", orderCode: "ORD-002", customer: "Trần Thị Bình", carrier: "GHTK", trackingCode: "GHTK987654321", status: "picked_up", from: "TP.HCM", to: "Đà Nẵng", eta: "2024-03-19" },
  { id: "SHIP-003", orderCode: "ORD-003", customer: "Lê Văn Cường", carrier: "Viettel Post", trackingCode: "VTP456789123", status: "delivered", from: "Đà Nẵng", to: "Hà Nội", eta: "2024-03-14" },
  { id: "SHIP-004", orderCode: "ORD-005", customer: "Hoàng Văn Em", carrier: "J&T Express", trackingCode: "JTE789123456", status: "pending", from: "TP.HCM", to: "Hà Nội", eta: "2024-03-20" },
  { id: "SHIP-005", orderCode: "ORD-006", customer: "Đỗ Thị Phương", carrier: "Ninja Van", trackingCode: "NJV321654987", status: "in_transit", from: "Huế", to: "Đà Nẵng", eta: "2024-03-17" },
  { id: "SHIP-006", orderCode: "ORD-007", customer: "Vũ Minh Tuấn", carrier: "GHN", trackingCode: "GHN654987321", status: "picked_up", from: "TP.HCM", to: "Hà Nội", eta: "2024-03-21" },
  { id: "SHIP-007", orderCode: "ORD-004", customer: "Phạm Thị Dung", carrier: "GHTK", trackingCode: "GHTK147258369", status: "delivered", from: "Hà Nội", to: "TP.HCM", eta: "2024-03-12" },
];

const statusColorMap: Record<string, string> = {
  in_transit: "text-blue-600 bg-blue-50",
  picked_up: "text-amber-600 bg-amber-50",
  delivered: "text-emerald-600 bg-emerald-50",
  pending: "text-slate-600 bg-slate-50",
};

export default function ShippingPage() {
  const [search, setSearch] = useState("");

  const filtered = mockShipping.filter(
    (s) =>
      s.trackingCode.toLowerCase().includes(search.toLowerCase()) ||
      s.orderCode.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.toLowerCase().includes(search.toLowerCase())
  );

  const carrierCounts = carriers.map((c) => ({
    ...c,
    count: mockShipping.filter((s) => s.carrier === c.key).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý vận chuyển</h1>
        <p className="mt-1 text-sm text-slate-500">Theo dõi đơn hàng vận chuyển</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {carrierCounts.map((carrier) => (
          <div
            key={carrier.key}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", carrier.color)}>
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{carrier.label}</p>
              <p className="text-xs text-slate-400">{carrier.count} đơn</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo mã vận đơn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
              <th className="pb-3 pr-4 pl-4 pt-3">Mã đơn</th>
              <th className="pb-3 pr-4 pt-3">Khách hàng</th>
              <th className="pb-3 pr-4 pt-3">Đơn vị VC</th>
              <th className="pb-3 pr-4 pt-3">Mã vận đơn</th>
              <th className="pb-3 pr-4 pt-3">Tuyến đường</th>
              <th className="pb-3 pr-4 pt-3">Dự kiến</th>
              <th className="pb-3 pr-4 pt-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ship) => (
              <tr
                key={ship.id}
                className="border-b border-slate-50 transition hover:bg-slate-50/50"
              >
                <td className="py-3 pr-4 pl-4">
                  <span className="font-mono text-xs text-blue-600">{ship.orderCode}</span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-bold text-blue-700">
                      {ship.customer.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-900">{ship.customer}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-700">{carriers.find((c) => c.key === ship.carrier)?.label ?? ship.carrier}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-slate-500">
                  {ship.trackingCode}
                </td>
                <td className="py-3 pr-4 text-slate-700">
                  {ship.from} <span className="text-slate-300">→</span> {ship.to}
                </td>
                <td className="py-3 pr-4 text-slate-500">
                  {ship.eta}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      statusColorMap[ship.status] ?? "text-slate-600 bg-slate-50"
                    )}
                  >
                    {ship.status === "in_transit" && "Đang vận chuyển"}
                    {ship.status === "picked_up" && "Đã lấy hàng"}
                    {ship.status === "delivered" && "Đã giao"}
                    {ship.status === "pending" && "Chờ lấy hàng"}
                    {ship.status === "failed" && "Thất bại"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            Không tìm thấy đơn vận chuyển phù hợp
          </div>
        )}
      </div>
    </div>
  );
}
