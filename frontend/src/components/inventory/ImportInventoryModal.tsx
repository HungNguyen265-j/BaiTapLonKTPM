"use client";

import { useState } from "react";
import { X, Plus, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportRow {
  id: string;
  sku: string;
  name: string;
  qty: string;
  note: string;
}

interface ImportInventoryModalProps {
  onClose: () => void;
}

export default function ImportInventoryModal({ onClose }: ImportInventoryModalProps) {
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [rows, setRows] = useState<ImportRow[]>([
    { id: "1", sku: "", name: "", qty: "", note: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sku: "", name: "", qty: "", note: "" },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: keyof ImportRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const totalQty = rows.reduce((sum, r) => sum + (parseInt(r.qty) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-10 shadow-xl">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <PackageCheck className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Nhập kho thành công!</h2>
          <p className="mt-1 text-sm text-slate-500">
            Đã nhập {totalQty} sản phẩm vào kho
          </p>
          <button
            onClick={onClose}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Nhập kho</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nhà cung cấp
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Tên nhà cung cấp"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Ngày nhập
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Danh sách sản phẩm nhập
              </label>
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm dòng
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Tên sản phẩm</th>
                    <th className="px-3 py-2 w-24">SL nhập</th>
                    <th className="px-3 py-2">Ghi chú</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-50">
                      <td className="px-3 py-1.5">
                        <input
                          type="text"
                          value={row.sku}
                          onChange={(e) => updateRow(row.id, "sku", e.target.value)}
                          className="w-full rounded border border-transparent px-1 py-1 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          placeholder="Mã SP"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => updateRow(row.id, "name", e.target.value)}
                          className="w-full rounded border border-transparent px-1 py-1 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          placeholder="Tên sản phẩm"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          type="number"
                          value={row.qty}
                          onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                          className="w-full rounded border border-transparent px-1 py-1 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          type="text"
                          value={row.note}
                          onChange={(e) => updateRow(row.id, "note", e.target.value)}
                          className="w-full rounded border border-transparent px-1 py-1 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          placeholder="Ghi chú"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="rounded p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-100 bg-slate-50 text-sm font-medium">
                    <td colSpan={2} className="px-3 py-2 text-right text-slate-600">
                      Tổng cộng:
                    </td>
                    <td className="px-3 py-2 text-slate-900">{totalQty}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
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
              disabled={loading}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition",
                loading
                  ? "cursor-not-allowed bg-blue-400"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {loading && (
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              Xác nhận nhập kho
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
