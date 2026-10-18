import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Package, ShoppingBag } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { CheckoutStepper } from '@/components/common/checkout-stepper';

export function OrderSuccessPage() {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center bg-fixed pb-24 animate-fade-in flex flex-col justify-between">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <CheckoutStepper currentStep={3} />

        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-8 sm:p-12 text-center mt-6 shadow-sm max-w-xl mx-auto">
          <div className="flex justify-center mb-5">
            <div className="h-20 w-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 stroke-[2.5]" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
            Đặt hàng thành công! 🎉
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed mb-6">
            Đơn hàng <strong className="text-stone-900 font-bold">#{orderId}</strong> của bạn đã được chuyển tới Barista KOI Thé để bắt đầu pha chế búp trà tươi hảo hạng.
          </p>

          <div className="bg-stone-50 rounded-2xl border border-stone-200/80 p-4 mb-6 text-left space-y-2.5">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-stone-500">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-stone-900">#{orderId}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-stone-500">Trạng thái:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                ● Đã tiếp nhận đơn
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-stone-500">Thời gian dự kiến:</span>
              <span className="font-semibold text-stone-900">25 - 35 phút</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 h-12 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xs"
            >
              <Link to={`/orders/${orderId}`}>
                <Package className="mr-2 h-4 w-4" /> Theo dõi đơn hàng
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="flex-1 h-12 font-bold text-sm border-stone-200 text-stone-700 hover:bg-stone-100 rounded-2xl"
            >
              <Link to="/menu">
                <ShoppingBag className="mr-2 h-4 w-4" /> Tiếp tục mua sắm
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
