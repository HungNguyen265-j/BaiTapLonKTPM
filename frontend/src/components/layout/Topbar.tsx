"use client";

import { Search, Bell } from "lucide-react";
import { useState } from "react";

interface TopbarProps {
  screenTitle: string;
  screenLabel: string;
}

const notifications = [
  { id: 1, title: "Tồn kho thấp", description: "Sản phẩm A01 chỉ còn 2 sản phẩm", time: "5 phút trước", type: "warning" },
  { id: 2, title: "Đơn hàng chờ xử lý", description: "Có 12 đơn hàng chưa được xác nhận", time: "15 phút trước", type: "info" },
  { id: 3, title: "Đơn hàng mới", description: "Đơn #OR003 vừa được đặt từ Shopee", time: "30 phút trước", type: "info" },
  { id: 4, title: "Cập nhật vận chuyển", description: "Đơn #OR002 đã được giao thành công", time: "1 giờ trước", type: "success" },
];

export default function Topbar({ screenTitle, screenLabel }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="font-medium text-slate-900">SaleHub</span>
        <span>/</span>
        <span>{screenLabel}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-64 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-blue-400 focus:bg-white"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white transition-colors hover:bg-[#F8FAFC]"
          >
            <Bell className="h-4 w-4 text-slate-600" />
            <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
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
                    Thông báo
                  </h3>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="border-b border-[#E2E8F0] px-4 py-3 transition-colors hover:bg-[#F8FAFC]"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                            n.type === "warning"
                              ? "bg-amber-400"
                              : n.type === "success"
                              ? "bg-emerald-400"
                              : "bg-blue-400"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {n.description}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 text-center">
                  <button className="text-xs font-medium text-blue-500 hover:text-blue-600">
                    Xem tất cả
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
