"use client";

import { useState } from "react";
import { X, Percent, DollarSign, Truck, Wand2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const channelOptions = [
  { key: "shopee", label: "Shopee" },
  { key: "lazada", label: "Lazada" },
  { key: "tiki", label: "Tiki" },
  { key: "website", label: "Website" },
];

const discountTypes = [
  { key: "percent", label: "Phần trăm", detail: "20%", icon: Percent },
  { key: "fixed", label: "Số tiền cố định", detail: "30.000đ", icon: DollarSign },
  { key: "ship", label: "Miễn phí ship", detail: "🚚", icon: Truck },
];

interface CreatePromotionModalProps {
  onClose: () => void;
}

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 3; i++) code += nums[Math.floor(Math.random() * nums.length)];
  return code;
}

export default function CreatePromotionModal({ onClose }: CreatePromotionModalProps) {
  const [discountType, setDiscountType] = useState("percent");
  const [name, setName] = useState("");
  const [code, setCode] = useState(generateCode());
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [channels, setChannels] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleChannel = (key: string) => {
    setChannels((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-xl text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
          <h2 className="mt-4 text-lg font-bold text-slate-900">Tạo khuyến mãi thành công</h2>
          <p className="mt-2 text-sm text-slate-500">Mã giảm giá đã được tạo:</p>
          <div className="mt-4 inline-flex items-center rounded-lg bg-blue-50 px-5 py-2.5 font-mono text-lg font-bold text-blue-700 tracking-wider">
            {code}
          </div>
          <div className="mt-6">
            <button
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Tạo chương trình khuyến mãi</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Loại giảm giá</label>
            <div className="grid grid-cols-3 gap-2">
              {discountTypes.map((dt) => {
                const active = discountType === dt.key;
                return (
                  <button
                    key={dt.key}
                    type="button"
                    onClick={() => setDiscountType(dt.key)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium transition",
                      active
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {dt.key === "ship" ? (
                      <span className="text-lg">🚚</span>
                    ) : (
                      <dt.icon className="h-5 w-5" />
                    )}
                    <span className="text-[11px] leading-tight text-center">{dt.label}</span>
                    <span className="text-xs font-bold">{dt.detail}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tên chương trình</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="VD: Giảm giá mùa hè"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Mã giảm giá</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="VD: SUMMER20"
              />
              <button
                type="button"
                onClick={() => setCode(generateCode())}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <Wand2 className="h-4 w-4" />
                Tạo
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Giá trị giảm {discountType === "percent" ? "(%)" : discountType === "fixed" ? "(VNĐ)" : ""}
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              disabled={discountType === "ship"}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-400"
              placeholder={discountType === "ship" ? "Miễn phí vận chuyển" : "Nhập giá trị"}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Đơn tối thiểu</label>
            <input
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="0"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Giới hạn sử dụng</label>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Không giới hạn"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Kênh áp dụng</label>
            <div className="flex flex-wrap gap-2">
              {channelOptions.map((ch) => {
                const active = channels.includes(ch.key);
                return (
                  <button
                    key={ch.key}
                    type="button"
                    onClick={() => toggleChannel(ch.key)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                      active
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {saving ? "Đang lưu..." : "Tạo khuyến mãi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
