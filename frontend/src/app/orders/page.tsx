"use client";

import { useState } from "react";
import { Plus, Eye } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import ChannelTag from "@/components/common/ChannelTag";
import { formatCurrency } from "@/lib/utils";
import type { Order } from "@/types";
import CreateOrderModal from "@/components/orders/CreateOrderModal";
import OrderDetailPanel from "@/components/orders/OrderDetailPanel";

interface OrderItem extends Order {
  customerPhone: string;
  customerAddress: string;
}

const mockOrders: OrderItem[] = [
  { id: "ORD-001", code: "ORD-001", customer: "Nguyễn Văn An", customerPhone: "0987654321", customerAddress: "123 Đường Láng, Đống Đa, Hà Nội", channel: "shopee", items: 3, total: 1290000, status: "pending", createdAt: "2024-03-15T10:30:00Z", paymentMethod: "COD" },
  { id: "ORD-002", code: "ORD-002", customer: "Trần Thị Bình", customerPhone: "0978123456", customerAddress: "456 Nguyễn Huệ, Quận 1, TP.HCM", channel: "lazada", items: 1, total: 459000, status: "shipped", createdAt: "2024-03-14T14:20:00Z", paymentMethod: "Banking" },
  { id: "ORD-003", code: "ORD-003", customer: "Lê Văn Cường", customerPhone: "0966333444", customerAddress: "789 Trần Phú, Hải Châu, Đà Nẵng", channel: "tiki", items: 5, total: 2450000, status: "delivered", createdAt: "2024-03-12T08:15:00Z", paymentMethod: "COD" },
  { id: "ORD-004", code: "ORD-004", customer: "Phạm Thị Dung", customerPhone: "0911222333", customerAddress: "321 Lê Duẩn, Ba Đình, Hà Nội", channel: "shopee", items: 2, total: 890000, status: "cancelled", createdAt: "2024-03-11T16:45:00Z", paymentMethod: "Momo" },
  { id: "ORD-005", code: "ORD-005", customer: "Hoàng Văn Em", customerPhone: "0933444555", customerAddress: "654 Nguyễn Văn Linh, Q.7, TP.HCM", channel: "website", items: 7, total: 3670000, status: "pending", createdAt: "2024-03-10T09:00:00Z", paymentMethod: "Banking" },
  { id: "ORD-006", code: "ORD-006", customer: "Đỗ Thị Phương", customerPhone: "0944555666", customerAddress: "987 Hoàng Diệu, Thuận Hóa, Huế", channel: "lazada", items: 1, total: 1250000, status: "shipped", createdAt: "2024-03-09T11:30:00Z", paymentMethod: "COD" },
  { id: "ORD-007", code: "ORD-007", customer: "Vũ Minh Tuấn", customerPhone: "0955666777", customerAddress: "147 Lê Văn Sỹ, Phú Nhuận, TP.HCM", channel: "shopee", items: 4, total: 2180000, status: "pending", createdAt: "2024-03-08T13:25:00Z", paymentMethod: "Visa" },
];

const tabs = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xử lý" },
  { key: "shipped", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
  { key: "cancelled", label: "Đã hủy" },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const tabCounts = tabs.reduce(
    (acc, t) => {
      acc[t.key] = t.key === "all" ? mockOrders.length : mockOrders.filter((o) => o.status === t.key).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const filtered = activeTab === "all" ? mockOrders : mockOrders.filter((o) => o.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý đơn hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Tổng số {mockOrders.length} đơn hàng</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Tạo đơn thủ công
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
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
            <span
              className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                activeTab === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
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
              <th className="pb-3 pr-4 pt-3">Kênh</th>
              <th className="pb-3 pr-4 pt-3">Ngày đặt</th>
              <th className="pb-3 pr-4 pt-3">Sản phẩm</th>
              <th className="pb-3 pr-4 pt-3 text-right">Tổng tiền</th>
              <th className="pb-3 pr-4 pt-3">Trạng thái</th>
              <th className="pb-3 pr-4 pt-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr
                key={order.id}
                className="border-b border-slate-50 transition hover:bg-slate-50/50"
              >
                <td className="py-3 pr-4 pl-4">
                  <span className="font-mono text-xs text-blue-600">{order.code}</span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-bold text-blue-700">
                      {order.customer.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-900">{order.customer}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <ChannelTag name={order.channel} />
                </td>
                <td className="py-3 pr-4 text-slate-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : ""}
                </td>
                <td className="py-3 pr-4 text-slate-700">{order.items} SP</td>
                <td className="py-3 pr-4 text-right font-medium text-slate-900">
                  {formatCurrency(order.total)}
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            Không tìm thấy đơn hàng phù hợp
          </div>
        )}
      </div>

      {showCreateModal && <CreateOrderModal onClose={() => setShowCreateModal(false)} />}
      {selectedOrder && (
        <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
