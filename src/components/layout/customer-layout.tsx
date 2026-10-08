import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Home, BookOpen, Package } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useCartStore } from '@/shared/stores/cart-store';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { getInitials } from '@/shared/libs/utils';

/** Customer Web layout - Header + Footer + Bottom nav mobile */
export function CustomerLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ============================================================
          HEADER
          ============================================================ */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🧋</span>
            <span className="text-lg font-bold text-primary hidden sm:block">MilkTea</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              to="/menu"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Thực đơn
            </Link>
            <Link
              to="/track-order"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Theo dõi đơn
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Button variant="ghost" size="icon-sm" aria-label="Tìm kiếm">
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Link to="/cart" aria-label={`Giỏ hàng (${itemCount} sản phẩm)`}>
              <Button variant="ghost" size="icon-sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Menu tài khoản">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.anhDaiDien} alt={user.hoTen} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {getInitials(user.hoTen)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.hoTen}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Tài khoản</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">Đơn hàng</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/loyalty">Điểm thưởng</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" asChild className="btn-primary rounded-xl">
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
          MAIN CONTENT
          ============================================================ */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ============================================================
          FOOTER (Desktop)
          ============================================================ */}
      <footer className="hidden md:block border-t bg-muted/40 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧋</span>
                <span className="font-bold text-primary">MilkTea</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Hương vị đích thực, trải nghiệm tuyệt vời
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Liên kết</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/menu" className="hover:text-foreground transition-colors">Thực đơn</Link></li>
                <li><Link to="/track-order" className="hover:text-foreground transition-colors">Theo dõi đơn</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>📞 1900 xxxx</li>
                <li>📧 hello@milktea.vn</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
            © 2024 MilkTea. All rights reserved.
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
