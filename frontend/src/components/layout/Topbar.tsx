"use client";

import { Search, Bell, ShoppingCart, Package, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Screen } from "@/types";
import { apiGet, type PageResponse } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface TopbarProps {
  screenTitle: string;
  screenLabel: string;
  onNavigate?: (screen: Screen) => void;
}

interface PendingOrder {
  id: string;
  orderCode: string;
  customerName: string | null;
  totalAmount: number;
  createdAt: string;
}

interface SearchResults {
  products: { id: string; name: string; sku: string }[];
  orders: { id: string; orderCode: string; customerName: string | null; totalAmount: number }[];
  customers: { id: string; name: string; phone: string | null }[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export default function Topbar({ screenLabel, onNavigate }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Thông báo thật = các đơn đang chờ xử lý
  const loadNotifications = () => {
    apiGet<PageResponse<PendingOrder>>("/orders/search?status=PENDING&page=0&size=10")
      .then((res) => setPendingOrders(res.content ?? []))
      .catch(() => setPendingOrders([]));
  };

  useEffect(() => {
    loadNotifications();
  }, [screenLabel]); // đổi trang thì cập nhật lại

  // Tìm kiếm gộp 3 nguồn, chờ 350ms sau khi ngừng gõ mới gọi API
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const enc = encodeURIComponent(q);
        const [products, orders, customers] = await Promise.all([
          apiGet<PageResponse<SearchResults["products"][0]>>(
            `/products/search?keyword=${enc}&page=0&size=5`
          ).catch(() => null),
          apiGet<PageResponse<SearchResults["orders"][0]>>(
            `/orders/search?keyword=${enc}&page=0&size=5`
          ).catch(() => null),
          apiGet<PageResponse<SearchResults["customers"][0]>>(
            `/customers/search?keyword=${enc}&page=0&size=5`
          ).catch(() => null),
        ]);
        setResults({
          products: products?.content ?? [],
          orders: orders?.content ?? [],
          customers: customers?.content ?? [],
        });
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const goTo = (screen: Screen) => {
    setQuery("");
    setResults(null);
    setShowNotifications(false);
    onNavigate?.(screen);
  };

  const hasResults =
    results && (results.products.length + results.orders.length + results.customers.length > 0);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="font-medium text-slate-900">SaleHub</span>
        <span>/</span>
        <span>{screenLabel}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Tìm kiếm thật: sản phẩm + đơn hàng + khách hàng */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm sản phẩm, đơn hàng, khách..."
            className="w-64 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-blue-400 focus:bg-white"
          />

          {query.trim().length >= 2 && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setQuery("")} />
              <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-xl border border-[#E2E8F0] bg-white shadow-lg">
                {searching && (
                  <p className="px-4 py-3 text-sm text-slate-400">Đang tìm...</p>
                )}
                {!searching && !hasResults && (
                  <p className="px-4 py-3 text-sm text-slate-400">
                    Không tìm thấy kết quả cho &quot;{query.trim()}&quot;
                  </p>
                )}
                {!searching && hasResults && (
                  <div className="max-h-96 overflow-y-auto py-1">
                    {results!.products.length > 0 && (
                      <div>
                        <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Sản phẩm
                        </p>
                        {results!.products.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => goTo("products")}
                            className="flex w-full items-center gap-2.5 px-4 py-2 text-left transition hover:bg-slate-50"
                          >
                            <Package className="h-4 w-4 shrink-0 text-blue-500" />
                            <span className="flex-1 truncate text-sm text-slate-700">{p.name}</span>
                            <span className="font-mono text-[11px] text-slate-400">{p.sku}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {results!.orders.length > 0 && (
                      <div>
                        <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Đơn hàng
                        </p>
                        {results!.orders.map((o) => (
                          <button
                            key={o.id}
                            onClick={() => goTo("orders")}
                            className="flex w-full items-center gap-2.5 px-4 py-2 text-left transition hover:bg-slate-50"
                          >
                            <ShoppingCart className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span className="font-mono text-xs text-blue-600">{o.orderCode}</span>
                            <span className="flex-1 truncate text-sm text-slate-600">
                              {o.customerName || ""}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatCurrency(o.totalAmount)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {results!.customers.length > 0 && (
                      <div>
                        <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Khách hàng
                        </p>
                        {results!.customers.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => goTo("crm")}
                            className="flex w-full items-center gap-2.5 px-4 py-2 text-left transition hover:bg-slate-50"
                          >
                            <Users className="h-4 w-4 shrink-0 text-violet-500" />
                            <span className="flex-1 truncate text-sm text-slate-700">{c.name}</span>
                            <span className="text-xs text-slate-400">{c.phone || ""}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Chuông thông báo thật: đơn chờ xử lý */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications((prev) => !prev);
              if (!showNotifications) loadNotifications();
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white transition-colors hover:bg-[#F8FAFC]"
          >
            <Bell className="h-4 w-4 text-slate-600" />
            {pendingOrders.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                {pendingOrders.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-[#E2E8F0] bg-white shadow-lg">
                <div className="border-b border-[#E2E8F0] px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Đơn chờ xử lý ({pendingOrders.length})
                  </h3>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {pendingOrders.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-slate-400">
                      Không có đơn nào chờ xử lý 🎉
                    </p>
                  )}
                  {pendingOrders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => goTo("orders")}
                      className="block w-full border-b border-[#E2E8F0] px-4 py-3 text-left transition-colors hover:bg-[#F8FAFC]"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            Đơn mới {o.orderCode}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {o.customerName || "Khách"} · {formatCurrency(o.totalAmount)}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {timeAgo(o.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {pendingOrders.length > 0 && (
                  <div className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => goTo("orders")}
                      className="text-xs font-medium text-blue-500 hover:text-blue-600"
                    >
                      Xem tất cả đơn hàng
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
