"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  FileSpreadsheet,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils";
import StatCard from "@/components/common/StatCard";
import ExportExcelModal from "@/components/reports/ExportExcelModal";

const monthlyData = [
  { month: "T1", revenue: 118_000_000, orders: 420 },
  { month: "T2", revenue: 125_000_000, orders: 445 },
  { month: "T3", revenue: 132_000_000, orders: 468 },
  { month: "T4", revenue: 128_000_000, orders: 452 },
  { month: "T5", revenue: 142_000_000, orders: 498 },
  { month: "T6", revenue: 156_000_000, orders: 540 },
];

const topChannels = [
  { name: "Shopee", percentage: 52, revenue: 396_240_000, color: "bg-red-500" },
  { name: "Lazada", percentage: 28, revenue: 213_360_000, color: "bg-amber-500" },
  { name: "Tiki", percentage: 13, revenue: 99_060_000, color: "bg-blue-500" },
  { name: "Website", percentage: 7, revenue: 53_340_000, color: "bg-purple-500" },
];

const detailRows = monthlyData.map((d, i) => {
  const prev = monthlyData[i - 1];
  const growth = prev ? ((d.revenue - prev.revenue) / prev.revenue) * 100 : null;
  return {
    ...d,
    avgOrder: d.revenue / d.orders,
    growth,
  };
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-xs font-medium text-slate-500">Tháng {label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.name === "Doanh thu" ? formatCurrency(entry.value) : `${entry.value} đơn`}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [year, setYear] = useState("2026");
  const [showExport, setShowExport] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo doanh thu</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng quan doanh thu 6 tháng đầu năm
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-slate-400" />
          </div>
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Doanh thu năm"
          value={762_000_000}
          sub="+18,2% so với năm trước"
          trend="up"
          icon={TrendingUp}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          label="Tổng đơn hàng"
          value={2700}
          sub="+12,5% so với năm trước"
          trend="up"
          icon={ShoppingCart}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          label="Giá trị TB/đơn"
          value={282_000}
          sub="+4,1% so với năm trước"
          trend="up"
          icon={TrendingUp}
          color="bg-gradient-to-br from-violet-500 to-violet-600"
        />
        <StatCard
          label="Tỷ lệ hủy đơn"
          value="3,2%"
          sub="-1,4% so với năm trước"
          trend="down"
          icon={TrendingDown}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-4">
          <h3 className="mb-1 text-base font-semibold text-slate-900">
            Doanh thu theo tháng
          </h3>
          <p className="mb-4 text-xs text-slate-400">
            Biểu đồ doanh thu 6 tháng đầu năm {year}
          </p>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
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
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="revenue"
                  name="Doanh thu"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <h3 className="mb-1 text-base font-semibold text-slate-900">
            Top kênh bán
          </h3>
          <p className="mb-4 text-xs text-slate-400">
            Phân bổ doanh thu theo kênh
          </p>
          <div className="space-y-5">
            {topChannels.map((ch) => (
              <div key={ch.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{ch.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{ch.percentage}%</span>
                    <span className="text-xs text-slate-400">
                      {formatCompactCurrency(ch.revenue)}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${ch.color} transition-all`}
                    style={{ width: `${ch.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-1 text-base font-semibold text-slate-900">
          Chi tiết doanh thu
        </h3>
        <p className="mb-4 text-xs text-slate-400">
          Bảng chi tiết doanh thu theo tháng
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
                <th className="pb-3 pr-4">Tháng</th>
                <th className="pb-3 pr-4">Doanh thu</th>
                <th className="pb-3 pr-4">Đơn hàng</th>
                <th className="pb-3 pr-4">TB/đơn</th>
                <th className="pb-3">Tăng trưởng</th>
              </tr>
            </thead>
            <tbody>
              {detailRows.map((row) => (
                <tr
                  key={row.month}
                  className="border-b border-slate-50 transition hover:bg-slate-50/50"
                >
                  <td className="py-3 pr-4 font-medium text-slate-900">
                    Tháng {row.month}
                  </td>
                  <td className="py-3 pr-4 font-medium text-slate-900">
                    {formatCurrency(row.revenue)}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{row.orders}</td>
                  <td className="py-3 pr-4 text-slate-600">
                    {formatCompactCurrency(row.avgOrder)}
                  </td>
                  <td className="py-3">
                    {row.growth !== null ? (
                      <div className="flex items-center gap-1">
                        {row.growth >= 0 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            row.growth >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {row.growth >= 0 ? "+" : ""}
                          {row.growth.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showExport && <ExportExcelModal onClose={() => setShowExport(false)} />}
    </div>
  );
}
