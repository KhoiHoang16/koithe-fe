import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, Copy, CreditCard } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';
import { ApiError } from '@/shared/api/http-client';
import { useAuthStore } from '@/shared/stores/auth-store';
import { orderApi } from '@/features/orders/api/order-api';
import { paymentApi, type PaymentResponse } from '@/features/payment/api/payment-api';
import {
  isPendingPayment,
  parseVietQr,
  positiveId,
  readPaymentSession,
  safeGatewayUrl,
} from '@/features/payment/services/payment-session';
import { formatCurrency } from '@/shared/libs/utils';

const METHODS = {
  CHUYEN_KHOAN_QR: 'Chuyển khoản VietQR',
  MOMO: 'Ví MoMo',
  VNPAY: 'Cổng VNPAY',
  TIEN_MAT: 'Tiền mặt',
};

export function PaymentPage({ callback = false }: { callback?: boolean }) {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [imageFailed, setImageFailed] = useState(false);
  const explicitOrderId = positiveId(params.get('orderId'));
  const lastPayment = callback ? readPaymentSession(user?.id) : null;
  const providerReference = params.get('vnp_TxnRef') || params.get('orderId');
  const correlatedPayment =
    lastPayment && providerReference === lastPayment.noiDungVietqr ? lastPayment : null;
  const orderId = explicitOrderId ?? correlatedPayment?.maDonHang ?? null;
  const saved = readPaymentSession(user?.id, orderId);
  const paymentId = params.has('paymentId')
    ? positiveId(params.get('paymentId'))
    : (saved?.id ?? correlatedPayment?.id ?? null);
  const initialPayment = location.state?.payment as PaymentResponse | undefined;
  const cached =
    initialPayment?.id === paymentId && initialPayment?.maDonHang === orderId
      ? initialPayment
      : saved;
  const validIds = !!orderId && !!paymentId;

  const orderQuery = useQuery({
    queryKey: ['payment', 'order', user?.id, orderId],
    queryFn: () => orderApi.getOrderById(orderId!),
    enabled: validIds && !!accessToken,
    retry: false,
  });
  const paymentQuery = useQuery({
    queryKey: ['payment', 'detail', user?.id, orderId, paymentId],
    queryFn: async () => {
      const payment = await paymentApi.getById(paymentId!);
      if (
        payment.id !== paymentId ||
        payment.maDonHang !== orderId ||
        Number(payment.soTien) !== orderQuery.data?.tongThanhToan
      ) {
        throw new Error('Giao dịch không khớp với đơn hàng.');
      }
      return payment;
    },
    enabled: validIds && !!accessToken && !!orderQuery.data,
    retry: false,
    refetchInterval: (query) =>
      query.state.error || orderQuery.data?.trangThai === 'CANCELLED'
        ? false
        : isPendingPayment(query.state.data?.trangThai ?? '')
          ? 3000
          : false,
  });
  const payment = paymentQuery.data;
  const order = orderQuery.data;
  const cancelled = order?.trangThai === 'CANCELLED';
  const pending = !!payment && !cancelled && isPendingPayment(payment.trangThai);
  const successful = !cancelled && payment?.trangThai === 'THANH_CONG';
  const error = orderQuery.error || paymentQuery.error;
  const compatibleCache =
    cached?.id === payment?.id &&
    cached?.maDonHang === payment?.maDonHang &&
    cached?.phuongThucThanhToan === payment?.phuongThucThanhToan &&
    Number(cached?.soTien) === Number(payment?.soTien) &&
    cached?.noiDungVietqr === payment?.noiDungVietqr;
  const redirectUrl = payment?.redirectUrl || (compatibleCache ? cached?.redirectUrl : undefined);
  const qr =
    payment?.phuongThucThanhToan === 'CHUYEN_KHOAN_QR'
      ? parseVietQr(redirectUrl, Number(payment.soTien))
      : null;
  const gatewayUrl = safeGatewayUrl(redirectUrl);

  useEffect(() => {
    if (successful && orderId) navigate('/order-success/' + orderId, { replace: true });
  }, [successful, orderId, navigate]);

  const simulate = useMutation({
    mutationFn: async () => {
      if (
        !import.meta.env.DEV ||
        !payment ||
        !pending ||
        !orderId ||
        payment.phuongThucThanhToan === 'TIEN_MAT'
      ) {
        throw new Error('Không thể mô phỏng giao dịch này.');
      }
      await paymentApi.devSimulateSuccess(orderId, payment.phuongThucThanhToan);
      const verified = await paymentQuery.refetch();
      if (verified.error) throw verified.error;
      if (verified.data?.trangThai !== 'THANH_CONG')
        throw new Error('Giao dịch chưa được xác nhận thành công.');
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Không thể mô phỏng thanh toán.'),
  });
  const verify = async () => {
    const result = await paymentQuery.refetch();
    if (result.error) toast.error('Chưa thể kiểm tra giao dịch. Vui lòng thử lại.');
    else if (result.data?.trangThai === 'THANH_CONG') toast.success('Thanh toán thành công!');
    else if (isPendingPayment(result.data?.trangThai ?? ''))
      toast.info('Giao dịch đang chờ thanh toán.');
    else toast.error('Giao dịch chưa thành công. Vui lòng liên hệ nhân viên.');
  };
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Đã sao chép.');
    } catch {
      toast.error('Không thể sao chép. Vui lòng sao chép thủ công.');
    }
  };

  let message: string | null = null;
  if (!validIds)
    message =
      'Thiếu hoặc sai mã đơn/giao dịch thanh toán. Vui lòng mở trang thanh toán từ đơn hàng vừa đặt.';
  else if (!accessToken)
    message = 'Vui lòng đăng nhập bằng tài khoản đã đặt đơn để xem giao dịch thanh toán.';
  else if (error instanceof ApiError && [403, 404].includes(error.code))
    message = 'Không tìm thấy đơn/giao dịch hoặc bạn không có quyền xem.';
  else if (error) message = 'Không thể tải thông tin thanh toán. Vui lòng thử lại.';

  if (message)
    return (
      <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center px-4 py-12">
        <Card
          className="mx-auto max-w-xl rounded-3xl bg-white/95 p-6 sm:p-8 space-y-4"
          role="alert"
        >
          <h1 className="text-xl font-bold">Chưa thể mở thanh toán</h1>
          <p className="text-sm text-stone-600">{message}</p>
          <div className="flex flex-wrap gap-3">
            {!accessToken && validIds && (
              <Button asChild>
              <Link to="/login" state={{ from: { pathname: location.pathname + location.search } }}>
                  Đăng nhập
                </Link>
              </Button>
            )}
            {!!error && (
              <Button
                variant="outline"
                onClick={() => {
                  if (orderQuery.error) void orderQuery.refetch();
                  else void paymentQuery.refetch();
                }}
              >
                Thử lại
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/menu">Về thực đơn</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  if (!payment || !order || successful)
    return (
      <LoadingScreen
        message={
          successful
            ? 'Thanh toán thành công, đang chuyển trang...'
            : 'Đang tải thông tin thanh toán...'
        }
      />
    );

  return (
    <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center bg-fixed px-4 py-10">
      <Card className="mx-auto max-w-xl rounded-3xl bg-white/95 backdrop-blur-md p-6 sm:p-8 space-y-6 text-center">
        <div className="flex flex-wrap justify-between gap-3 border-b pb-4 text-left">
          <div>
            <p className="text-xs text-stone-500">Mã đơn hàng</p>
            <p className="font-bold break-all">{order.maDonHang}</p>
          </div>
          <Badge variant="secondary">
            {cancelled
              ? 'Đơn hàng đã hủy'
              : pending
                ? 'Chờ thanh toán'
                : payment.trangThai === 'THAT_BAI'
                  ? 'Thanh toán thất bại'
                  : 'Giao dịch chưa hoàn tất'}
          </Badge>
        </div>
        <h1 className="text-xl font-bold flex justify-center items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          {METHODS[payment.phuongThucThanhToan] || 'Thanh toán'}
        </h1>
        <p className="text-3xl font-bold text-primary">{formatCurrency(Number(payment.soTien))}</p>
        {pending ? (
          payment.phuongThucThanhToan === 'CHUYEN_KHOAN_QR' ? (
            qr ? (
              <div className="space-y-4">
                {imageFailed ? (
                  <p role="alert" className="text-sm text-destructive">
                    Không tải được ảnh QR. Vui lòng kiểm tra mạng và tải lại trang.
                  </p>
                ) : (
                  <img
                    src={qr.imageUrl}
                    alt="Mã VietQR chuyển khoản cho đơn hàng"
                    referrerPolicy="no-referrer"
                    onError={() => setImageFailed(true)}
                    className="mx-auto w-full max-w-72 rounded-2xl border bg-white p-2"
                  />
                )}
                <div className="rounded-2xl border bg-stone-50 p-4 text-left text-sm space-y-3 break-words">
                  <p>
                    Ngân hàng: <strong>{qr.bank}</strong>
                  </p>
                  {!!qr.accountName && (
                    <p>
                      Chủ tài khoản: <strong>{qr.accountName}</strong>
                    </p>
                  )}
                  <div className="flex justify-between items-center gap-2">
                    <p>
                      Số tài khoản: <strong className="break-all">{qr.account}</strong>
                    </p>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Sao chép số tài khoản"
                      onClick={() => void copy(qr.account)}
                    >
                      <Copy />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p>
                      Nội dung: <strong className="break-all">{qr.content}</strong>
                    </p>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Sao chép nội dung chuyển khoản"
                      onClick={() => void copy(qr.content)}
                    >
                      <Copy />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-stone-500">
                  Chuyển đúng số tiền và nội dung trên mã QR. Trạng thái được cập nhật khi hệ thống
                  xác nhận giao dịch.
                </p>
              </div>
            ) : (
              <p role="alert" className="text-sm text-stone-600">
                Chưa có mã QR hợp lệ cho giao dịch này. Vui lòng liên hệ nhân viên để kiểm tra;
                không cần tạo lại đơn.
              </p>
            )
          ) : payment.phuongThucThanhToan === 'MOMO' || payment.phuongThucThanhToan === 'VNPAY' ? (
            <div className="space-y-3">
              <p className="text-sm text-stone-600">
                Tiếp tục tại cổng thanh toán, sau đó quay lại đây để kiểm tra kết quả.
              </p>
              {gatewayUrl ? (
                <Button asChild className="w-full">
                  <a href={gatewayUrl}>Tiếp tục với {METHODS[payment.phuongThucThanhToan]}</a>
                </Button>
              ) : (
                <p role="alert" className="text-sm text-stone-600">
                  Chưa có đường dẫn thanh toán. Vui lòng liên hệ nhân viên để kiểm tra giao dịch.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm">Vui lòng thanh toán tiền mặt tại quầy.</p>
          )
        ) : (
          <p role="alert" className="text-sm text-destructive">
            Giao dịch chưa thành công. Vui lòng liên hệ nhân viên trước khi thực hiện thanh toán
            khác.
          </p>
        )}
        <div className="space-y-3">
          <Button
            className="w-full rounded-xl h-12 whitespace-normal"
            onClick={() => void verify()}
            isLoading={paymentQuery.isFetching}
            disabled={simulate.isPending}
          >
            <CheckCircle2 />
            {pending ? 'Tôi đã thanh toán xong' : 'Kiểm tra lại trạng thái'}
          </Button>
          {import.meta.env.DEV && pending && payment.phuongThucThanhToan !== 'TIEN_MAT' && (
            <Button
              variant="outline"
              className="w-full h-auto min-h-11 whitespace-normal rounded-xl"
              onClick={() => simulate.mutate()}
              isLoading={simulate.isPending}
              disabled={paymentQuery.isFetching}
            >
              ⚡ Mô phỏng thanh toán thành công (Dev Test)
            </Button>
          )}
          <Button asChild variant="ghost" className="w-full">
            <Link to="/menu">Về thực đơn</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
