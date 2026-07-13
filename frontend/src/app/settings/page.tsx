"use client";

import { useState } from "react";
import { Database, RefreshCw, Trash2, Save, CheckCircle2 } from "lucide-react";

const channels = [
  { id: "shopee", name: "Shopee" },
  { id: "lazada", name: "Lazada" },
  { id: "tiki", name: "Tiki" },
  { id: "website", name: "Website" },
];

export default function SettingsPage() {
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [ttl, setTtl] = useState(15);
  const [autoSync, setAutoSync] = useState(true);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt hệ thống</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý cache, đồng bộ và cấu hình chung
        </p>
      </div>

      {/* Cache settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
            <Database className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Cài đặt Cache (FR08)
            </h2>
            <p className="text-xs text-slate-400">
              Tối ưu tốc độ tải dữ liệu
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Toggle cache */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Bật Cache</p>
              <p className="text-xs text-slate-400">
                Lưu dữ liệu tạm thời để tăng tốc truy vấn
              </p>
            </div>
            <button
              onClick={() => setCacheEnabled(!cacheEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                cacheEnabled ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                  cacheEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* TTL input */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Thời gian làm mới (TTL)
              </p>
              <p className="text-xs text-slate-400">
                Tự động làm mới cache sau N phút
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={999}
                value={ttl}
                onChange={(e) => setTtl(Number(e.target.value))}
                className="w-20 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-sm text-slate-500">phút</span>
            </div>
          </div>

          {/* Cache status */}
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="mb-2 text-sm font-medium text-slate-700">
              Trạng thái cache
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400">Dung lượng</p>
                <p className="text-sm font-semibold text-slate-800">2.4 MB</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Bản ghi</p>
                <p className="text-sm font-semibold text-slate-800">1,234</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Hit rate</p>
                <p className="text-sm font-semibold text-green-600">94%</p>
              </div>
            </div>
          </div>

          {/* Clear cache button */}
          <button className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100">
            <Trash2 className="h-4 w-4" />
            Xóa cache
          </button>
        </div>
      </div>

      {/* Sync settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
            <RefreshCw className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Đồng bộ kênh bán hàng
            </h2>
            <p className="text-xs text-slate-400">
              Đồng bộ dữ liệu từ các kênh bán hàng
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Auto sync toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Tự động đồng bộ
              </p>
              <p className="text-xs text-slate-400">
                Đồng bộ dữ liệu mỗi 15 phút
              </p>
            </div>
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoSync ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                  autoSync ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Channel connection status */}
          <div className="space-y-2">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-700">
                  {ch.name}
                </span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Đã kết nối</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.98]">
          <Save className="h-4 w-4" />
          Lưu cài đặt
        </button>
      </div>
    </div>
  );
}
