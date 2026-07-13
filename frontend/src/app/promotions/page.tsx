"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Clock, Percent, Trash2, Power, RefreshCw, X } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { apiGet, apiPost, apiDelete, ApiError } from "@/lib/api";

interface PromotionDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING" | "BUY_X_GET_Y";
  discountValue: number;
  maxDiscount: number | null;
  minOrderValue: number;
  usageLimit: number;
  usagePerCustomer: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "EXPIRED" | "DISABLED";
}

// Spring trả Page<T> chuẩn (khác PageResponse tự viết của các service kia)
interface SpringPage<T> {
  content: T[];
  totalElements: number;
}

const typeLabels: Record<string, string> = {
  PERCENTAGE: "Giảm theo %",
  FIXED_AMOUNT: "Giảm số tiền",
  FREE_SHIPPING: "Miễn phí vận chuyển",
  BUY_X_GET_Y: "Mua X tặng Y",
};

const statusMeta: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Đang chạy", className: "bg-emerald-50 text-emerald-700" },
  DRAFT: { label: "Nháp", className: "bg-slate-100 text-slate-600" },
  EXPIRED: { label: "Hết hạn", className: "bg-amber-50 text-amber-700" },
  DISABLED: { label: "Đã dừng", className: "bg-red-50 text-red-600" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("vi-VN");
}

function discountText(p: PromotionDto) {
  switch (p.type) {
    case "PERCENTAGE":
      return `${p.discountValue}%`;
    case "FIXED_AMOUNT":
      return formatCurrency(p.discountValue);
    case "FREE_SHIPPING":
      return "Miễn phí ship";
    default:
      return typeLabels[p.type];
  }
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<SpringPage<PromotionDto>>("/promotions?page=0&size=50&sort=createdAt,desc");
      setPromotions(res.content);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const doAction = async (id: string, action: "activate" | "disable" | "delete") => {
    setBusyId(id);
    try {
      if (action === "delete") {
        await apiDelete(`/promotions/${id}`);
      } else {
        await apiPost(`/promotions/${id}/${action}`, {});
      }
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Thao tác thất bại, vui lòng thử lại");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý khuyến mãi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng số {promotions.length} chương trình
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
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Tạo khuyến mãi
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="py-12 text-center text-sm text-slate-400">Đang tải khuyến mãi...</div>
      )}

      {!loading && promotions.length === 0 && !error && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-400">
          Chưa có chương trình khuyến mãi nào — bấm &quot;Tạo khuyến mãi&quot; để thêm mã đầu tiên
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {promotions.map((promo) => {
          const usagePercent = promo.usageLimit > 0
            ? Math.min(Math.round((promo.usedCount / promo.usageLimit) * 100), 100)
            : 0;
          const meta = statusMeta[promo.status] ?? statusMeta.DRAFT;
          const busy = busyId === promo.id;

          return (
            <div
              key={promo.id}
              className={cn(
                "rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm",
                (promo.status === "EXPIRED" || promo.status === "DISABLED") && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{promo.name}</h3>
                  <div className="mt-1">
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", meta.className)}>
                      {meta.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold text-blue-700 mb-3">
                {promo.code}
              </div>

              <div className="text-2xl font-bold text-blue-600 mb-1">
                {promo.type === "PERCENTAGE" ? (
                  <span className="inline-flex items-center gap-1">
                    <Percent className="h-5 w-5" />
                    {promo.discountValue}%
                  </span>
                ) : (
                  <span>{discountText(promo)}</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">
                {typeLabels[promo.type]} · Đơn tối thiểu {formatCurrency(promo.minOrderValue)}
                {promo.maxDiscount ? ` · Giảm tối đa ${formatCurrency(promo.maxDiscount)}` : ""}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDate(promo.startDate)} - {formatDate(promo.endDate)}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Đã dùng: {promo.usedCount}/{promo.usageLimit}</span>
                  <span>{usagePercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      usagePercent >= 90 ? "bg-red-500" : usagePercent >= 70 ? "bg-amber-500" : "bg-blue-500"
                    )}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                {promo.status === "ACTIVE" ? (
                  <button
                    onClick={() => doAction(promo.id, "disable")}
                    disabled={busy}
                    className="flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-600 transition hover:bg-amber-50 disabled:opacity-50"
                  >
                    <Power className="h-3.5 w-3.5" />
                    Dừng
                  </button>
                ) : (
                  <button
                    onClick={() => doAction(promo.id, "activate")}
                    disabled={busy}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                  >
                    <Power className="h-3.5 w-3.5" />
                    Kích hoạt
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm(`Xóa mã ${promo.code}?`)) doAction(promo.id, "delete");
                  }}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <CreatePromotionForm
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function CreatePromotionForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<PromotionDto["type"]>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("10");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("0");
  const [usageLimit, setUsageLimit] = useState("100");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("2026-12-31");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError("Vui lòng nhập mã và tên chương trình");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiPost("/promotions", {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        type,
        discountValue: Number(discountValue) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        minOrderValue: Number(minOrderValue) || 0,
        usageLimit: Number(usageLimit) || 1,
        usagePerCustomer: 1,
        startDate: `${startDate}T00:00:00`,
        endDate: `${endDate}T23:59:59`,
        status: "ACTIVE",
        createdBy: "admin",
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không tạo được khuyến mãi, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Tạo khuyến mãi mới</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Mã khuyến mãi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className={cn(inputClass, "font-mono uppercase")}
                placeholder="VD: SUMMER20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Loại giảm giá</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PromotionDto["type"])}
                className={inputClass}
              >
                <option value="PERCENTAGE">Giảm theo %</option>
                <option value="FIXED_AMOUNT">Giảm số tiền</option>
                <option value="FREE_SHIPPING">Miễn phí vận chuyển</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Tên chương trình <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="VD: Giảm giá mùa hè"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {type === "PERCENTAGE" ? "Phần trăm giảm (%)" : "Số tiền giảm (đ)"}
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Giảm tối đa (đ)</label>
              <input
                type="number"
                min="0"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                className={inputClass}
                placeholder="Không giới hạn"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Đơn tối thiểu (đ)</label>
              <input
                type="number"
                min="0"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Số lượt dùng tối đa</label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Ngày kết thúc</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
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
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Đang tạo..." : "Tạo khuyến mãi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
