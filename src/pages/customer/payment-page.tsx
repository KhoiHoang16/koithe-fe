import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Clock, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { orderApi } from '@/features/orders/api/order-api';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId') || '1001';

  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrderById(orderId),
  });

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleSimulatePayment = async () => {
    setIsVerifying(true);
    toast.info('Đang kiểm tra giao dịch thanh toán...');
    try {
      const res = await orderApi.verifyPayment(orderId);
      if (res.trangThai === 'THANH_CONG') {
        toast.success('Thanh toán thành công!');
        navigate(`/order-success/${orderId}`, { replace: true });
      } else {
        toast.error('Giao dịch chưa hoàn tất');
      }
    } catch {
      toast.error('Không thể xác minh giao dịch');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép vào bộ nhớ tạm');
  };

  if (isLoading || !order) {
    return <LoadingScreen message="Đang khởi tạo cổng thanh toán QR..." />;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl animate-fade-in">
      <Card className="p-6 text-center space-y-6 shadow-lg border">
        {/* Header Badge */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="text-left">
            <span className="text-xs text-muted-foreground">Mã đơn hàng</span>
            <div className="font-bold text-sm text-foreground">{order.maDonHang}</div>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 gap-1">
            <Clock className="h-3.5 w-3.5" /> Hạn thanh toán: {timeFormatted}
          </Badge>
        </div>

        {/* QR Code Container */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Quét mã QR để thanh toán</h2>
          <p className="text-xs text-muted-foreground">Mở ứng dụng ngân hàng hoặc ví điện tử để quét mã</p>

          <div className="mx-auto w-60 h-60 bg-white p-4 rounded-2xl border-2 border-primary/20 shadow-md flex flex-col items-center justify-center">
            {/* VietQR Mock Image */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=KOITHE_ORDER_${order.maDonHang}`}
              alt="Payment QR Code"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-2xl font-bold text-primary">{formatVND(order.tongThanhToan)}</div>
        </div>

        {/* Payment Account Transfer Details */}
        <div className="bg-muted/40 p-4 rounded-xl text-xs space-y-2 text-left border">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Ngân hàng:</span>
            <span className="font-semibold">MBBank (Ngân hàng Quân Đội)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Số tài khoản:</span>
            <div className="flex items-center gap-1 font-mono font-bold">
              <span>999988887777</span>
              <Button variant="ghost" size="icon-sm" onClick={() => handleCopy('999988887777')}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Nội dung chuyển khoản:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-primary">
              <span>{order.maDonHang}</span>
              <Button variant="ghost" size="icon-sm" onClick={() => handleCopy(order.maDonHang)}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button size="lg" className="w-full font-bold gap-2" onClick={handleSimulatePayment} isLoading={isVerifying}>
            <CheckCircle2 className="h-5 w-5" /> Tôi đã thanh toán xong
          </Button>

          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate('/menu')}>
            Hủy và quay lại mua sắm
          </Button>
        </div>
      </Card>
    </div>
  );
}
