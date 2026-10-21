import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';
import { orderApi } from '@/features/orders/api/order-api';

export function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();

  // Gọi API verify (KHÔNG tin query params - check HMAC ở backend)
  const { data, isLoading, error } = useQuery({
    queryKey: ['payment', 'verify', orderId],
    queryFn: () => orderApi.verifyPayment(orderId ?? ''),
    enabled: !!orderId,
    retry: 1,
  });

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        toast.error('Không thể xác thực thanh toán');
        navigate(`/checkout/payment?orderId=${orderId}`, { replace: true });
        return;
      }

      if (data) {
        const payment = data as unknown as { trangThai: string };
        if (payment.trangThai === 'THANH_CONG') {
          navigate(`/order-success/${orderId}`, { replace: true });
        } else {
          toast.error('Thanh toán thất bại, vui lòng thử lại');
          navigate(`/checkout/payment?orderId=${orderId}`, { replace: true });
        }
      }
    }
  }, [data, isLoading, error, navigate, orderId]);

  return <LoadingScreen message="Đang xác thực thanh toán..." />;
}
