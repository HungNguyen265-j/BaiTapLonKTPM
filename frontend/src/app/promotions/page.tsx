"use client";

import { useState } from "react";
import { Plus, Clock, Edit2, Square, Percent } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import StatusBadge from "@/components/common/StatusBadge";
import CreatePromotionModal from "@/components/promotions/CreatePromotionModal";

interface Promotion {
  id: string;
  name: string;
  code: string;
  discount: string;
  type: "percent" | "fixed" | "ship";
  start: string;
  end: string;
  used: number;
  limit: number;
  status: "active" | "expired";
}

const mockPromotions: Promotion[] = [
  { id: "PROMO-001", name: "Giảm giá mùa hè", code: "SUMMER20", discount: "20%", type: "percent", start: "01/06/2026", end: "30/06/2026", used: 45, limit: 200, status: "active" },
  { id: "PROMO-002", name: "Flash sale thứ 6", code: "FLASH50K", discount: "50.000đ", type: "fixed", start: "10/06/2026", end: "20/06/2026", used: 128, limit: 150, status: "active" },
  { id: "PROMO-003", name: "Miễn phí vận chuyển", code: "FREESHIP", discount: "Miễn phí ship", type: "ship", start: "01/06/2026", end: "31/12/2026", used: 312, limit: 500, status: "active" },
  { id: "PROMO-004", name: "Khai trương chi nhánh", code: "OPENING", discount: "15%", type: "percent", start: "01/05/2026", end: "15/05/2026", used: 200, limit: 200, status: "expired" },
  { id: "PROMO-005", name: "Tết thiếu nhi", code: "KIDSDAY", discount: "30.000đ", type: "fixed", start: "01/05/2026", end: "01/06/2026", used: 67, limit: 100, status: "expired" },
];

export default function PromotionsPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý khuyến mãi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng số {mockPromotions.length} chương trình
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Tạo khuyến mãi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mockPromotions.map((promo) => {
          const usagePercent = Math.min(Math.round((promo.used / promo.limit) * 100), 100);

          return (
            <div
              key={promo.id}
              className={cn(
                "rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm",
                promo.status === "expired" && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{promo.name}</h3>
                  <div className="mt-1">
                    <StatusBadge status={promo.status} />
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold text-blue-700 mb-3">
                {promo.code}
              </div>

              <div className="text-2xl font-bold text-blue-600 mb-3">
                {promo.type === "percent" && <span className="inline-flex items-center gap-1"><Percent className="h-5 w-5" />{promo.discount}</span>}
                {promo.type === "fixed" && <span>{promo.discount}</span>}
                {promo.type === "ship" && <span>🚚 {promo.discount}</span>}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                <Clock className="h-3.5 w-3.5" />
                <span>{promo.start} - {promo.end}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Đã dùng: {promo.used}/{promo.limit}</span>
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

              {promo.status === "active" && (
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                    <Edit2 className="h-3.5 w-3.5" />
                    Chỉnh sửa
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50">
                    <Square className="h-3.5 w-3.5" />
                    Dừng
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCreate && <CreatePromotionModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
