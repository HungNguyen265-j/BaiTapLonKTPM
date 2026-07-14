"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, FileSpreadsheet, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import {
  loadDashboardData,
  fetchOrdersInRange,
  mergeWebsiteChannels,
  channelColors,
  channelLabels,
  todayIso,
  type DashboardData,
  type OrderLite,
} from "@/lib/reportData";
import ExportExcelModal from "@/components/reports/ExportExcelModal";

interface MonthRow {
  month: string; // "T2"
  revenue: number;
  orders: number;
  avgOrder: number;
  growth: number | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-xs font-medium text-slate-500">Tháng {String(label).replace("T", "")}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showExport, setShowExport] = useState(false);

  const year = new Date().getFullYear();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const start = `${year}-01-01`;
      const end = todayIso();
      const [dashboard, orderList] = await Promise.all([
        loadDashboardData(start, end),
        fetchOrdersInRange(start, end),
      ]);
      setData(dashboard);
      setOrders(orderList);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  // Gom đơn hợp lệ theo tháng cho biểu đồ + bảng chi tiết
  const validOrders = orders.filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED");
  const byMonth = new Map<number, { revenue: number; orders: number }>();
  for (const o of validOrders) {
    const created = new Date(o.createdAt);
    if (isNaN(created.getTime())) continue;
    const m = created.getMonth() + 1;
    const cur = byMonth.get(m) ?? { revenue: 0, orders: 0 };
    cur.revenue += o.totalAmount ?? 0;
    cur.orders += 1;
    byMonth.set(m, cur);
  }
  const monthRows: MonthRow[] = Array.from(byMonth.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([m, v], idx, arr) => {
      const prev = idx > 0 ? arr[idx - 1][1] : null;
      return {
        month: `T${m}`,
        revenue: v.revenue,
        orders: v.orders,
        avgOrder: v.orders > 0 ? v.revenue / v.orders : 0,
        growth: prev && prev.revenue > 0 ? ((v.revenue - prev.revenue) / prev.revenue) * 100 : null,
      };
    });

  const byChannel = mergeWebsiteChannels(data?.revenueByChannel ?? {});
  const channelTotal = Object.values(byChannel).reduce((a, b) => a + b, 0);
  const topChannels = Object.entries(byChannel)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      key,
      name: channelLabels[key] ?? key,
      revenue: value,
      percentage: channelTotal > 0 ? Math.round((value / channelTotal) * 100) : 0,
      color: channelColors[key] ?? "#94A3B8",
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo doanh thu</h1>
          <p className="mt-1 text-sm text-slate-500">
            Năm {year} ·{" "}
            {data?.source === "report-service"
              ? "tổng hợp bởi report-service"
              : data
              ? "tính trực tiếp từ API đơn hàng"
              : "đang tải..."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Tải lại
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tổng quan nhanh */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Tổng doanh thu</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">
            {formatCurrency(data?.totalRevenue ?? 0)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Không tính đơn đã hủy</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Tổng đơn hàng</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{data?.totalOrders ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">Từ đầu năm đến nay</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Giá trị trung bình/đơn</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">
            {formatCurrency(
              data && data.totalOrders > 0
                ? Math.round(data.totalRevenue / data.totalOrders)
                : 0
            )}
          </p>
          <p className="mt-1 text-xs text-slate-400">Doanh thu chia số đơn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        {/* Bar chart theo tháng */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-4">
          <h3 className="mb-1 text-base font-semibold text-slate-900">Doanh thu theo tháng</h3>
          <p className="mb-4 text-xs text-slate-400">Các tháng có phát sinh đơn hàng</p>
          <div className="h-[240px] w-full">
            {monthRows.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                {loading ? "Đang tải..." : "Chưa có dữ liệu"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="month"
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
                  <Bar dataKey="revenue" name="Doanh thu" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Doanh thu theo kênh */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <h3 className="mb-1 text-base font-semibold text-slate-900">Doanh thu theo kênh</h3>
          <p className="mb-4 text-xs text-slate-400">Tỷ trọng từng kênh bán hàng</p>
          <div className="space-y-4">
            {topChannels.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">
                {loading ? "Đang tải..." : "Chưa có dữ liệu"}
              </p>
            )}
            {topChannels.map((ch) => (
              <div key={ch.key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{ch.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-900">{formatCurrency(ch.revenue)}</span>
                    <span className="w-9 text-right text-xs text-slate-400">{ch.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${ch.percentage}%`, backgroundColor: ch.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bảng chi tiết theo tháng */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5 pb-4">
          <h3 className="text-base font-semibold text-slate-900">Chi tiết theo tháng</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
              <th className="pb-3 pl-5 pr-4 pt-3">Tháng</th>
              <th className="pb-3 pr-4 pt-3">Doanh thu</th>
              <th className="pb-3 pr-4 pt-3">Số đơn</th>
              <th className="pb-3 pr-4 pt-3">TB/đơn</th>
              <th className="pb-3 pr-4 pt-3">Tăng trưởng</th>
            </tr>
          </thead>
          <tbody>
            {monthRows.map((row) => (
              <tr key={row.month} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                <td className="py-3 pl-5 pr-4 font-medium text-slate-900">
                  Tháng {row.month.replace("T", "")}
                </td>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  {formatCurrency(row.revenue)}
                </td>
                <td className="py-3 pr-4 text-slate-600">{row.orders}</td>
                <td className="py-3 pr-4 text-slate-600">{formatCurrency(Math.round(row.avgOrder))}</td>
                <td className="py-3 pr-4">
                  {row.growth === null ? (
                    <span className="text-xs text-slate-400">—</span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        row.growth >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {row.growth >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {row.growth >= 0 ? "+" : ""}
                      {row.growth.toFixed(1)}%
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && monthRows.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-400">Chưa có đơn hàng nào trong năm</div>
        )}
      </div>

      {showExport && <ExportExcelModal onClose={() => setShowExport(false)} />}
    </div>
  );
}
