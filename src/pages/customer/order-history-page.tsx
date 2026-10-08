import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Clock, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { orderApi } from '@/features/orders/api/order-api';
import type { OrderStatus } from '@/shared/types/order.types';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

const STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  PREPARING: { label: 'Đang pha chế', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  SHIPPING: { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
};

export function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | OrderStatus>('ALL');
  const [search, setSearch] = useState('');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['customer', 'orders'],
    queryFn: () => orderApi.getOrders(),
  });

  const filteredOrders = (orders || []).filter((order) => {
    const matchStatus = activeTab === 'ALL' || order.trangThai === activeTab;
    const matchSearch = order.maDonHang.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (isLoading) return <LoadingScreen message="Đang tải lịch sử đơn hàng..." />;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Lịch sử đơn hàng</h1>
        <p className="text-muted-foreground text-sm">Theo dõi và xem lại các đơn hàng bạn đã đặt</p>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn hàng (VD: KOI-20261008)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PREPARING', label: 'Đang xử lý' },
            { id: 'SHIPPING', label: 'Đang giao' },
            { id: 'COMPLETED', label: 'Hoàn thành' },
            { id: 'CANCELLED', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order Feed */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Không tìm thấy đơn hàng"
          description="Bạn chưa có đơn hàng nào trong mục này."
          action={
            <Button size="sm" asChild className="mt-2">
              <Link to="/menu">Đặt ngay đồ uống</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = STATUS_MAP[order.trangThai] || STATUS_MAP.PENDING;

            return (
              <Card key={order.id} className="p-5 border hover:border-primary/50 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{order.maDonHang}</span>
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" /> {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{formatVND(order.tongThanhToan)}</div>
                    <div className="text-[11px] text-muted-foreground">{order.loaiDonHang === 'DELIVERY' ? 'Giao hàng tận nơi' : 'Nhận tại cửa hàng'}</div>
                  </div>
                </div>

                {/* Items Brief */}
                <div className="space-y-1.5 mb-4">
                  {order.chiTietList.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {item.soLuong}x {item.productName} ({item.variantName})
                      </span>
                      <span>{formatVND(item.thanhTien)}</span>
                    </div>
                  ))}
                </div>

                {/* Card Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" asChild className="text-xs gap-1">
                    <Link to={`/order-tracking/${order.maDonHang}`}>
                      <Eye className="h-3.5 w-3.5" /> Theo dõi tiến trình
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="text-xs gap-1">
                    <Link to="/menu">
                      <RefreshCw className="h-3.5 w-3.5" /> Đặt lại đơn này
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
