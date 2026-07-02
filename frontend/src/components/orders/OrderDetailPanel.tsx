"use client";

import { X, Check, Package, Truck, Home, Phone, MapPin, Calendar, CreditCard } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import StatusBadge from "@/components/common/StatusBadge";
import ChannelTag from "@/components/common/ChannelTag";
import type { Order } from "@/types";

interface OrderDetailPanelProps {
  order: Order & { customerPhone?: string; customerAddress?: string };
  onClose: () => void;
}

const statusSteps = [
  { key: "pending", label: "Đặt hàng" },
  { key: "shipped", label: "Đang giao" },
  { key: "delivered", label: "Đã nhận" },
];

const stepIcons = [Package, Truck, Home];

export default function OrderDetailPanel({ order, onClose }: OrderDetailPanelProps) {
  const currentStep = order.status === "cancelled" ? -1 : statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex w-full max-w-lg flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chi tiết đơn hàng</h2>
            <p className="font-mono text-xs text-blue-600">{order.code}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {order.status === "cancelled" ? (
            <div className="mx-6 mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              Đơn hàng đã bị hủy
            </div>
          ) : (
            <div className="mx-6 mt-6">
              <div className="relative flex items-start justify-between">
                {statusSteps.map((step, idx) => {
                  const Icon = stepIcons[idx];
                  const isCompleted = currentStep > idx;
                  const isActive = currentStep === idx;
                  const isLast = idx === statusSteps.length - 1;
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 transition",
                          isCompleted && "border-emerald-500 bg-emerald-500 text-white",
                          isActive && "border-blue-500 bg-blue-500 text-white",
                          !isCompleted && !isActive && "border-slate-300 bg-white text-slate-400"
                        )}
                      >
                        {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <p
                        className={cn(
                          "mt-2 text-xs font-medium",
                          (isCompleted || isActive) ? "text-slate-700" : "text-slate-400"
                        )}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
                <div className="absolute left-[16.67%] right-[16.67%] top-5 -z-10 h-0.5 bg-slate-200">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width: `${Math.max(0, Math.min(100, (currentStep / (statusSteps.length - 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mx-6 mt-8">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Thông tin khách hàng</h3>
            <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-sm font-bold text-blue-700">
                {order.customer.charAt(0)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium text-slate-900">{order.customer}</p>
                {order.customerPhone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="h-3 w-3" />
                    {order.customerPhone}
                  </div>
                )}
                {order.customerAddress && (
                  <div className="flex items-start gap-1.5 text-xs text-slate-500">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                    {order.customerAddress}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mx-6 mt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Sản phẩm</h3>
            <div className="space-y-2">
              {Array.from({ length: order.items }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-600">
                      SP
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Sản phẩm {i + 1}</p>
                      <p className="text-xs text-slate-400">SL: 1</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(Math.round(order.total / order.items))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-6 mt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Thông tin đơn hàng</h3>
            <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <CreditCard className="h-4 w-4" />
                  Kênh
                </div>
                <ChannelTag name={order.channel} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="h-4 w-4" />
                  Ngày đặt
                </div>
                <span className="text-slate-700">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : ""}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <CreditCard className="h-4 w-4" />
                  Thanh toán
                </div>
                <span className="text-slate-700">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Package className="h-4 w-4" />
                  Trạng thái
                </div>
                <StatusBadge status={order.status} />
              </div>
            </div>
          </div>

          <div className="mx-6 mb-6 mt-6">
            <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
              <span className="text-sm font-semibold text-slate-700">Tổng thanh toán</span>
              <span className="text-xl font-bold text-blue-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-4">
          {order.status === "pending" && (
            <>
              <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                Xác nhận đơn
              </button>
              <button className="flex-1 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">
                Hủy đơn
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
