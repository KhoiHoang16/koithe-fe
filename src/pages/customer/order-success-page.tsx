import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

export function OrderSuccessPage() {
  const { orderId } = useParams();

  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="h-14 w-14 text-green-600" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công! 🎉</h1>
      <p className="text-muted-foreground mb-6">
        Đơn hàng #{orderId} đã được xác nhận. Chúng tôi sẽ xử lý sớm nhất có thể.
      </p>

      <Card className="mb-6 text-left">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mã đơn hàng</span>
            <span className="font-mono font-medium">#{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Trạng thái</span>
            <span className="text-green-600 font-medium">Đã xác nhận</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Button asChild className="w-full">
          <Link to={`/orders/${orderId}`}>
            <Package className="mr-2 h-4 w-4" />
            Theo dõi đơn hàng
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link to="/menu">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    </div>
  );
}
