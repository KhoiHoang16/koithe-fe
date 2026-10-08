import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { orderApi } from '@/features/orders/api/order-api';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';
import type { OrderStatus } from '@/shared/types/order.types';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

const STATUS_OPTIONS: { id: OrderStatus | 'ALL'; label: string; color?: string }[] = [
  { id: 'ALL', label: 'Tất cả đơn' },
  { id: 'PENDING', label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  { id: 'CONFIRMED', label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  { id: 'PREPARING', label: 'Đang pha chế', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  { id: 'SHIPPING', label: 'Đang giao', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  { id: 'COMPLETED', label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  { id: 'CANCELLED', label: 'Đã hủy', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
];

export function OrdersPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => orderApi.getOrders(),
    refetchInterval: 15000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      orderApi.updateOrderStatus(orderId, status),
    onSuccess: (updated) => {
      toast.success(`Đã cập nhật trạng thái đơn ${updated.maDonHang}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });

  const filteredOrders = (orders || []).filter((o) => {
    const matchStatus = selectedStatus === 'ALL' || o.trangThai === selectedStatus;
    const matchSearch =
      o.maDonHang.toLowerCase().includes(search.toLowerCase()) ||
      o.soDienThoai.includes(search) ||
      o.khachHangTen.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (isLoading) return <LoadingScreen message="Đang tải danh sách đơn hàng..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý & Điều phối đơn hàng</h1>
          <p className="text-muted-foreground text-xs">Theo dõi thời gian thực, duyệt đơn và chuyển trạng thái pha chế</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card className="p-4 border">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã đơn, sĐT hoặc tên khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {STATUS_OPTIONS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedStatus === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
              <tr>
                <th className="p-3">Mã đơn</th>
                <th className="p-3">Khách hàng</th>
                <th className="p-3">Loại đơn</th>
                <th className="p-3">Thanh toán</th>
                <th className="p-3">Tổng tiền</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Cập nhật nhanh</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((o) => {
                const statusMeta = STATUS_OPTIONS.find((s) => s.id === o.trangThai);

                return (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">{o.maDonHang}</td>
                    <td className="p-3">
                      <div className="font-bold text-foreground">{o.khachHangTen}</div>
                      <div className="text-[11px] text-muted-foreground">{o.soDienThoai}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px]">
                        {o.loaiDonHang === 'DELIVERY' ? 'Giao hàng' : o.loaiDonHang === 'TAKEAWAY' ? 'Mang đi' : `Bàn ${o.soBan || ''}`}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-xs">{o.phuongThucThanhToan}</div>
                      <span className={`text-[10px] ${o.trangThaiThanhToan === 'SUCCESS' ? 'text-emerald-600 font-bold' : 'text-amber-600'}`}>
                        {o.trangThaiThanhToan === 'SUCCESS' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-foreground">{formatVND(o.tongThanhToan)}</td>
                    <td className="p-3">
                      <Badge className={statusMeta?.color || 'bg-muted'}>{statusMeta?.label}</Badge>
                    </td>
                    <td className="p-3">
                      {o.trangThai === 'PENDING' && (
                        <Button size="sm" className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white" onClick={() => updateStatusMutation.mutate({ orderId: o.id, status: 'CONFIRMED' })}>
                          Xác nhận đơn
                        </Button>
                      )}
                      {o.trangThai === 'CONFIRMED' && (
                        <Button size="sm" className="h-7 text-[11px] bg-purple-600 hover:bg-purple-700 text-white" onClick={() => updateStatusMutation.mutate({ orderId: o.id, status: 'PREPARING' })}>
                          Pha chế
                        </Button>
                      )}
                      {o.trangThai === 'PREPARING' && (
                        <Button size="sm" className="h-7 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => updateStatusMutation.mutate({ orderId: o.id, status: 'SHIPPING' })}>
                          Giao hàng
                        </Button>
                      )}
                      {o.trangThai === 'SHIPPING' && (
                        <Button size="sm" className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateStatusMutation.mutate({ orderId: o.id, status: 'COMPLETED' })}>
                          Hoàn thành
                        </Button>
                      )}
                      {o.trangThai === 'COMPLETED' && <span className="text-emerald-600 font-bold text-[11px]">✓ Đã xong</span>}
                      {o.trangThai === 'CANCELLED' && <span className="text-rose-600 font-bold text-[11px]">✕ Đã hủy</span>}
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link to={`/admin/orders/${o.id}`}>
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
      </Card>
    </div>
  );
}
