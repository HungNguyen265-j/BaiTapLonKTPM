import { cn } from "@/lib/utils";

interface ChannelTagProps {
  name: string;
}

const channelConfig: Record<string, { label: string; className: string }> = {
  shopee: { label: "Shopee", className: "bg-orange-50 text-orange-700 border-orange-200" },
  lazada: { label: "Lazada", className: "bg-purple-50 text-purple-700 border-purple-200" },
  tiki: { label: "Tiki", className: "bg-blue-50 text-blue-700 border-blue-200" },
  website: { label: "Website", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  api: { label: "Website", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  facebook: { label: "Facebook", className: "bg-blue-50 text-blue-700 border-blue-200" },
  tiktok: { label: "TikTok", className: "bg-slate-100 text-slate-800 border-slate-300" },
  manual: { label: "Thủ công", className: "bg-slate-50 text-slate-600 border-slate-200" },
};

export default function ChannelTag({ name }: ChannelTagProps) {
  const key = name.toLowerCase();
  const config = channelConfig[key] ?? {
    label: name,
    className: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
