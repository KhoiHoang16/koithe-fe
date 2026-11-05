import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  Users,
  TrendingUp,
  DollarSign,
  Coffee,
  RefreshCw,
  ArrowRight,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { useAuthStore } from '@/shared/stores/auth-store';
import { reportApi } from '@/features/report/api/report-api';
import { presetRange } from '@/features/report/lib/report-data';
import { dateLabel } from '@/features/report/lib/presentation';
import { orderApi } from '@/features/orders/api/order-api';
import { customerApi } from '@/features/customer/api/customer-api';
import type { OrderStatus } from '@/shared/types/order.types';

const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; variant: 'success' | 'warning' | 'info' | 'default' | 'destructive' }
> = {
  PENDING: { label: 'Chờ xác nhận', variant: 'warning' },
  CONFIRMED: { label: 'Đã thanh toán', variant: 'info' },
  PREPARING: { label: 'Đang pha chế', variant: 'warning' },
  SHIPPING: { label: 'Sẵn sàng', variant: 'info' },
  COMPLETED: { label: 'Hoàn thành', variant: 'success' },
  CANCELLED: { label: 'Đã hủy', variant: 'destructive' },
};

const SERVICE_TYPE_LABEL: Record<string, string> = {
  AT_TABLE: 'Phục vụ tại bàn',
  TAKEAWAY: 'Đến lấy tại quán',
  DELIVERY: 'Giao tận nơi',
};

