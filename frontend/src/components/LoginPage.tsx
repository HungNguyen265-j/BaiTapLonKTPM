"use client";

import { useState } from "react";
import { Eye, EyeOff, Store, Loader2, ShieldCheck, User } from "lucide-react";
import { apiPost, saveSession, type Session } from "@/lib/api";

interface LoginPageProps {
  onLogin: (session: Session) => void;
}

type Audience = "customer" | "admin";
type Mode = "login" | "register" | "forgot";

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [audience, setAudience] = useState<Audience>("customer");
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = audience === "admin";
  const isRegister = !isAdmin && mode === "register";
  const isForgot = !isAdmin && mode === "forgot";
  const [success, setSuccess] = useState<string | null>(null);

  const inputClass =
    "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all [color-scheme:dark]";

  const submit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (isForgot) {
        await apiPost<{ message: string }>("/auth/forgot-password", { email, phone, newPassword: password });
        setSuccess("Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.");
        setMode("login");
        setPassword("");
        return;
      }
      const session = isRegister
        ? await apiPost<Session>("/auth/register", { name, email, phone, password })
        : await apiPost<Session>("/auth/login", { email, password });
      if (isAdmin && session.role !== "ADMIN") {
        setError("Tài khoản này không có quyền quản trị");
        return;
      }
      if (!isAdmin && session.role === "ADMIN") {
        setError("Đây là tài khoản quản trị — hãy chọn khu vực Quản trị viên");
        return;
      }
      saveSession(session);
      onLogin(session);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const switchAudience = (a: Audience) => {
    setAudience(a);
    setMode("login");
    setError(null);
    setSuccess(null);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isAdmin ? "bg-indigo-500" : "bg-blue-500"}`}>
              {isAdmin ? <ShieldCheck size={20} className="text-white" /> : <Store size={20} className="text-white" />}
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SaleHub</div>
              <div className="text-blue-300 text-xs">Quản lý bán hàng đa kênh</div>
            </div>
          </div>

          {/* Chọn khu vực: Khách hàng / Quản trị viên */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => switchAudience("customer")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                !isAdmin
                  ? "bg-blue-500 border-blue-400 text-white"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
              }`}
            >
              <User size={15} /> Khách hàng
            </button>
            <button
              onClick={() => switchAudience("admin")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                isAdmin
                  ? "bg-indigo-500 border-indigo-400 text-white"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck size={15} /> Quản trị viên
            </button>
          </div>

          {!isAdmin && (
            <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => switchMode("login")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "login" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => switchMode("register")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "register" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                Đăng ký
              </button>
            </div>
          )}

          <h1 className="text-white text-2xl font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {isAdmin ? "Đăng nhập quản trị" : isRegister ? "Tạo tài khoản khách hàng" : isForgot ? "Quên mật khẩu" : "Đăng nhập"}
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            {isAdmin
              ? "Dành riêng cho quản trị viên hệ thống."
              : isRegister
                ? "Đăng ký để tự đặt hàng và theo dõi đơn của bạn."
                : isForgot
                  ? "Nhập email và số điện thoại đã đăng ký để xác minh, rồi đặt mật khẩu mới."
                  : "Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục."}
          </p>

          <div className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Họ tên</label>
                <input value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Nguyễn Văn A" />
              </div>
            )}
            {(isRegister || isForgot) && (
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">
                  {isForgot ? "Số điện thoại đã đăng ký" : "Số điện thoại"}
                </label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="0912345678" />
              </div>
            )}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                placeholder="ban@example.com"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">{isForgot ? "Mật khẩu mới" : "Mật khẩu"}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !loading) submit(); }}
                  className={inputClass}
                  placeholder={isRegister || isForgot ? "Ít nhất 6 ký tự" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {!isAdmin && mode === "login" && (
                <div className="flex justify-end mt-1.5">
                  <button onClick={() => switchMode("forgot")} className="text-blue-400 text-xs hover:text-blue-300 transition-colors">
                    Quên mật khẩu?
                  </button>
                </div>
              )}
              {isForgot && (
                <div className="flex justify-end mt-1.5">
                  <button onClick={() => switchMode("login")} className="text-blue-400 text-xs hover:text-blue-300 transition-colors">
                    ← Quay lại đăng nhập
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
                {success}
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className={`w-full disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 ${
                isAdmin ? "bg-indigo-500 hover:bg-indigo-400 hover:shadow-indigo-500/30" : "bg-blue-500 hover:bg-blue-400 hover:shadow-blue-500/30"
              }`}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isAdmin ? "Đăng nhập" : isRegister ? "Đăng ký" : isForgot ? "Đặt lại mật khẩu" : "Đăng nhập"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
