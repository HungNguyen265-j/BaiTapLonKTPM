"use client";

import { useState } from "react";
import { Plus, RefreshCw, Package, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";
import ImportInventoryModal from "@/components/inventory/ImportInventoryModal";

const mockInventory = [
  { id: "I001", name: "Áo thun nam cổ tròn", sku: "SP-001", warehouse: 120, shopee: 80, lazada: 25, tiki: 15, alert: 10, status: "ok" as const },
  { id: "I002", name: "Giày thể thao nữ", sku: "SP-002", warehouse: 0, shopee: 0, lazada: 0, tiki: 0, alert: 10, status: "out" as const },
  { id: "I003", name: "Túi xách da cao cấp", sku: "SP-003", warehouse: 5, shopee: 2, lazada: 3, tiki: 0, alert: 10, status: "low" as const },
  { id: "I004", name: "Điện thoại thông minh", sku: "SP-004", warehouse: 45, shopee: 20, lazada: 15, tiki: 10, alert: 5, status: "ok" as const },
  { id: "I005", name: "Đồng hồ nam thể thao", sku: "SP-006", warehouse: 2, shopee: 1, lazada: 1, tiki: 0, alert: 5, status: "low" as const },
];

export default function InventoryPage() {
  const [showImport, setShowImport] = useState(false);

  const lowCount = mockInventory.filter((i) => i.status === "low").length;
  const outCount = mockInventory.filter((i) => i.status === "out").length;
  const okCount = mockInventory.filter((i) => i.status === "ok").length;

  const totalStock = (item: typeof mockInventory[0]) =>
    item.warehouse + item.shopee + item.lazada + item.tiki;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý tồn kho</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi tình trạng hàng tồn kho
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nhập kho
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" />
            Đồng bộ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">Sắp hết hàng</p>
            <p className="text-xl font-bold text-amber-900">{lowCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-800">Hết hàng</p>
            <p className="text-xl font-bold text-red-900">{outCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-800">Bình thường</p>
            <p className="text-xl font-bold text-emerald-900">{okCount}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
              <th className="pb-3 pr-4 pl-4 pt-3">Sản phẩm</th>
              <th className="pb-3 pr-4 pt-3">Kho</th>
              <th className="pb-3 pr-4 pt-3">Shopee</th>
              <th className="pb-3 pr-4 pt-3">Lazada</th>
              <th className="pb-3 pr-4 pt-3">Tiki</th>
              <th className="pb-3 pr-4 pt-3">Tổng</th>
              <th className="pb-3 pr-4 pt-3">Mức cảnh báo</th>
              <th className="pb-3 pr-4 pt-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {mockInventory.map((item) => {
              const total = totalStock(item);
              const isOut = item.status === "out";
              const isLow = item.status === "low";

              return (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b border-slate-50 transition",
                    isOut && "bg-red-50/60",
                    isLow && "bg-amber-50/40"
                  )}
                >
                  <td className="py-3 pr-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-bold text-blue-700">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="font-mono text-xs text-slate-400">{item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        "font-medium",
                        item.warehouse === 0
                          ? "text-red-600"
                          : item.warehouse <= item.alert
                          ? "text-amber-600"
                          : "text-slate-900"
                      )}
                    >
                      {item.warehouse}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{item.shopee}</td>
                  <td className="py-3 pr-4 text-slate-700">{item.lazada}</td>
                  <td className="py-3 pr-4 text-slate-700">{item.tiki}</td>
                  <td className="py-3 pr-4 font-medium text-slate-900">{total}</td>
                  <td className="py-3 pr-4 text-slate-600">{item.alert}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showImport && <ImportInventoryModal onClose={() => setShowImport(false)} />}
    </div>
  );
}
