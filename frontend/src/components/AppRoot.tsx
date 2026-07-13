"use client";

import { useEffect, useState } from "react";
import type { Screen } from "@/types";
import { clearSession, loadSession, type Session } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import LoginPage from "@/components/LoginPage";
import CustomerPortal from "@/components/customer/CustomerPortal";
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

export default function AppRoot() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setReady(true);
  }, []);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setCurrentScreen("dashboard");
  };

  if (!ready) return null;

  if (!session) {
    return <LoginPage onLogin={setSession} />;
  }

  if (session.role === "CUSTOMER") {
    return <CustomerPortal session={session} onLogout={handleLogout} />;
  }

  const handleNavigate = (screen: Screen) => {
    if (screen === "login") {
      handleLogout();
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
