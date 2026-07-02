"use client";

import { useState } from "react";
import { X, CheckCircle, Shield, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddChannelModalProps {
  onClose: () => void;
}

const platforms = [
  { key: "shopee", name: "Shopee", icon: "🛍", color: "bg-orange-50 border-orange-200" },
  { key: "lazada", name: "Lazada", icon: "🏪", color: "bg-purple-50 border-purple-200" },
  { key: "tiki", name: "Tiki", icon: "📦", color: "bg-blue-50 border-blue-200" },
  { key: "tiktok", name: "TikTok Shop", icon: "🎵", color: "bg-pink-50 border-pink-200" },
  { key: "facebook", name: "Facebook Shop", icon: "📘", color: "bg-indigo-50 border-indigo-200" },
  { key: "website", name: "Website riêng", icon: "🌐", color: "bg-emerald-50 border-emerald-200" },
];

export default function AddChannelModal({ onClose }: AddChannelModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [storeId, setStoreId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);

  const selected = platforms.find((p) => p.key === selectedPlatform);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setStep(3);
    }, 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex w-full max-w-lg flex-col rounded-xl border border-slate-200 bg-white shadow-xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Thêm kênh bán</h2>
            <p className="mt-1 text-sm text-slate-400">
              Bước {step} / 3
              {step === 1 && " • Chọn nền tảng"}
              {step === 2 && " • Nhập thông tin"}
              {step === 3 && " • Hoàn tất"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-1 items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition",
                    step >= s
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  )}
                >
                  {step > s ? <CheckCircle className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 transition",
                      step > s ? "bg-blue-600" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between px-1">
            <span className="text-[10px] text-slate-400">Chọn nền tảng</span>
            <span className="text-[10px] text-slate-400">Nhập thông tin</span>
            <span className="text-[10px] text-slate-400">Hoàn tất</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setSelectedPlatform(p.key)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition",
                    selectedPlatform === p.key
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <span className="text-3xl">{p.icon}</span>
                  <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && selected && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
                <span className="text-2xl">{selected.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selected.name}</p>
                  <p className="text-xs text-slate-400">
                    Nhập thông tin kết nối API
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Shop ID / Store ID
                </label>
                <input
                  type="text"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Nhập Shop ID"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  API Key / Secret Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Nhập API Key"
                />
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <p className="text-xs text-blue-700">
                  Thông tin của bạn được mã hóa AES-256 và lưu trữ an toàn. Chúng tôi
                  không chia sẻ dữ liệu với bên thứ ba.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </button>
                <button
                  onClick={handleConnect}
                  disabled={connecting || !storeId.trim() || !apiKey.trim()}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition",
                    connecting || !storeId.trim() || !apiKey.trim()
                      ? "cursor-not-allowed bg-slate-300"
                      : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {connecting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang kết nối...
                    </>
                  ) : (
                    "Kết nối"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && selected && (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Kết nối thành công</h3>
              <p className="mt-2 text-sm text-slate-500">
                Kênh <span className="font-semibold text-slate-700">{selected.name}</span> đã được kết nối
                thành công. Bạn có thể đồng bộ sản phẩm và đơn hàng ngay lập tức.
              </p>
              <div className="mx-auto mt-5 max-w-xs space-y-2 text-left">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm">
                  <span className="text-slate-500">Nền tảng</span>
                  <span className="font-medium text-slate-900">
                    {selected.icon} {selected.name}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm">
                  <span className="text-slate-500">Shop ID</span>
                  <span className="font-medium text-slate-900">{storeId}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm">
                  <span className="text-slate-500">Trạng thái</span>
                  <span className="font-medium text-emerald-600">Đã kết nối</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="mt-6 rounded-lg bg-blue-600 px-8 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Hoàn tất
              </button>
            </div>
          )}
        </div>

        {step === 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              onClick={() => { if (selectedPlatform) setStep(2); }}
              disabled={!selectedPlatform}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-medium text-white transition",
                selectedPlatform
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "cursor-not-allowed bg-slate-300"
              )}
            >
              Tiếp theo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
