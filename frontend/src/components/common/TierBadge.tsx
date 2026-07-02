import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: string;
}

const tierConfig: Record<string, { label: string; className: string }> = {
  platinum: { label: "Platinum", className: "bg-purple-50 text-purple-700 border-purple-200" },
  gold: { label: "Gold", className: "bg-amber-50 text-amber-700 border-amber-200" },
  silver: { label: "Silver", className: "bg-slate-50 text-slate-600 border-slate-200" },
  bronze: { label: "Bronze", className: "bg-orange-50 text-orange-700 border-orange-200" },
};

export default function TierBadge({ tier }: TierBadgeProps) {
  const key = tier.toLowerCase();
  const config = tierConfig[key] ?? {
    label: tier,
    className: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
