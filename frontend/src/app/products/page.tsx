"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { apiGet, apiPost, type PageResponse, type ProductDto } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Bỏ dấu tiếng Việt + ghép gạch ngang để sinh slug từ tên
function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyForm = { name: "", sku: "", basePrice: "", salePrice: "", unit: "cái", description: "", categoryId: "" };

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await apiGet<PageResponse<ProductDto>>("/products/search?page=0&size=100");
      setProducts(page.content);
      const cats = await apiGet<Category[]>("/categories");
      setCategories(cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openModal = () => {
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
    setNewCategory("");
    setModalError(null);
    setShowModal(true);
  };

  const save = async () => {
    setModalError(null);
    if (!form.name.trim() || !form.sku.trim() || !form.basePrice) {
      setModalError("Vui lòng nhập đủ tên, SKU và giá bán");
      return;
    }
    setSaving(true);
    try {
      let categoryId = form.categoryId;
      if (!categoryId) {
        if (!newCategory.trim()) {
          setModalError("Vui lòng chọn hoặc tạo danh mục");
          setSaving(false);
          return;
        }
        const cat = await apiPost<Category>("/categories", { name: newCategory.trim(), slug: slugify(newCategory) });
        categoryId = cat.id;
        setCategories(prev => [...prev, cat]);
      }
      await apiPost<ProductDto>("/products", {
        name: form.name.trim(),
        sku: form.sku.trim(),
        slug: slugify(form.name) + "-" + form.sku.trim().toLowerCase(),
        description: form.description.trim() || undefined,
        categoryId,
        basePrice: Number(form.basePrice),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        unit: form.unit.trim() || undefined,
        status: "ACTIVE",
      });
      setShowModal(false);
      await load();
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "Không tạo được sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">Tổng số {products.length} sản phẩm</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </button>
          <button
            onClick={openModal}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
              <th className="pb-3 pr-4 pl-4 pt-3">SKU</th>
              <th className="pb-3 pr-4 pt-3">Tên sản phẩm</th>
              <th className="pb-3 pr-4 pt-3 text-right">Giá gốc</th>
              <th className="pb-3 pr-4 pt-3 text-right">Giá bán</th>
              <th className="pb-3 pr-4 pt-3">Đơn vị</th>
              <th className="pb-3 pr-4 pt-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                <td className="py-3 pr-4 pl-4"><span className="font-mono text-xs text-blue-600">{p.sku}</span></td>
                <td className="py-3 pr-4">
                  <div className="font-medium text-slate-900">{p.name}</div>
                  {p.description && <div className="text-xs text-slate-400 truncate max-w-xs">{p.description}</div>}
                </td>
                <td className="py-3 pr-4 text-right text-slate-500">{formatCurrency(p.basePrice)}</td>
                <td className="py-3 pr-4 text-right font-medium text-slate-900">{formatCurrency(p.salePrice ?? p.basePrice)}</td>
                <td className="py-3 pr-4 text-slate-500">{p.unit ?? "—"}</td>
                <td className="py-3 pr-4">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    p.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}>
                    {p.status === "ACTIVE" ? "Đang bán" : p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && !loading && (
          <div className="py-12 text-center text-sm text-slate-400">Chưa có sản phẩm nào — bấm &quot;Thêm sản phẩm&quot; để tạo.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Thêm sản phẩm</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Tên sản phẩm *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Áo khoác gió nam" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">SKU *</label>
                  <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className={inputClass} placeholder="SKU-AK-003" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Đơn vị</label>
                  <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Giá gốc (₫) *</label>
                  <input type="number" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} className={inputClass} placeholder="350000" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Giá khuyến mãi (₫)</label>
                  <input type="number" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} className={inputClass} placeholder="299000" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Danh mục *</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className={inputClass}
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="">+ Tạo danh mục mới…</option>
                </select>
                {!form.categoryId && (
                  <input
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className={`${inputClass} mt-2`}
                    placeholder="Tên danh mục mới"
                  />
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Mô tả</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputClass} rows={2} />
              </div>

              {modalError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{modalError}</div>
              )}

              <button
                onClick={save}
                disabled={saving}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu sản phẩm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
