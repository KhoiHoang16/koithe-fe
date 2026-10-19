import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Home, BookOpen, Package } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useCartStore } from '@/shared/stores/cart-store';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { getInitials } from '@/shared/libs/utils';

/** Customer Web layout - Smart Header (Auto-hide on scroll down, reveal on scroll up, transparent at top) + Footer + Bottom nav mobile */
export function CustomerLayout() {
  const { user, isAuthenticated } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const location = useLocation();

  const isTransparentPage = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/menu';

  // Smart Header states
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prevScrollY = useRef(0);

  useEffect(() => {
    // Đảm bảo cuộn lên đỉnh ngay lập tức khi đổi route và khởi tạo header tại đỉnh trang
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    prevScrollY.current = 0;
    setIsScrolled(false);
    setIsVisible(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const prev = prevScrollY.current;

      // 1. Kiểm tra vị trí để chuyển trạng thái nền (đỉnh trang vs cuộn xuống)
      setIsScrolled(currentScrollY > 40);

      // 2. Logic Smart Header:
      if (currentScrollY <= 40) {
        // Đang ở đỉnh trang: luôn luôn hiện
        setIsVisible(true);
      } else if (currentScrollY > prev && currentScrollY - prev > 10) {
        // Đang CUỘN XUỐNG: trượt lên ẩn đi
        setIsVisible(false);
      } else if (currentScrollY < prev && prev - currentScrollY > 5) {
        // Đang CUỘN LÊN (kể cả cuộn nhẹ): trượt xuống hiện lại ngay
        setIsVisible(true);
      }

      prevScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const isTransparentMode = isTransparentPage && !isScrolled && !isHovered;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ============================================================
          SMART HEADER (Auto-hide on scroll down, reveal on scroll up)
          ============================================================ */}
      <header
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${
          isTransparentMode
            ? 'bg-transparent border-b-0 border-transparent text-white'
            : 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm text-foreground'
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground font-sans font-bold text-xs flex items-center justify-center tracking-wider shadow-sm group-hover:scale-105 transition-all duration-300">
              KOI
            </div>
            <div className="flex flex-col">
              <span
                className={`font-sans text-lg font-black tracking-widest leading-none transition-colors ${
                  isTransparentMode ? 'text-white' : 'text-primary'
                }`}
              >
                KOI THÉ
              </span>
              <span
                className={`text-[9px] tracking-widest uppercase transition-colors ${
                  isTransparentMode ? 'text-white/70' : 'text-muted-foreground'
                }`}
              >
                Tea Craft
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (CHAGEE Style: Logo = Home, first link is Về chúng tôi) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors ${
                isTransparentMode
                  ? 'text-white/80 hover:text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Về chúng tôi
            </Link>
            <Link
              to="/menu"
              className={`text-sm font-medium transition-colors ${
                isTransparentMode
                  ? 'text-white/80 hover:text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Thực đơn
            </Link>
            <Link
              to="/track-order"
              className={`text-sm font-medium transition-colors ${
                isTransparentMode
                  ? 'text-white/80 hover:text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Theo dõi đơn
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Tìm kiếm"
              className={isTransparentMode ? 'text-white hover:bg-white/10' : ''}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Link to="/cart" aria-label={`Giỏ hàng (${itemCount} sản phẩm)`}>
              <Button
                variant="ghost"
                size="icon-sm"
                className={`relative ${isTransparentMode ? 'text-white hover:bg-white/10' : ''}`}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[10px] font-bold flex items-center justify-center bg-primary text-primary-foreground shadow-sm">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Profile Link (Direct Link to Profile + User Name) */}
            {isAuthenticated && user ? (
              <Link
                to="/profile"
                className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full transition-all group ${
                  isTransparentMode
                    ? 'text-white hover:bg-white/10'
                    : 'text-stone-800 hover:bg-stone-100/90'
                }`}
                title="Trang cá nhân của bạn"
              >
                <Avatar className="h-8 w-8 ring-1 ring-border group-hover:ring-primary/50 transition-all shrink-0">
                  <AvatarImage src={user.anhDaiDien} alt={user.hoTen} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {getInitials(user.hoTen)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs sm:text-sm font-semibold tracking-tight truncate max-w-[120px] sm:max-w-[170px] group-hover:text-primary transition-colors">
                  {user.hoTen}
                </span>
              </Link>
            ) : (
              <Button
                size="sm"
                asChild
                className="rounded-xl transition-all bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                <Link to="/login">
                  <User className="h-4 w-4 mr-1.5" />
                  Đăng nhập
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          MAIN CONTENT (Trang chủ & Về chúng tôi tràn viền top, các trang khác có đệm pt-16)
          ============================================================ */}
      <main className={`flex-1 ${isTransparentPage ? '' : 'pt-16'}`}>
        <Outlet />
      </main>

      {/* ============================================================
          FOOTER (Desktop & Tablet)
          ============================================================ */}
      <footer className="border-t border-neutral-200 bg-[#FAFAFA] text-neutral-800 pt-16 pb-12 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-neutral-200/80">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-sans font-bold text-xs flex items-center justify-center tracking-wider shadow-sm">
                  KOI
                </div>
                <div>
                  <span className="font-sans text-xl font-black tracking-widest text-foreground block leading-none">
                    KOI THÉ
                  </span>
                  <span className="text-[10px] tracking-widest uppercase text-muted-foreground block mt-1">
                    Tea Craft Vietnam
                  </span>
                </div>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-sm font-light">
                Khởi nguồn từ Đài Loan, KOI Thé mang đến nghệ thuật pha chế trà thủ công cùng trân châu hoàng kim độc quyền, được nấu mới mỗi 4 giờ để giữ trọn vẹn sự tươi ngon.
              </p>
            </div>

            {/* Col 1: Khám phá */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
                Khám Phá
              </h4>
              <ul className="space-y-2.5 text-sm text-neutral-500 font-light">
                <li><Link to="/menu" className="hover:text-primary transition-colors">Thực đơn đặc sắc</Link></li>
                <li><Link to="/track-order" className="hover:text-primary transition-colors">Theo dõi đơn hàng</Link></li>
                <li><Link to="/menu" className="hover:text-primary transition-colors">Trân châu Hoàng Kim</Link></li>
                <li><Link to="/menu" className="hover:text-primary transition-colors">Bộ sưu tập Macchiato</Link></li>
              </ul>
            </div>

            {/* Col 2: Về Chúng Tôi */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
                Về Chúng Tôi
              </h4>
              <ul className="space-y-2.5 text-sm text-neutral-500 font-light">
                <li><Link to="/about" className="hover:text-primary transition-colors">Câu chuyện thương hiệu</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">Hệ thống cửa hàng</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">Chính sách chất lượng</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">Tuyển dụng</Link></li>
              </ul>
            </div>

            {/* Col 3: Liên hệ */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
                Dịch Vụ Khách Hàng
              </h4>
              <ul className="space-y-2.5 text-sm text-neutral-500 font-light">
                <li className="flex items-center gap-2">
                  <span className="text-neutral-400">Hotline:</span>
                  <a href="tel:1900636123" className="font-medium text-foreground hover:text-primary hover:underline transition-colors">1900 636 123</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-neutral-400">Email:</span>
                  <a href="mailto:contact@koithe.vn" className="text-foreground hover:text-primary hover:underline transition-colors">contact@koithe.vn</a>
                </li>
                <li className="text-xs text-neutral-400 pt-1">
                  Giờ hoạt động: 08:30 – 22:00
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <div>
              © 2026 KOI THÉ Vietnam. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex items-center gap-6">
              <Link to="/" className="hover:text-neutral-600 transition-colors">Điều khoản dịch vụ</Link>
              <Link to="/" className="hover:text-neutral-600 transition-colors">Chính sách bảo mật</Link>
              <Link to="/" className="hover:text-neutral-600 transition-colors">Tiêu chuẩn vệ sinh</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================
          BOTTOM NAVIGATION (Mobile)
          ============================================================ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="grid grid-cols-5 h-16">
          {[
            { to: '/', icon: Home, label: 'Home' },
            { to: '/menu', icon: BookOpen, label: 'Menu' },
            {
              to: '/cart',
              icon: ShoppingCart,
              label: 'Giỏ',
              badge: itemCount > 0 ? itemCount : undefined,
            },
            { to: '/orders', icon: Package, label: 'Đơn' },
            { to: isAuthenticated ? '/profile' : '/login', icon: User, label: 'Tôi' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors relative"
              aria-label={item.label}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom nav spacer on mobile */}
      <div className="md:hidden h-16" />
    </div>
  );
}
