import { Outlet } from 'react-router-dom';

/** Layout cho trang Auth (login, register, forgot password) */
export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="mb-8 text-8xl">🧋</div>
          <h1 className="text-4xl font-bold mb-4 text-center">MilkTea</h1>
          <p className="text-xl text-white/80 text-center max-w-sm">
            Hương vị đích thực, trải nghiệm tuyệt vời
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { icon: '☕', label: '50+ sản phẩm' },
              { icon: '🚀', label: 'Giao nhanh' },
              { icon: '💎', label: 'Tích điểm' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <span className="text-3xl">{item.icon}</span>
                <span className="text-sm text-white/70">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative bubbles */}
        <div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-20 left-10 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <span className="text-4xl">🧋</span>
            <span className="text-2xl font-bold gradient-text">MilkTea</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
