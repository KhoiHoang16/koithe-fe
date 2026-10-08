import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Printer, User, Store } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { orderApi } from '@/features/orders/api/order-api';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = id || '1001';

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'order', orderId],
    queryFn: () => orderApi.getOrderById(orderId),
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !order) return <LoadingScreen message="Đang tải chi tiết đơn hàng..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <Link to="/admin/orders" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách đơn
        </Link>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold" onClick={handlePrint}>
          <Printer className="h-4 w-4" /> In hóa đơn
        </Button>
      </div>

      <Card className="p-6 space-y-6 border print:shadow-none print:border-none">
        {/* Printable Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧋</span>
              <span className="text-xl font-extrabold">MILKTEA POS & OMNICHANNEL</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Đơn hàng: <span className="font-bold text-foreground">{order.maDonHang}</span></p>
            <p className="text-[11px] text-muted-foreground">Thời gian: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
          </div>
          <div className="text-right">
            <Badge className="bg-primary/10 text-primary font-bold text-xs">{order.trangThai}</Badge>
            <div className="text-xs font-semibold text-muted-foreground mt-2">
              Loại đơn: {order.loaiDonHang === 'DELIVERY' ? 'Giao hàng' : order.loaiDonHang === 'TAKEAWAY' ? 'Mang đi' : `Tại bàn ${order.soBan || ''}`}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-muted/40 p-4 rounded-xl space-y-1">
            <h3 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" /> Thông tin khách hàng
            </h3>
            <div><span className="text-muted-foreground">Họ tên:</span> <span className="font-semibold">{order.khachHangTen}</span></div>
            <div><span className="text-muted-foreground">SĐT:</span> <span className="font-semibold">{order.soDienThoai}</span></div>
            {order.email && <div><span className="text-muted-foreground">Email:</span> <span>{order.email}</span></div>}
            {order.diaChiGiaoHang && <div><span className="text-muted-foreground">Địa chỉ:</span> <span>{order.diaChiGiaoHang}</span></div>}
          </div>

          <div className="bg-muted/40 p-4 rounded-xl space-y-1">
            <h3 className="font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Store className="h-4 w-4 text-primary" /> Thanh toán & Ghi chú
            </h3>
            <div><span className="text-muted-foreground">Phương thức:</span> <span className="font-semibold">{order.phuongThucThanhToan}</span></div>
            <div><span className="text-muted-foreground">Trạng thái TT:</span> <span className="font-bold text-emerald-600">{order.trangThaiThanhToan}</span></div>
            {order.ghiChu && <div className="italic text-muted-foreground mt-2">"{order.ghiChu}"</div>}
          </div>
        </div>

        {/* Item Table */}
        <div>
          <h3 className="font-bold text-xs mb-3">Danh sách món ăn</h3>
          <table className="w-full text-left text-xs border">
            <thead className="bg-muted font-semibold border-b">
              <tr>
                <th className="p-2.5">STT</th>
                <th className="p-2.5">Tên món</th>
                <th className="p-2.5">Size</th>
                <th className="p-2.5">Tùy chọn</th>
                <th className="p-2.5 text-center">SL</th>
                <th className="p-2.5 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.chiTietList.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2.5">{idx + 1}</td>
                  <td className="p-2.5 font-bold">{item.productName}</td>
                  <td className="p-2.5">{item.variantName}</td>
                  <td className="p-2.5 text-muted-foreground text-[11px]">
                    Đường {item.duongLevel}, Đá {item.daLevel}
                    {item.toppings?.length ? `, Topping: ${item.toppings.map((t) => t.tenTopping).join(', ')}` : ''}
                  </td>
                  <td className="p-2.5 text-center font-bold">{item.soLuong}</td>
                  <td className="p-2.5 text-right font-bold">{formatVND(item.thanhTien)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end text-xs pt-4 border-t">
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Tiền hàng:</span>
              <span>{formatVND(order.tongTienHang)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Phí giao hàng:</span>
              <span>{formatVND(order.phiGiaoHang)}</span>
            </div>
            {order.giamGia > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Giảm giá:</span>
                <span>-{formatVND(order.giamGia)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold border-t pt-2 text-foreground">
              <span>Tổng thanh toán:</span>
              <span className="text-primary text-base">{formatVND(order.tongThanhToan)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
