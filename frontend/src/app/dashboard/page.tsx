"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShoppingCart,
  Users,
  ShoppingBag,
  ChevronRight,
  Download,
  Calendar,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import ChannelTag from "@/components/common/ChannelTag";

const revenueData = [
  { date: "01/06", shopee: 18_500_000, lazada: 12_300_000, tiki: 8_200_000 },
  { date: "04/06", shopee: 22_100_000, lazada: 14_800_000, tiki: 9_500_000 },
  { date: "07/06", shopee: 19_800_000, lazada: 11_200_000, tiki: 7_800_000 },
  { date: "10/06", shopee: 25_400_000, lazada: 16_500_000, tiki: 10_100_000 },
  { date: "13/06", shopee: 21_200_000, lazada: 13_900_000, tiki: 8_900_000 },
  { date: "16/06", shopee: 27_600_000, lazada: 18_100_000, tiki: 11_300_000 },
  { date: "19/06", shopee: 23_500_000, lazada: 15_400_000, tiki: 9_700_000 },
  { date: "22/06", shopee: 29_100_000, lazada: 19_700_000, tiki: 12_400_000 },
  { date: "25/06", shopee: 26_800_000, lazada: 17_300_000, tiki: 10_800_000 },
];

const channelData = [
  { name: "shopee", label: "Shopee", value: 48_500_000, percentage: 42, color: "#EE4D2D" },
  { name: "lazada", label: "Lazada", value: 32_100_000, percentage: 28, color: "#7B2FF7" },
  { name: "tiki", label: "Tiki", value: 20_400_000, percentage: 18, color: "#1A94FF" },
  { name: "website", label: "Website", value: 13_800_000, percentage: 12, color: "#10B981" },
];

const orders = [
  { id: "ORD-001", customer: "Nguyễn Văn An", channel: "shopee", total: 1_280_000, status: "delivered" as const, date: "25/06 14:30", items: 3 },
  { id: "ORD-002", customer: "Trần Thị Bích", channel: "lazada", total: 2_450_000, status: "shipped" as const, date: "25/06 12:15", items: 2 },
  { id: "ORD-003", customer: "Lê Hoàng Cường", channel: "tiki", total: 890_000, status: "delivered" as const, date: "25/06 10:45", items: 1 },
  { id: "ORD-004", customer: "Phạm Minh Đức", channel: "shopee", total: 3_620_000, status: "pending" as const, date: "25/06 09:20", items: 5 },
  { id: "ORD-005", customer: "Hoàng Thị Hoa", channel: "website", total: 560_000, status: "cancelled" as const, date: "24/06 22:10", items: 1 },
  { id: "ORD-006", customer: "Đặng Văn Long", channel: "lazada", total: 1_750_000, status: "delivered" as const, date: "24/06 18:35", items: 2 },
  { id: "ORD-007", customer: "Vũ Thị Mai", channel: "shopee", total: 4_100_000, status: "processing" as const, date: "24/06 16:50", items: 4 },
];

const recentOrders = orders.slice(0, 5);

const avatars = ["A", "B", "C", "D", "E", "F", "G"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [dateFilter, setDateFilter] = useState("7");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng quan tình hình kinh doanh hôm nay
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="7">7 ngày qua</option>
              <option value="30">30 ngày qua</option>
              <option value="90">Quý này</option>
              <option value="365">Năm nay</option>
            </select>
            <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-slate-400" />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Doanh thu hôm nay"
          value={48_200_000}
          sub="+12,4% so với hôm qua"
          trend="up"
          icon={ShoppingBag}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          label="Đơn hàng mới"
          value={134}
          sub="+8,1% so với hôm qua"
          trend="up"
          icon={ShoppingCart}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          label="Sản phẩm sắp hết"
          value={8}
          sub="Cần nhập hàng gấp"
          trend="down"
          icon={AlertTriangle}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
        />
        <StatCard
          label="Khách hàng mới"
          value={23}
          sub="-3,2% so với hôm qua"
          trend="down"
          icon={Users}
          color="bg-gradient-to-br from-violet-500 to-violet-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        {/* Revenue chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-4">
          <h3 className="mb-1 text-base font-semibold text-slate-900">
            Doanh thu theo kênh
          </h3>
          <p className="mb-4 text-xs text-slate-400">
            Biểu đồ doanh thu 9 ngày gần nhất
          </p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="gradShopee" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EE4D2D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EE4D2D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLazada" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B2FF7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7B2FF7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradTiki" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A94FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1A94FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="shopee"
                  stroke="#EE4D2D"
                  strokeWidth={2}
                  fill="url(#gradShopee)"
                  name="Shopee"
                />
                <Area
                  type="monotone"
                  dataKey="lazada"
                  stroke="#7B2FF7"
                  strokeWidth={2}
                  fill="url(#gradLazada)"
                  name="Lazada"
                />
                <Area
                  type="monotone"
                  dataKey="tiki"
                  stroke="#1A94FF"
                  strokeWidth={2}
                  fill="url(#gradTiki)"
                  name="Tiki"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel distribution pie */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <h3 className="mb-1 text-base font-semibold text-slate-900">
            Phân bổ doanh thu
          </h3>
          <p className="mb-4 text-xs text-slate-400">
            Theo kênh bán hàng
          </p>
          <div className="flex h-[200px] items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {channelData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-3 space-y-2">
            {channelData.map((ch) => (
              <div
                key={ch.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: ch.color }}
                  />
                  <span className="text-slate-600">{ch.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-900">
                    {formatCurrency(ch.value)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {ch.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Đơn hàng gần đây
            </h3>
            <p className="text-xs text-slate-400">
              5 đơn hàng mới nhất
            </p>
          </div>
          <button className="flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700">
            Xem tất cả
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
                <th className="pb-3 pr-4">Khách hàng</th>
                <th className="pb-3 pr-4">Mã đơn</th>
                <th className="pb-3 pr-4">Kênh</th>
                <th className="pb-3 pr-4">Số lượng</th>
                <th className="pb-3 pr-4">Tổng tiền</th>
                <th className="pb-3 pr-4">Trạng thái</th>
                <th className="pb-3">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, idx) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-50 transition hover:bg-slate-50/50"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-semibold text-blue-700">
                        {avatars[idx]}
                      </div>
                      <span className="font-medium text-slate-700">
                        {order.customer}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-500">
                    {order.id}
                  </td>
                  <td className="py-3 pr-4">
                    <ChannelTag name={order.channel} />
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {order.items}
                  </td>
                  <td className="py-3 pr-4 font-medium text-slate-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-xs text-slate-400">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
