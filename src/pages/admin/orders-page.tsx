import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Eye, Printer, User, Store, FileText, ShoppingBag } from 'lucide-react';
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
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

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

  useEffect(() => {
    if (filteredOrders.length === 0) {
      setSelectedOrderId(null);
      return;
    }
    if (selectedOrderId === null || !filteredOrders.some((o) => o.id === selectedOrderId)) {
      setSelectedOrderId(filteredOrders[0].id);
    }
  }, [filteredOrders, selectedOrderId]);

  const selectedOrder = filteredOrders.find((o) => o.id === selectedOrderId) || null;

  if (isLoading) return <LoadingScreen message="Đang tải danh sách đơn hàng..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý & Điều phối đơn hàng</h1>
          <p className="text-muted-foreground text-xs">
            Chọn hóa đơn ở danh sách bên trái (DSHD) để xem chi tiết hóa đơn (CTHD) ở sub-form bên phải
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card className="p-4 border">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã đơn, SĐT hoặc tên khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {STATUS_OPTIONS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id as OrderStatus | 'ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedStatus === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Master-Detail Split Layout: DSHD (Left) & CTHD (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: DSHD - Danh sách hóa đơn / đơn hàng */}
        <Card className="lg:col-span-7 overflow-hidden border">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Danh sách hóa đơn (DSHD)</h2>
            </div>
            <Badge variant="secondary" className="text-xs">
              {filteredOrders.length} đơn
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Mã HĐ</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Loại đơn</th>
                  <th className="p-3">Tổng tiền</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Không có đơn hàng nào khớp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const statusMeta = STATUS_OPTIONS.find((s) => s.id === o.trangThai);
                    const isSelected = o.id === selectedOrder?.id;

                    return (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedOrderId(o.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary/10 hover:bg-primary/15'
                            : 'hover:bg-muted/30'
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-primary">
                          <div className="flex items-center gap-1.5">
                            {isSelected && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                            <span>{o.maDonHang}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-foreground">{o.khachHangTen || 'Khách lẻ'}</div>
                          <div className="text-[11px] text-muted-foreground">{o.soDienThoai}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px]">
                            {o.loaiDonHang === 'DELIVERY'
                              ? 'Giao hàng'
                              : o.loaiDonHang === 'TAKEAWAY'
                                ? 'Mang đi'
                                : `Bàn ${o.soBan || ''}`}
                          </Badge>
                        </td>
                        <td className="p-3 font-bold text-foreground">{formatVND(o.tongThanhToan)}</td>
                        <td className="p-3">
                          <Badge className={statusMeta?.color || 'bg-muted'}>{statusMeta?.label}</Badge>
                        </td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-[11px] gap-1"
                            onClick={() => setSelectedOrderId(o.id)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Xem
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* RIGHT: CTHD - Sub-form Chi tiết hóa đơn */}
        <Card className="lg:col-span-5 border lg:sticky lg:top-4 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Chi tiết hóa đơn (CTHD)</h2>
            </div>
            {selectedOrder && (
              <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" asChild>
                <Link to={`/admin/orders/${selectedOrder.id}`}>
                  <Printer className="h-3.5 w-3.5" /> Bản in
                </Link>
              </Button>
            )}
          </div>

          {!selectedOrder ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Chọn một hóa đơn ở danh sách bên trái (DSHD) để xem chi tiết.
            </div>
          ) : (
            <div className="p-4 space-y-4 text-xs">
              {/* Header & Quick Status Action */}
              <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold font-mono text-primary">
                      {selectedOrder.maDonHang}
                    </span>
                    <Badge
                      className={
                        STATUS_OPTIONS.find((s) => s.id === selectedOrder.trangThai)?.color ||
                        'bg-muted'
                      }
                    >
                      {STATUS_OPTIONS.find((s) => s.id === selectedOrder.trangThai)?.label}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Ngày tạo: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedOrder.trangThai === 'PENDING' && (
                    <Button
                      size="sm"
                      className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          orderId: selectedOrder.id,
                          status: 'CONFIRMED',
                        })
                      }
                    >
                      Xác nhận đơn
                    </Button>
                  )}
                  {selectedOrder.trangThai === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      className="h-7 text-[11px] bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          orderId: selectedOrder.id,
                          status: 'PREPARING',
                        })
                      }
                    >
                      Chuyển pha chế
                    </Button>
                  )}
                  {selectedOrder.trangThai === 'PREPARING' && (
                    <Button
                      size="sm"
                      className="h-7 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          orderId: selectedOrder.id,
                          status: 'SHIPPING',
                        })
                      }
                    >
                      Giao / Sẵn sàng
                    </Button>
                  )}
                  {selectedOrder.trangThai === 'SHIPPING' && (
                    <Button
                      size="sm"
                      className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          orderId: selectedOrder.id,
                          status: 'COMPLETED',
                        })
                      }
                    >
                      Hoàn thành
                    </Button>
                  )}
                </div>
              </div>

              {/* Customer & Payment Sub-grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-muted/40 p-3 rounded-xl space-y-1">
                  <div className="font-bold text-foreground flex items-center gap-1.5 mb-1">
                    <User className="h-3.5 w-3.5 text-primary" /> Khách hàng
                  </div>
                  <div>
                    <span className="text-muted-foreground">Họ tên:</span>{' '}
                    <span className="font-semibold">{selectedOrder.khachHangTen || 'Khách lẻ'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SĐT:</span>{' '}
                    <span className="font-semibold">{selectedOrder.soDienThoai || '—'}</span>
                  </div>
                  {selectedOrder.diaChiGiaoHang && (
                    <div className="break-words">
                      <span className="text-muted-foreground">Nhận tại:</span>{' '}
                      <span>{selectedOrder.diaChiGiaoHang}</span>
                    </div>
                  )}
                </div>

                <div className="bg-muted/40 p-3 rounded-xl space-y-1">
                  <div className="font-bold text-foreground flex items-center gap-1.5 mb-1">
                    <Store className="h-3.5 w-3.5 text-primary" /> Phục vụ & Thanh toán
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hình thức:</span>{' '}
                    <span className="font-semibold">
                      {selectedOrder.loaiDonHang === 'DELIVERY'
                        ? 'Giao hàng'
                        : selectedOrder.loaiDonHang === 'TAKEAWAY'
                          ? 'Mang đi'
                          : `Tại bàn ${selectedOrder.soBan || ''}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phương thức:</span>{' '}
                    <span className="font-semibold">{selectedOrder.phuongThucThanhToan}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">TT Thanh toán:</span>{' '}
                    <span
                      className={`font-bold ${
                        selectedOrder.trangThaiThanhToan === 'SUCCESS'
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {selectedOrder.trangThaiThanhToan === 'SUCCESS'
                        ? 'Đã thanh toán'
                        : 'Chưa thanh toán'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTHD Items Table */}
              <div className="space-y-2">
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Danh sách món trong đơn ({selectedOrder.chiTietList.length} dòng)</span>
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 border-b font-semibold text-muted-foreground">
                      <tr>
                        <th className="p-2">Món & Tùy chọn</th>
                        <th className="p-2 text-center">Size</th>
                        <th className="p-2 text-center">SL</th>
                        <th className="p-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedOrder.chiTietList.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <div className="font-bold text-foreground">{item.productName}</div>
                            <div className="text-[11px] text-muted-foreground">
                              Đường {item.duongLevel} • Đá {item.daLevel}
                            </div>
                            {item.toppings && item.toppings.length > 0 && (
                              <div className="text-[11px] text-primary">
                                + {item.toppings.map((t) => t.tenTopping).join(', ')}
                              </div>
                            )}
                            {item.ghiChu && (
                              <div className="text-[11px] italic text-muted-foreground">
                                Ghi chú: "{item.ghiChu}"
                              </div>
                            )}
                          </td>
                          <td className="p-2 text-center font-medium">{item.variantName}</td>
                          <td className="p-2 text-center font-bold">{item.soLuong}</td>
                          <td className="p-2 text-right font-bold">{formatVND(item.thanhTien)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-1.5 pt-2 border-t">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tiền hàng:</span>
                  <span>{formatVND(selectedOrder.tongTienHang)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí giao hàng:</span>
                  <span>{formatVND(selectedOrder.phiGiaoHang)}</span>
                </div>
                {selectedOrder.giamGia > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Giảm giá:</span>
                    <span>-{formatVND(selectedOrder.giamGia)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t pt-2 text-foreground">
                  <span>Tổng thanh toán:</span>
                  <span className="text-primary text-base">
                    {formatVND(selectedOrder.tongThanhToan)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
