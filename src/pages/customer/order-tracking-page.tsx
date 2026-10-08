import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Clock, MapPin, PhoneCall, ShieldCheck, Truck, Coffee } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { orderApi } from '@/features/orders/api/order-api';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';
import type { OrderStatus } from '@/shared/types/order.types';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

const STEPS: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  { status: 'PENDING', label: 'Đã nhận đơn', desc: 'Đơn hàng đang chờ nhân viên kiểm tra', icon: Clock },
  { status: 'CONFIRMED', label: 'Xác nhận đơn', desc: 'Đơn hàng đã được quán chấp nhận', icon: ShieldCheck },
  { status: 'PREPARING', label: 'Đang pha chế', desc: 'Barista đang chuẩn bị đồ uống cho bạn', icon: Coffee },
  { status: 'SHIPPING', label: 'Đang giao hàng', desc: 'Tài xế đang vận chuyển đến vị trí của bạn', icon: Truck },
  { status: 'COMPLETED', label: 'Giao thành công', desc: 'Đơn hàng đã được bàn giao hoàn tất', icon: CheckCircle2 },
];

export function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = id || '1001';

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', 'tracking', orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    refetchInterval: 10000, // Poll every 10 seconds for real-time tracking
  });

  if (isLoading || !order) return <LoadingScreen message="Đang cập nhật tiến trình đơn hàng..." />;

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.trangThai);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 1;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
      <Link to="/profile/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Lịch sử đơn hàng
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Đơn hàng {order.maDonHang}</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">
              {order.trangThai}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Thời gian đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>

        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <PhoneCall className="h-3.5 w-3.5" /> Gọi Hotline hỗ trợ
        </Button>
      </div>

      {/* Progress Timeline */}
      <Card className="p-6 mb-8 border shadow-sm">
        <h2 className="text-base font-bold mb-6">Trạng thái xử lý</h2>

        <div className="relative space-y-8 before:absolute before:inset-0 before:left-5 before:top-2 before:h-[90%] before:w-0.5 before:bg-muted">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isPassed = idx <= activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div key={step.status} className="relative flex items-start gap-4">
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all ${
                    isPassed
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background text-muted-foreground border-input'
                  } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="pt-1">
                  <div className={`text-sm font-bold ${isPassed ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Delivery & Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-5">
          <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" /> Địa chỉ nhận hàng
          </h3>
          <div className="text-sm font-semibold">{order.khachHangTen}</div>
          <div className="text-xs text-muted-foreground mt-1">{order.soDienThoai}</div>
          <div className="text-xs mt-2 text-foreground">{order.diaChiGiaoHang || 'Nhận tại cửa hàng'}</div>
        </Card>

        <Card className="p-5">
          <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3">Tóm tắt thanh toán</h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phương thức:</span>
              <span className="font-semibold">{order.phuongThucThanhToan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trạng thái:</span>
              <span className="font-semibold text-primary">{order.trangThaiThanhToan}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold text-sm">
              <span>Tổng tiền:</span>
              <span className="text-primary">{formatVND(order.tongThanhToan)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Order Item List */}
      <Card className="p-5">
        <h3 className="text-sm font-bold mb-4">Chi tiết món ăn ({order.chiTietList.length} món)</h3>
        <div className="space-y-3">
          {order.chiTietList.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs border-b pb-2 last:border-0 last:pb-0">
              <div>
                <div className="font-bold">{item.soLuong}x {item.productName} ({item.variantName})</div>
                <div className="text-[11px] text-muted-foreground">Đường {item.duongLevel} • Đá {item.daLevel}</div>
              </div>
              <div className="font-bold text-foreground">{formatVND(item.thanhTien)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