function formatVND(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))}đ`;
}

function formatOrderTime(iso: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function buildFullSevenDays(
  from: string,
  to: string,
  daily: { date: string; revenue: number; orders: number }[],
) {
  const map = new Map(daily.map((d) => [d.date, d]));
  const result: { date: string; label: string; revenue: number; orders: number }[] = [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return daily.map((d) => ({
      ...d,
      label: dateLabel(d.date).slice(0, 5),
    }));
  }
  const cursor = new Date(start);
  while (cursor <= end && result.length < 14) {
    const key = cursor.toISOString().slice(0, 10);
    const found = map.get(key);
    result.push({
      date: key,
      label: dateLabel(key).slice(0, 5),
      revenue: found?.revenue ?? 0,
      orders: found?.orders ?? 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const todayRange = useMemo(() => presetRange('today'), []);
  const weekRange = useMemo(() => presetRange('week'), []);

  const todayReportQuery = useQuery({
    queryKey: ['dashboard', 'report-today', user?.id, todayRange],
    queryFn: ({ signal }) => reportApi.summary(todayRange, signal),
  });

  const weekReportQuery = useQuery({
    queryKey: ['dashboard', 'report-week', user?.id, weekRange],
    queryFn: ({ signal }) => reportApi.summary(weekRange, signal),
  });

  const recentOrdersQuery = useQuery({
    queryKey: ['dashboard', 'recent-orders'],
    queryFn: () => orderApi.getOrders({ page: 0, size: 6 }),
  });

  const customersQuery = useQuery({
    queryKey: ['dashboard', 'customers-count'],
    queryFn: () => customerApi.getAll(),
  });

  const isRefreshing =
    todayReportQuery.isFetching ||
    weekReportQuery.isFetching ||
    recentOrdersQuery.isFetching ||
    customersQuery.isFetching;

  const handleRefreshAll = () => {
    void todayReportQuery.refetch();
    void weekReportQuery.refetch();
    void recentOrdersQuery.refetch();
    void customersQuery.refetch();
  };

  const todayRevenue = todayReportQuery.data?.revenue ?? 0;
  const todayOrders = todayReportQuery.data?.orders ?? 0;
  const todayCups = todayReportQuery.data?.cups ?? 0;

  const weekRevenue = weekReportQuery.data?.revenue ?? 0;
  const weekOrders = weekReportQuery.data?.orders ?? 0;
  const weekCups = weekReportQuery.data?.cups ?? 0;

  const totalCustomers = customersQuery.data?.length ?? 0;

  const avgOrderValue =
    todayOrders > 0
      ? todayRevenue / todayOrders
      : weekOrders > 0
        ? weekRevenue / weekOrders
        : 0;

  const chartData = useMemo(
    () =>
      buildFullSevenDays(
        weekRange.from,
        weekRange.to,
        weekReportQuery.data?.daily ?? [],
      ),
    [weekRange.from, weekRange.to, weekReportQuery.data?.daily],
  );

  const statCards = [
    {
      title: 'Doanh thu hôm nay',
      value: todayReportQuery.isPending ? '...' : formatVND(todayRevenue),
      subtext: `7 ngày qua: ${formatVND(weekRevenue)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Đơn hàng hôm nay',
      value: todayReportQuery.isPending ? '...' : String(todayOrders),
      subtext: `7 ngày qua: ${weekOrders} đơn (${weekCups} ly)`,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Khách hàng thành viên',
      value: customersQuery.isPending ? '...' : String(totalCustomers),
      subtext: `Ly bán hôm nay: ${todayCups} ly`,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Giá trị TB / đơn',
      value:
        todayReportQuery.isPending && weekReportQuery.isPending
          ? '...'
          : formatVND(avgOrderValue),
      subtext: todayOrders > 0 ? 'Tính theo đơn hôm nay' : 'Tính theo 7 ngày qua',
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/20',
    },
  ];

  const recentOrders = recentOrdersQuery.data ?? [];
  const topProducts = weekReportQuery.data?.topProducts ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tổng quan hoạt động kinh doanh thời gian thực ({dateLabel(todayRange.to)})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefreshAll} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới số liệu
          </Button>
          <Button asChild>
            <Link to="/admin/reports">
              Báo cáo chi tiết
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ============================================================
          STAT CARDS
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="overflow-hidden bg-gradient-to-br from-background to-secondary/30 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground truncate">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-2 truncate">{card.subtext}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ============================================================
          REVENUE CHART + TOP PRODUCTS (7 DAYS)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Doanh thu 7 ngày qua</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Từ {dateLabel(weekRange.from)} đến {dateLabel(weekRange.to)} · Tổng:{' '}
                <strong className="text-foreground">{formatVND(weekRevenue)}</strong>
              </p>
            </div>
            <Badge variant="success">{weekOrders} đơn hàng</Badge>
          </CardHeader>
          <CardContent>
            {weekReportQuery.isPending ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Đang tải biểu đồ doanh thu...
              </div>
            ) : weekReportQuery.isError ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-destructive">Không thể tải dữ liệu biểu đồ doanh thu.</p>
                <Button variant="outline" size="sm" onClick={() => void weekReportQuery.refetch()}>
                  Thử lại
                </Button>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v: number) =>
                        new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(v)
                      }
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={64}
                    />
                    <Tooltip
                      formatter={(value) => [formatVND(Number(value || 0)), 'Doanh thu']}
                      labelFormatter={(label) => `Ngày ${String(label)}`}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--background)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Best Selling Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top món bán chạy</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Trong 7 ngày gần nhất</p>
            </div>
            <Coffee className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {weekReportQuery.isPending ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Đang tải top sản phẩm...
              </div>
            ) : topProducts.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu sản phẩm bán chạy trong 7 ngày qua.
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          idx < 3
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Size {item.size || 'M'} · Đã bán {item.quantity} ly
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap">
                      {formatVND(item.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============================================================
          RECENT ORDERS TABLE
          ============================================================ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Đơn hàng mới nhất</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Cập nhật trực tiếp từ hệ thống đơn hàng đa kênh
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/orders">Xem tất cả đơn hàng</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrdersQuery.isPending ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Đang tải danh sách đơn hàng mới nhất...
            </div>
          ) : recentOrdersQuery.isError ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm text-destructive">Không thể tải danh sách đơn hàng.</p>
              <Button variant="outline" size="sm" onClick={() => void recentOrdersQuery.refetch()}>
                Thử lại
              </Button>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Chưa có đơn hàng nào trên hệ thống.
            </div>
          ) : (
            <div className="overflow-x-auto" data-lenis-prevent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-3 px-2 font-medium whitespace-nowrap">Mã đơn</th>
                    <th className="text-left py-3 px-2 font-medium whitespace-nowrap">
                      Khách hàng
                    </th>
                    <th className="text-left py-3 px-2 font-medium whitespace-nowrap">
                      Hình thức
                    </th>
                    <th className="text-right py-3 px-2 font-medium whitespace-nowrap">
                      Tổng thanh toán
                    </th>
                    <th className="text-center py-3 px-2 font-medium whitespace-nowrap">
                      Trạng thái
                    </th>
                    <th className="text-right py-3 px-2 font-medium whitespace-nowrap">
                      Thời gian
                    </th>
                    <th className="text-right py-3 px-2 font-medium whitespace-nowrap">
                      Chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const statusInfo = ORDER_STATUS_META[order.trangThai] ?? {
                      label: order.trangThai,
                      variant: 'default' as const,
                    };
                    return (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2 font-mono text-xs font-semibold">
                          {order.maDonHang}
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium">
                            {order.khachHangTen || 'Khách tại quầy / Vãng lai'}
                          </div>
                          {order.soDienThoai && (
                            <div className="text-xs text-muted-foreground">{order.soDienThoai}</div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-xs text-muted-foreground whitespace-nowrap">
                          {SERVICE_TYPE_LABEL[order.loaiDonHang] ?? order.loaiDonHang}
                        </td>
                        <td className="py-3 px-2 text-right font-semibold whitespace-nowrap">
                          {formatVND(order.tongThanhToan)}
                        </td>
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <Badge variant={statusInfo.variant} className="text-xs">
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right text-muted-foreground text-xs whitespace-nowrap">
                          {formatOrderTime(order.createdAt)}
                        </td>
                        <td className="py-3 px-2 text-right whitespace-nowrap">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/orders/${order.id}`} title="Xem chi tiết đơn hàng">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
