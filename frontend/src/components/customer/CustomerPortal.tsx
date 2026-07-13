"use client";

import { useCallback, useEffect, useState } from "react";
import { LogOut, Minus, Plus, RefreshCw, ShoppingBag, ShoppingCart, Store, Trash2 } from "lucide-react";
import {
  apiGet, apiPost,
  type OrderDto, type PageResponse, type ProductDto, type Session,
} from "@/lib/api";

interface CustomerPortalProps {
  session: Session;
  onLogout: () => void;
}

interface CartItem {
  product: ProductDto;
  quantity: number;
}

type Tab = "shop" | "orders";

const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

export default function CustomerPortal({ session, onLogout }: CustomerPortalProps) {
  const [tab, setTab] = useState<Tab>("shop");
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const page = await apiGet<PageResponse<ProductDto>>("/products/search?page=0&size=50");
      setProducts(page.content.filter(p => p.status === "ACTIVE"));
    } catch (e) {
      setMessage({ kind: "err", text: e instanceof Error ? e.message : "Không tải được sản phẩm" });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    if (!session.customerId) return;
    setLoading(true);
    try {
      const page = await apiGet<PageResponse<OrderDto>>(
        `/orders/search?customerId=${session.customerId}&page=0&size=50`);
      setOrders(page.content);
    } catch (e) {
      setMessage({ kind: "err", text: e instanceof Error ? e.message : "Không tải được đơn hàng" });
    } finally {
      setLoading(false);
    }
  }, [session.customerId]);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { if (tab === "orders") loadOrders(); }, [tab, loadOrders]);

  const price = (p: ProductDto) => p.salePrice ?? p.basePrice;
  const cartTotal = cart.reduce((sum, it) => sum + price(it.product) * it.quantity, 0);

  const addToCart = (p: ProductDto) => {
    setCart(prev => {
      const found = prev.find(it => it.product.id === p.id);
      if (found) return prev.map(it => it.product.id === p.id ? { ...it, quantity: it.quantity + 1 } : it);
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setCart(prev => prev
      .map(it => it.product.id === id ? { ...it, quantity: it.quantity + delta } : it)
      .filter(it => it.quantity > 0));
  };

  const placeOrder = async () => {
    if (cart.length === 0 || !session.customerId) return;
    setPlacing(true);
    setMessage(null);
    try {
      const order = await apiPost<OrderDto>("/orders", {
        customerId: session.customerId,
        customerName: session.name,
        customerEmail: session.email,
        customerAddress: address || undefined,
        shippingAddress: address || undefined,
        source: "WEBSITE",
        paymentMethod: "COD",
        notes: note || undefined,
        items: cart.map(it => ({
          productId: it.product.id,
          sku: it.product.sku,
          productName: it.product.name,
          quantity: it.quantity,
          unitPrice: price(it.product),
        })),
      });
      setCart([]);
      setNote("");
      setMessage({ kind: "ok", text: `Đặt hàng thành công! Mã đơn: ${order.orderCode}` });
      setTab("orders");
    } catch (e) {
      setMessage({ kind: "err", text: e instanceof Error ? e.message : "Đặt hàng thất bại" });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
              <Store size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-800 leading-tight">SaleHub</div>
              <div className="text-xs text-slate-500">Xin chào, {session.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("shop")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "shop" ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <span className="flex items-center gap-1.5"><ShoppingBag size={15} /> Mua hàng</span>
            </button>
            <button
              onClick={() => setTab("orders")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "orders" ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <span className="flex items-center gap-1.5"><ShoppingCart size={15} /> Đơn của tôi</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm border ${message.kind === "ok" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"}`}>
            {message.text}
          </div>
        )}

        {tab === "shop" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Sản phẩm</h2>
                <button onClick={loadProducts} className="text-slate-500 hover:text-blue-500 p-2" title="Tải lại">
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
              {products.length === 0 && !loading && (
                <div className="text-slate-500 text-sm bg-white rounded-xl p-8 text-center border border-slate-200">
                  Chưa có sản phẩm nào.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
                    <div className="font-semibold text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">SKU: {p.sku}</div>
                    {p.description && <div className="text-sm text-slate-500 mt-1 line-clamp-2">{p.description}</div>}
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <div>
                        <span className="text-blue-600 font-bold">{fmt(price(p))}</span>
                        {p.salePrice && p.salePrice < p.basePrice && (
                          <span className="text-xs text-slate-400 line-through ml-2">{fmt(p.basePrice)}</span>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(p)}
                        className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Plus size={14} /> Thêm
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-20">
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <ShoppingCart size={18} /> Giỏ hàng
                </h2>
                {cart.length === 0 ? (
                  <p className="text-sm text-slate-400">Chưa có sản phẩm trong giỏ.</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map(it => (
                      <div key={it.product.id} className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-slate-700 truncate">{it.product.name}</div>
                          <div className="text-xs text-slate-400">{fmt(price(it.product))}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => changeQty(it.product.id, -1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
                            {it.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{it.quantity}</span>
                          <button onClick={() => changeQty(it.product.id, 1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-800">
                      <span>Tổng cộng</span>
                      <span className="text-blue-600">{fmt(cartTotal)}</span>
                    </div>
                    <input
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Địa chỉ giao hàng"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <input
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Ghi chú (tuỳ chọn)"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={placeOrder}
                      disabled={placing}
                      className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      {placing ? "Đang đặt hàng..." : "Đặt hàng (COD)"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Đơn hàng của tôi</h2>
              <button onClick={loadOrders} className="text-slate-500 hover:text-blue-500 p-2" title="Tải lại">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
            {orders.length === 0 && !loading ? (
              <div className="text-slate-500 text-sm bg-white rounded-xl p-8 text-center border border-slate-200">
                Bạn chưa có đơn hàng nào.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(o => (
                  <div key={o.id} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800">{o.orderCode}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                          {statusLabels[o.status] ?? o.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString("vi-VN") : ""}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-600 space-y-0.5">
                      {(o.items ?? []).map((it, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{it.productName} × {it.quantity}</span>
                          <span>{fmt(it.totalPrice ?? it.unitPrice * it.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between font-semibold text-slate-800">
                      <span>Tổng tiền</span>
                      <span className="text-blue-600">{fmt(o.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
