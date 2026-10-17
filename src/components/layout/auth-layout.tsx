import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/** Layout cho trang Auth (login, register, forgot password) - Luxury Centered Card trên nền cửa hàng KOI Thé */
export function AuthLayout() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Background Image: Cửa hàng KOI Thé thực tế */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 ease-out"
        style={{ backgroundImage: "url('/auth-bg.jpg')" }}
      />

      {/* Ambient Vignette Overlay for Depth & Contrast */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
      <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60 pointer-events-none" />

      {/* Top Left: Quick back to Home button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-medium transition-all group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Trang chủ</span>
      </Link>

      {/* Centered Luxury Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-white/40 p-6 sm:p-9 my-8 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link to="/" className="flex flex-col items-center gap-2 group">
            <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground font-sans font-bold text-sm flex items-center justify-center tracking-wider shadow-md group-hover:scale-105 transition-transform duration-300">
              KOI
            </div>
            <div className="flex flex-col items-center">
              <span className="font-sans text-xl font-black tracking-widest leading-none text-primary">
                KOI THÉ
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-neutral-400 mt-1 font-semibold">
                Tea Craft Vietnam
              </span>
            </div>
          </Link>
        </div>

        {/* Page Content (Login, Register, Forgot Password) */}
        <Outlet />
      </div>
    </div>
  );
}
