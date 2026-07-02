import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { formatCompactCurrency } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  color: string;
}

export default function StatCard({ label, value, sub, trend, icon: Icon, color }: StatCardProps) {
  const displayValue =
    typeof value === "number"
      ? formatCompactCurrency(value)
      : /^\d+$/.test(value)
      ? formatCompactCurrency(Number(value))
      : value;

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">
            {displayValue}
          </p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 border-t border-[#E2E8F0] pt-3">
          {trend === "up" ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          )}
          <span
            className={`text-xs font-medium ${
              trend === "up" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? "Tăng" : "Giảm"} so với tháng trước
          </span>
        </div>
      )}
    </div>
  );
}
