"use client";

import { useState } from "react";
import { X, Plus, Minus, Search, Trash2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import ChannelTag from "@/components/common/ChannelTag";
import type { Product } from "@/types";

interface CreateOrderModalProps {
  onClose: () => void;
}

interface SelectedProduct extends Product {
  quantity: number;
}

const channelOptions = [
  { key: "shopee", label: "Shopee" },
  { key: "lazada", label: "Lazada" },
  { key: "tiki", label: "Tiki" },
  { key: "website", label: "Website" },
];

const availableProducts: Product[] = [
  { id: "P001", name: "Áo thun nam cổ tròn", sku: "SP-001", price: 199000, stock: 120, category: "Thời trang", channels: ["Shopee", "Lazada"], status: "active" },
  { id: "P002", name: "Giày thể thao nữ", sku: "SP-002", price: 459000, stock: 50, category: "Giày dép", channels: ["Shopee"], status: "active" },
  { id: "P003", name: "Túi xách da cao cấp", sku: "SP-003", price: 1250000, stock: 5, category: "Phụ kiện", channels: ["Tiki"], status: "active" },
  { id: "P004", name: "Điện thoại thông minh", sku: "SP-004", price: 8990000, stock: 45, category: "Điện tử", channels: ["Lazada"], status: "active" },
  { id: "P005", name: "Bộ chăn ga gối đệm", sku: "SP-005", price: 1890000, stock: 18, category: "Nhà cửa", channels: ["Website"], status: "active" },
  { id: "P006", name: "Đồng hồ nam thể thao", sku: "SP-006", price: 650000, stock: 10, category: "Phụ kiện", channels: ["Shopee", "Tiki"], status: "active" },
  { id: "P007", name: "Quần jean nam", sku: "SP-007", price: 350000, stock: 30, category: "Thời trang", channels: ["Shopee", "Lazada"], status: "active" },
  { id: "P008", name: "Váy nữ công sở", sku: "SP-008", price: 520000, stock: 15, category: "Thời trang", channels: ["Lazada", "Tiki"], status: "active" },
];

export default function CreateOrderModal({ onClose }: CreateOrderModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SelectedProduct[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [channel, setChannel] = useState("shopee");
  const [address, setAddress] = useState("");

  const filteredProducts = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addProduct = (product: Product) => {
    setSelected((prev) => {
      const exist = prev.find((p) => p.id === product.id);
      if (exist) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setSelected((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p))
        .filter((p) => p.quantity > 0)
    );
  };

  const removeProduct = (id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  const totalPrice = selected.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const handleCreate = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Tạo đơn hàng thủ công</h2>
            <p className="mt-1 text-sm text-slate-400">
              Bước {step} / 2 {step === 1 ? "• Chọn sản phẩm" : "• Thông tin khách hàng"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-bold text-blue-700">
                      {product.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.sku} • {formatCurrency(product.price)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addProduct(product)}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3" />
                    Thêm
                  </button>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-400">Không tìm thấy sản phẩm</p>
              )}
            </div>

            {selected.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Sản phẩm đã chọn ({selected.length})
                </p>
                <div className="space-y-2">
                  {selected.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-400">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-500 transition hover:bg-slate-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-500 transition hover:bg-slate-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="w-24 text-right font-medium text-slate-900">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeProduct(item.id)}
                          className="rounded p-1 text-slate-400 transition hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-sm font-semibold text-slate-700">Tổng cộng</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Tên khách hàng</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Nhập tên khách hàng"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Kênh</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {channelOptions.map((ch) => (
                    <option key={ch.key} value={ch.key}>
                      {ch.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Nhập địa chỉ giao hàng"
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">Tóm tắt đơn hàng</p>
              <div className="space-y-2">
                {selected.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-sm font-semibold text-slate-700">Tổng cộng</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Hủy
          </button>
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Quay lại
              </button>
            )}
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                disabled={selected.length === 0}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium text-white transition",
                  selected.length > 0
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "cursor-not-allowed bg-slate-300"
                )}
              >
                Tiếp theo
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!customerName || !customerPhone || !address || selected.length === 0}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium text-white transition",
                  customerName && customerPhone && address && selected.length > 0
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "cursor-not-allowed bg-slate-300"
                )}
              >
                Tạo đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
