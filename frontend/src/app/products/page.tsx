"use client";

import { useState } from "react";
import { Search, Plus, Filter, RefreshCw, Eye, Edit2, Trash2 } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import ChannelTag from "@/components/common/ChannelTag";
import { formatCurrency } from "@/lib/utils";
import AddProductModal from "@/components/products/AddProductModal";

const mockProducts = [
  { id: "P001", name: "Áo thun nam cổ tròn", sku: "SP-001", price: 199000, stock: 120, category: "Thời trang", channels: ["shopee", "lazada", "tiki"], status: "active" as const },
  { id: "P002", name: "Giày thể thao nữ", sku: "SP-002", price: 459000, stock: 0, category: "Giày dép", channels: ["shopee", "tiki"], status: "out" as const },
  { id: "P003", name: "Túi xách da cao cấp", sku: "SP-003", price: 1250000, stock: 5, category: "Phụ kiện", channels: ["lazada", "website"], status: "low" as const },
  { id: "P004", name: "Điện thoại thông minh", sku: "SP-004", price: 8990000, stock: 45, category: "Điện tử", channels: ["shopee", "lazada", "tiki", "website"], status: "active" as const },
  { id: "P005", name: "Bộ chăn ga gối đệm", sku: "SP-005", price: 1890000, stock: 18, category: "Nhà cửa", channels: ["shopee", "tiki"], status: "active" as const },
  { id: "P006", name: "Đồng hồ nam thể thao", sku: "SP-006", price: 650000, stock: 2, category: "Phụ kiện", channels: ["shopee", "lazada", "website"], status: "low" as const },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng số {filtered.length} sản phẩm
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          <Filter className="h-4 w-4" />
          Lọc
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          <RefreshCw className="h-4 w-4" />
          Đồng bộ kênh
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
              <th className="pb-3 pr-4 pl-4 pt-3">Sản phẩm</th>
              <th className="pb-3 pr-4 pt-3">SKU</th>
              <th className="pb-3 pr-4 pt-3">Giá bán</th>
              <th className="pb-3 pr-4 pt-3">Tồn kho</th>
              <th className="pb-3 pr-4 pt-3">Kênh bán</th>
              <th className="pb-3 pr-4 pt-3">Trạng thái</th>
              <th className="pb-3 pr-4 pt-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr
                key={product.id}
                className="border-b border-slate-50 transition hover:bg-slate-50/50"
              >
                <td className="py-3 pr-4 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-bold text-blue-700">
                      {product.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.category}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-slate-500">
                  {product.sku}
                </td>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  {formatCurrency(product.price)}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`font-medium ${
                      product.stock === 0
                        ? "text-red-600"
                        : product.stock <= 5
                        ? "text-amber-600"
                        : "text-slate-900"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {product.channels.map((ch) => (
                      <ChannelTag key={ch} name={ch} />
                    ))}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={product.status} />
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-amber-600">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            Không tìm thấy sản phẩm phù hợp
          </div>
        )}
      </div>

      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
