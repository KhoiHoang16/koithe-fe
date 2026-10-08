import { ArrowUp, ArrowDown, ShoppingBag, Users, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const REVENUE_DATA = [
  { date: 'T2', revenue: 4200000, orders: 84 },
  { date: 'T3', revenue: 3800000, orders: 76 },
  { date: 'T4', revenue: 5100000, orders: 102 },
  { date: 'T5', revenue: 4600000, orders: 92 },
  { date: 'T6', revenue: 6800000, orders: 136 },
  { date: 'T7', revenue: 7200000, orders: 144 },
  { date: 'CN', revenue: 5500000, orders: 110 },
];

const RECENT_ORDERS = [
  { id: 'DH001234', customer: 'Nguyễn Văn A', amount: 125000, status: 'Đang giao', time: '5 phút' },
  { id: 'DH001233', customer: 'Trần Thị B', amount: 85000, status: 'Đã xác nhận', time: '12 phút' },
  { id: 'DH001232', customer: 'Lê Văn C', amount: 210000, status: 'Hoàn thành', time: '25 phút' },
  { id: 'DH001231', customer: 'Phạm Thị D', amount: 65000, status: 'Đang chuẩn bị', time: '30 phút' },
  { id: 'DH001230', customer: 'Hoàng Văn E', amount: 175000, status: 'Hoàn thành', time: '45 phút' },
];

const STAT_CARDS = [
  {
    title: 'Doanh thu hôm nay',
    value: '5.500.000đ',
    change: '+12.5%',
    positive: true,
    icon: DollarSign,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950',
  },
  {
    title: 'Đơn hàng hôm nay',
    value: '110',
    change: '+8.2%',
    positive: true,
    icon: ShoppingBag,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    title: 'Khách hàng mới',
    value: '24',
    change: '-3.1%',
    positive: false,
    icon: Users,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    title: 'Giá trị TB/đơn',
    value: '50.000đ',
    change: '+5.4%',
    positive: true,
    icon: TrendingUp,
    color: 'text-primary',
    bg: 'bg-primary/20',
  },
];

const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'default' }> = {
  'Hoàn thành': { label: 'Hoàn thành', variant: 'success' },
  'Đang giao': { label: 'Đang giao', variant: 'info' },
  'Đang chuẩn bị': { label: 'Đang chuẩn bị', variant: 'warning' },
  'Đã xác nhận': { label: 'Đã xác nhận', variant: 'default' },
};

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

export function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tổng quan hoạt động kinh doanh hôm nay
        </p>
      </div>

      {/* ============================================================
          STAT CARDS
          ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.title} className="overflow-hidden bg-gradient-to-br from-background to-secondary/30 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground truncate">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {card.positive ? (
                      <ArrowUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${card.positive ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {card.change} so với hôm qua
                    </span>
                  </div>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ============================================================
          REVENUE CHART
          ============================================================ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Doanh thu 7 ngày qua</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Tổng: 37.200.000đ</p>
          </div>
          <Badge variant="success">+18.5% so với tuần trước</Badge>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [`${formatVND(Number(value || 0))}đ`, 'Doanh thu']}
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
        </CardContent>
      </Card>

      {/* ============================================================
          RECENT ORDERS TABLE
          ============================================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng mới nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-3 font-medium">Mã đơn</th>
                  <th className="text-left py-3 font-medium">Khách hàng</th>
                  <th className="text-right py-3 font-medium">Tổng tiền</th>
                  <th className="text-center py-3 font-medium">Trạng thái</th>
                  <th className="text-right py-3 font-medium">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((order) => {
                  const status = statusMap[order.status];
                  return (
                    <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 font-mono text-xs">{order.id}</td>
                      <td className="py-3">{order.customer}</td>
                      <td className="py-3 text-right font-medium">
                        {formatVND(order.amount)}đ
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant={status?.variant ?? 'default'} className="text-xs">
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right text-muted-foreground text-xs">
                        {order.time} trước
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
