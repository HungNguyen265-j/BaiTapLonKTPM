"use client";

import { useState } from "react";
import { Search, Plus, Eye, Users, ShoppingBag, DollarSign, Award, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import TierBadge from "@/components/common/TierBadge";
import AddCustomerModal from "@/components/customers/AddCustomerModal";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  total: number;
  tier: string;
  lastOrder: string;
}

const mockCustomers: Customer[] = [
  { id: "KH-001", name: "Nguyễn Văn An", email: "an.nguyen@gmail.com", phone: "0912 345 678", orders: 24, total: 18500000, tier: "platinum", lastOrder: "28/06/2026" },
  { id: "KH-002", name: "Trần Thị Bích", email: "bich.tran@yahoo.com", phone: "0987 654 321", orders: 15, total: 9200000, tier: "gold", lastOrder: "25/06/2026" },
  { id: "KH-003", name: "Lê Hoàng Cường", email: "cuong.le@gmail.com", phone: "0936 123 456", orders: 8, total: 4100000, tier: "silver", lastOrder: "20/06/2026" },
  { id: "KH-004", name: "Phạm Minh Đức", email: "duc.pham@outlook.com", phone: "0978 456 789", orders: 3, total: 1250000, tier: "bronze", lastOrder: "15/06/2026" },
  { id: "KH-005", name: "Hoàng Thị Mai", email: "mai.hoang@gmail.com", phone: "0909 888 777", orders: 31, total: 25600000, tier: "platinum", lastOrder: "29/06/2026" },
  { id: "KH-006", name: "Đặng Văn Hùng", email: "hung.dang@yahoo.com", phone: "0911 222 333", orders: 6, total: 3800000, tier: "silver", lastOrder: "18/06/2026" },
];

const tierStats = [
  { tier: "platinum", count: 8, borderColor: "border-purple-500", bgColor: "bg-purple-50", iconColor: "text-purple-600" },
  { tier: "gold", count: 24, borderColor: "border-amber-500", bgColor: "bg-amber-50", iconColor: "text-amber-600" },
  { tier: "silver", count: 67, borderColor: "border-slate-400", bgColor: "bg-slate-50", iconColor: "text-slate-500" },
  { tier: "bronze", count: 35, borderColor: "border-orange-500", bgColor: "bg-orange-50", iconColor: "text-orange-600" },
];

const tierLabels: Record<string, string> = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = mockCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CRM Khách hàng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng số {mockCustomers.length} khách hàng
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Thêm khách hàng
        </button>
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
                  {tierLabels[t.tier]}
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
          placeholder="Tìm kiếm theo tên, số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
              <th className="pb-3 pr-4 pl-4 pt-3">Khách hàng</th>
              <th className="pb-3 pr-4 pt-3">Liên hệ</th>
              <th className="pb-3 pr-4 pt-3">Đơn hàng</th>
              <th className="pb-3 pr-4 pt-3">Tổng chi tiêu</th>
              <th className="pb-3 pr-4 pt-3">Hạng</th>
              <th className="pb-3 pr-4 pt-3">Mua lần cuối</th>
              <th className="pb-3 pr-4 pt-3"></th>
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
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{customer.name}</p>
                      <p className="text-xs text-slate-400">{customer.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div>
                    <p className="text-slate-700">{customer.phone}</p>
                    <p className="text-xs text-slate-400">{customer.email}</p>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-900">{customer.orders}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  {formatCurrency(customer.total)}
                </td>
                <td className="py-3 pr-4">
                  <TierBadge tier={customer.tier} />
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs">{customer.lastOrder}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            Không tìm thấy khách hàng phù hợp
          </div>
        )}
      </div>

      {showAdd && <AddCustomerModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
