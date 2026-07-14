"use client";

import { useCallback, useEffect, useState } from "react";
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
  ShoppingCart,
  Users,
  ShoppingBag,
  ChevronRight,
  Calendar,
  Wallet,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { apiGet, ApiError, type PageResponse } from "@/lib/api";
import {
  loadDashboardData,
  mergeWebsiteChannels,
  channelColors,
  channelLabels,
  todayIso,
  type DashboardData,
  type OrderLite,
} from "@/lib/reportData";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import ChannelTag from "@/components/common/ChannelTag";

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

function rangeStart(days: string): string {
  if (days === "year") return `${new Date().getFullYear()}-01-01`;
  const d = new Date();
  d.setDate(d.getDate() - Number(days));
  return d.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [dateFilter, setDateFilter] = useState("year");
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboard, ordersPage] = await Promise.all([
        loadDashboardData(rangeStart(dateFilter), todayIso()),
        apiGet<PageResponse<OrderLite>>("/orders/search?page=0&size=5"),
      ]);
      setData(dashboard);
      setRecentOrders(ordersPage.content ?? []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được dữ liệu tổng quan");
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const byChannel = mergeWebsiteChannels(data?.revenueByChannel ?? {});
  const channelTotal = Object.values(byChannel).reduce((a, b) => a + b, 0);
  const channelData = Object.entries(byChannel)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      name: key,
      label: channelLabels[key] ?? key,
      value,
      percentage: channelTotal > 0 ? Math.round((value / channelTotal) * 100) : 0,
      color: channelColors[key] ?? "#94A3B8",
    }));

  const revenueSeries = Object.entries(data?.revenueByDay ?? {})
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, value]) => {
      const [, m, d] = day.split("-");
      return { date: `${d}/${m}`, value };
    });

  const avgOrder =
    data && data.totalOrders > 0 ? Math.round(data.totalRevenue / data.totalOrders) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data?.source === "report-service"
              ? "Số liệu tổng hợp bởi report-service"
              : data
              ? "Số liệu tính trực tiếp từ API đơn hàng (report-service tắt)"
              : "Đang tải số liệu..."}
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
              <option value="year">Năm nay</option>
            </select>
            <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-slate-400" />
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Tải lại
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Doanh thu"
          value={data?.totalRevenue ?? 0}
          icon={ShoppingBag}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          label="Đơn hàng"
          value={`${data?.totalOrders ?? 0} đơn`}
          icon={ShoppingCart}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          label="Khách hàng"
          value={`${data?.totalCustomers ?? 0} khách`}
          icon={Users}
          color="bg-gradient-to-br from-violet-500 to-violet-600"
        />
        <StatCard
          label="Giá trị TB/đơn"
          value={avgOrder}
          icon={Wallet}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        {/* Revenue chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-4">
          <h3 className="mb-1 text-base font-semibold text-slate-900">Doanh thu theo ngày</h3>
          <p className="mb-4 text-xs text-slate-400">
            Các ngày có phát sinh đơn hàng trong khoảng đã chọn
          </p>
          <div className="h-[220px] w-full">
            {revenueSeries.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                {loading ? "Đang tải..." : "Chưa có đơn hàng trong khoảng này"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
                    tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}tr`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#gradRevenue)"
                    name="Doanh thu"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Channel distribution pie */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <h3 className="mb-1 text-base font-semibold text-slate-900">Phân bổ doanh thu</h3>
          <p className="mb-4 text-xs text-slate-400">Theo kênh bán hàng</p>
          <div className="flex h-[200px] items-center justify-center">
            {channelData.length === 0 ? (
              <span className="text-sm text-slate-400">
                {loading ? "Đang tải..." : "Chưa có dữ liệu"}
              </span>
            ) : (
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
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend */}
          <div className="mt-3 space-y-2">
            {channelData.map((ch) => (
              <div key={ch.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: ch.color }}
                  />
                  <span className="text-slate-600">{ch.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-900">{formatCurrency(ch.value)}</span>
                  <span className="text-xs text-slate-400">{ch.percentage}%</span>
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
            <h3 className="text-base font-semibold text-slate-900">Đơn hàng gần đây</h3>
            <p className="text-xs text-slate-400">5 đơn hàng mới nhất</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
                <th className="pb-3 pr-4">Khách hàng</th>
                <th className="pb-3 pr-4">Mã đơn</th>
                <th className="pb-3 pr-4">Kênh</th>
                <th className="pb-3 pr-4">Tổng tiền</th>
                <th className="pb-3 pr-4">Trạng thái</th>
                <th className="pb-3">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-50 transition hover:bg-slate-50/50"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-semibold text-blue-700">
                        {(order.customerName || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-700">
                        {order.customerName || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-500">
                    {order.orderCode}
                  </td>
                  <td className="py-3 pr-4">
                    <ChannelTag name={order.source ?? ""} />
                  </td>
                  <td className="py-3 pr-4 font-medium text-slate-900">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={(order.status ?? "").toLowerCase()} />
                  </td>
                  <td className="py-3 text-xs text-slate-400">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && recentOrders.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">Chưa có đơn hàng nào</div>
          )}
        </div>
      </div>
    </div>
  );
}
