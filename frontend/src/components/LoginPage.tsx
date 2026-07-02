"use client";

import { useState } from "react";
import { Eye, EyeOff, Store } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("admin@salehub.vn");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SaleHub</div>
              <div className="text-blue-300 text-xs">Quản lý bán hàng đa kênh</div>
            </div>
          </div>

          <h1 className="text-white text-2xl font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Đăng nhập</h1>
          <p className="text-slate-400 text-sm mb-6">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>

          <div className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Email / Tên đăng nhập</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <button className="text-blue-400 text-xs hover:text-blue-300 transition-colors">Quên mật khẩu?</button>
              </div>
            </div>
            <button
              onClick={onLogin}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99]"
            >
              Đăng nhập
            </button>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-slate-400 text-xs text-center">Demo: admin@salehub.vn / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
