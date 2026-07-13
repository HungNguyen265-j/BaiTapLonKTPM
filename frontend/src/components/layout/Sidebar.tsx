"use client";

import { useEffect, useState } from "react";
import { type Screen } from "@/types";
import {
  LayoutDashboard,
  Package,
  Link2,
  Store,
  ShoppingCart,
  Truck,
  Tag,
  Users,
  BarChart2,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, type PageResponse } from "@/lib/api";

interface NavItem {
  screen: Screen;
  label: string;
  icon: LucideIcon;
}

// Chỉ Website là kênh kết nối thật (xem trang Kênh bán hàng)
const CONNECTED_CHANNELS = 1;

const navItems: NavItem[] = [
  { screen: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { screen: "products", label: "Sản phẩm", icon: Package },
  { screen: "channels", label: "Kênh bán hàng", icon: Link2 },
  { screen: "inventory", label: "Tồn kho", icon: Store },
  { screen: "orders", label: "Đơn hàng", icon: ShoppingCart },
  { screen: "shipping", label: "Vận chuyển", icon: Truck },
  { screen: "promotions", label: "Khuyến mãi", icon: Tag },
  { screen: "crm", label: "Khách hàng", icon: Users },
  { screen: "reports", label: "Báo cáo", icon: BarChart2 },
  { screen: "settings", label: "Hệ thống", icon: Settings },
];

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentScreen, onNavigate, onLogout }: SidebarProps) {
  const [pendingOrders, setPendingOrders] = useState(0);

  // Số đơn chờ xử lý thật; đổi màn hình sẽ tự cập nhật lại
  useEffect(() => {
    apiGet<PageResponse<unknown>>("/orders/search?status=PENDING&page=0&size=1")
      .then((res) => setPendingOrders(res.totalElements))
      .catch(() => setPendingOrders(0));
  }, [currentScreen]);

  const badges: Partial<Record<Screen, number>> = {
    channels: CONNECTED_CHANNELS,
    orders: pendingOrders,
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col bg-[#0F172A]">
      <div className="flex items-center gap-2.5 border-b border-[#1E293B] px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
          <Store className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-base leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SaleHub</div>
          <div className="text-xs text-slate-500" style={{ opacity: 0.5 }}>Đa kênh</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.screen;
          const badge = badges[item.screen] ?? 0;

          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {badge > 0 && (
                <span className="ml-auto text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-semibold leading-none">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#1E293B] px-3 py-4">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">A</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-300 truncate">Admin</div>
            <div className="text-[10px] text-slate-500 truncate">admin@salehub.vn</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg text-xs transition-colors"
        >
          <LogOut size={13} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
