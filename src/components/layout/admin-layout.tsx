import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Coffee,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  Ticket,
  Users,
  Warehouse,
  Calendar,
  Table2,
  Truck,
} from 'lucide-react';
import { cn } from '@/shared/libs/utils';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { getInitials } from '@/shared/libs/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Coffee, label: 'Sản phẩm' },
  { to: '/admin/categories', icon: FolderOpen, label: 'Danh mục' },
  { to: '/admin/toppings', icon: Tag, label: 'Topping' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Đơn hàng' },
  { to: '/admin/promotions', icon: Tag, label: 'Khuyến mãi' },
  { to: '/admin/vouchers', icon: Ticket, label: 'Voucher' },
  { to: '/admin/customers', icon: Users, label: 'Khách hàng' },
  { to: '/admin/employees', icon: Users, label: 'Nhân viên', adminOnly: true },
  { to: '/admin/shifts', icon: Calendar, label: 'Ca làm việc' },
  { to: '/admin/tables', icon: Table2, label: 'Bàn' },
  { to: '/admin/inventory', icon: Warehouse, label: 'Kho' },
  { to: '/admin/suppliers', icon: Truck, label: 'Nhà cung cấp' },
  { to: '/admin/reports', icon: BarChart3, label: 'Báo cáo' },
  { to: '/admin/settings', icon: Settings, label: 'Cài đặt' },
];

/** Admin Dashboard layout với sidebar collapsible */
export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.vaiTro === 'ADMIN',
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ============================================================
          SIDEBAR
          ============================================================ */}
      <aside
        className={cn(
          'flex flex-col border-r bg-card transition-all duration-300 shrink-0',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center h-16 px-4 border-b gap-3', collapsed && 'justify-center px-0')}>
          <span className="text-2xl">🧋</span>
          {!collapsed && (
            <span className="font-bold text-lg text-primary">MilkTea Admin</span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {visibleItems.map((item) => {
              const active = isActive(item.to);
              const NavLink = (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    collapsed && 'justify-center px-0',
                  )}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );

              return collapsed ? (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                NavLink
              );
            })}
          </nav>
        </ScrollArea>

        {/* User info + logout */}
        <div className="border-t p-3">
          {user && (
            <div className={cn('flex items-center gap-3 mb-3', collapsed && 'justify-center')}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user.anhDaiDien} alt={user.hoTen} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {getInitials(user.hoTen)}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.hoTen}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.vaiTro}</p>
                </div>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full text-muted-foreground hover:text-destructive',
              collapsed ? 'px-0 justify-center' : '',
            )}
            onClick={handleLogout}
            aria-label="Đăng xuất"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">Đăng xuất</span>}
          </Button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -translate-y-1/2 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors"
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* ============================================================
          MAIN CONTENT AREA
          ============================================================ */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b px-6 bg-background shrink-0">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              {/* Breadcrumb tự động từ pathname */}
              Admin / {location.pathname.split('/').filter(Boolean).slice(1).join(' / ') || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" target="_blank" aria-label="Xem customer web">
                <Package className="h-4 w-4 mr-1.5" />
                Customer Web
              </Link>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main ref={mainRef} className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
