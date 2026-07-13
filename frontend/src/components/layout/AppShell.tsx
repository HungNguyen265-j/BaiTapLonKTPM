"use client";

import { type Screen } from "@/types";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppShellProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  children: React.ReactNode;
}

const screenLabels: Record<Screen, string> = {
  login: "Đăng nhập",
  dashboard: "Dashboard",
  products: "Sản phẩm",
  channels: "Kênh bán hàng",
  inventory: "Tồn kho",
  orders: "Đơn hàng",
  shipping: "Vận chuyển",
  promotions: "Khuyến mãi",
  crm: "Khách hàng",
  reports: "Báo cáo",
  settings: "Hệ thống",
};

export default function AppShell({ currentScreen, onNavigate, children }: AppShellProps) {
  const handleLogout = () => {
    onNavigate("login");
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        onLogout={handleLogout}
      />
      <div className="ml-56 flex flex-1 flex-col">
        <Topbar
          screenTitle={currentScreen}
          screenLabel={screenLabels[currentScreen] ?? "Dashboard"}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
