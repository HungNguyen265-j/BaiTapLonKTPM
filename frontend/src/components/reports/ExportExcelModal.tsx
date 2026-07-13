"use client";

import { useState } from "react";
import { X, FileSpreadsheet, CheckCircle } from "lucide-react";

interface ExportExcelModalProps {
  onClose: () => void;
}

export default function ExportExcelModal({ onClose }: ExportExcelModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [range, setRange] = useState("year");
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setStep(2);
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        {step === 1 && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Xuất Excel</h2>
                  <p className="text-xs text-slate-400">Chọn khoảng thời gian</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { value: "year", label: "Năm nay" },
                { value: "quarter", label: "Quý này" },
                { value: "month", label: "Tháng này" },
                { value: "custom", label: "Tuỳ chỉnh" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                    range === opt.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="range"
                    value={opt.value}
                    checked={range === opt.value}
                    onChange={() => setRange(opt.value)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {exporting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    Xuất Excel
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Xuất báo cáo thành công</h2>
            <p className="mt-2 text-sm text-slate-500">
              File báo cáo đã được tải xuống thiết bị của bạn.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
