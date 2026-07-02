"use client";

import { useState } from "react";
import type { Screen } from "@/types";
import AppShell from "@/components/layout/AppShell";
import LoginPage from "@/components/LoginPage";
import DashboardPage from "@/app/dashboard/page";
import ProductsPage from "@/app/products/page";
import ChannelsPage from "@/app/channels/page";
import InventoryPage from "@/app/inventory/page";
import OrdersPage from "@/app/orders/page";
import ShippingPage from "@/app/shipping/page";
import PromotionsPage from "@/app/promotions/page";
import CRMPage from "@/app/customers/page";
import ReportsPage from "@/app/reports/page";
import SettingsPage from "@/app/settings/page";

const components: Record<Screen, React.FC> = {
  login: DashboardPage,
  dashboard: DashboardPage,
  products: ProductsPage,
  channels: ChannelsPage,
  inventory: InventoryPage,
  orders: OrdersPage,
  shipping: ShippingPage,
  promotions: PromotionsPage,
  crm: CRMPage,
  reports: ReportsPage,
  settings: SettingsPage,
};

export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const handleNavigate = (screen: Screen) => {
    if (screen === "login") {
      setIsLoggedIn(false);
      return;
    }
    setCurrentScreen(screen);
  };

  const ScreenComponent = components[currentScreen];

  return (
    <AppShell currentScreen={currentScreen} onNavigate={handleNavigate}>
      <ScreenComponent />
    </AppShell>
  );
}
