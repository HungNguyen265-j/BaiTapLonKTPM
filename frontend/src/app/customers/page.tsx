"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Plus, Users, ShoppingBag, Award, Calendar, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { apiGet, ApiError, type PageResponse } from "@/lib/api";
import TierBadge from "@/components/common/TierBadge";
import AddCustomerModal from "@/components/customers/AddCustomerModal";

interface CustomerDto {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  tier: string;
  totalOrders: number;
  totalSpent: number;
  source: string;
  status: string;
  createdAt: string;
}

const tierMeta = [
  { tier: "PLATINUM", borderColor: "border-purple-500", bgColor: "bg-purple-50", iconColor: "text-purple-600" },
  { tier: "GOLD", borderColor: "border-amber-500", bgColor: "bg-amber-50", iconColor: "text-amber-600" },
  { tier: "SILVER", borderColor: "border-slate-400", bgColor: "bg-slate-50", iconColor: "text-slate-500" },
  { tier: "BRONZE", borderColor: "border-orange-500", bgColor: "bg-orange-50", iconColor: "text-orange-600" },
];

const sourceLabels: Record<string, string> = {
  MANUAL: "Thủ công",
  SHOPEE: "Shopee",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  API: "Website",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("vi-VN");
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<PageResponse<CustomerDto>>("/customers/search?page=0&size=100");
      setCustomers(res.content);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const q = search.toLowerCase();
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.phone ?? "").includes(search) ||
      (c.email ?? "").toLowerCase().includes(q)
  );

  const tierStats = tierMeta.map((t) => ({
    ...t,
    count: customers.filter((c) => c.tier === t.tier).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CRM Khách hàng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng số {customers.length} khách hàng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Tải lại
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm khách hàng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {tierStats.map((t) => (
          <div
            key={t.tier}
            className={`rounded-xl border-l-4 ${t.borderColor} ${t.bgColor} bg-white p-4`}
          >
            <div className="flex items-center gap-3">
              <Award className={`h-8 w-8 ${t.iconColor}`} />
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {t.tier.charAt(0) + t.tier.slice(1).toLowerCase()}
                </p>
                <p className="text-xl font-bold text-slate-900">{t.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, số điện thoại, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
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
              <th className="pb-3 pr-4 pl-4 pt-3">Khách hàng</th>
              <th className="pb-3 pr-4 pt-3">Liên hệ</th>
              <th className="pb-3 pr-4 pt-3">Đơn hàng</th>
              <th className="pb-3 pr-4 pt-3">Tổng chi tiêu</th>
              <th className="pb-3 pr-4 pt-3">Hạng</th>
              <th className="pb-3 pr-4 pt-3">Nguồn</th>
              <th className="pb-3 pr-4 pt-3">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-slate-50 transition hover:bg-slate-50/50"
              >
                <td className="py-3 pr-4 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-bold text-blue-700">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{customer.name}</p>
                      <p className="text-xs text-slate-400">{customer.code}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div>
                    <p className="text-slate-700">{customer.phone || "—"}</p>
                    <p className="text-xs text-slate-400">{customer.email || "—"}</p>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-900">{customer.totalOrders}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  {formatCurrency(customer.totalSpent)}
                </td>
                <td className="py-3 pr-4">
                  <TierBadge tier={customer.tier} />
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {sourceLabels[customer.source] ?? customer.source}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs">{formatDate(customer.createdAt)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
            <Users className="h-4 w-4 animate-pulse" />
            Đang tải danh sách khách hàng...
          </div>
        )}
        {!loading && filtered.length === 0 && !error && (
          <div className="py-12 text-center text-sm text-slate-400">
            Không tìm thấy khách hàng phù hợp
          </div>
        )}
      </div>

      {showAdd && (
        <AddCustomerModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </div>
  );
}
