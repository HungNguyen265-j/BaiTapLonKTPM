import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Đang bán", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  low: { label: "Sắp hết", className: "bg-amber-50 text-amber-700 border-amber-200" },
  out: { label: "Hết hàng", className: "bg-red-50 text-red-700 border-red-200" },
  delivered: { label: "Đã giao", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  shipped: { label: "Đang giao", className: "bg-blue-50 text-blue-700 border-blue-200" },
  shipping: { label: "Đang giao", className: "bg-blue-50 text-blue-700 border-blue-200" },
  pending: { label: "Chờ xử lý", className: "bg-amber-50 text-amber-700 border-amber-200" },
  cancelled: { label: "Đã hủy", className: "bg-red-50 text-red-700 border-red-200" },
  ok: { label: "Bình thường", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  expired: { label: "Hết hạn", className: "bg-slate-50 text-slate-600 border-slate-200" },
  in_transit: { label: "Đang vận chuyển", className: "bg-blue-50 text-blue-700 border-blue-200" },
  picked_up: { label: "Đã lấy hàng", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
