import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

export function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<null | { found: boolean }>(null);

  const handleSearch = () => {
    // TODO: Gọi API /orders/track
    setResult({ found: true });
  };

  return (
    <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center bg-fixed py-12 sm:py-16 animate-fade-in flex flex-col justify-center">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📦</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">Theo dõi đơn hàng</h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            Nhập mã đơn hàng và số điện thoại để kiểm tra trạng thái
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="track-order-id" className="text-xs font-semibold text-stone-700">Mã đơn hàng</Label>
              <Input
                id="track-order-id"
                placeholder="VD: DH001234"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="h-11 rounded-xl border-stone-200 bg-stone-50/50 text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="track-phone" className="text-xs font-semibold text-stone-700">Số điện thoại</Label>
              <Input
                id="track-phone"
                type="tel"
                placeholder="0xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl border-stone-200 bg-stone-50/50 text-xs sm:text-sm"
              />
            </div>
            <Button
              className="w-full h-11 font-bold text-sm rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer mt-2"
              onClick={handleSearch}
              disabled={!orderId || !phone}
            >
              <Search className="mr-2 h-4 w-4" />
              Kiểm tra đơn hàng
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="mt-6 animate-fade-in bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-5 border-b border-stone-100 pb-3">
                <span className="font-mono font-bold text-stone-900 text-base">#DH{orderId}</span>
                <Badge className="bg-amber-100 text-amber-800 border-none font-semibold text-xs px-2.5 py-0.5 rounded-full">
                  Đang chuẩn bị
                </Badge>
              </div>
              <div className="space-y-3.5">
                {[
                  { label: 'Đặt hàng thành công', done: true },
                  { label: 'Barista xác nhận đơn', done: true },
                  { label: 'Đang pha chế búp trà tươi', done: false },
                  { label: 'Shipper đang giao tới bạn', done: false },
                  { label: 'Giao hàng hoàn tất', done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                        step.done
                          ? 'bg-primary border-primary'
                          : 'bg-white border-stone-300'
                      }`}
                    />
                    <span
                      className={`text-xs sm:text-sm ${
                        step.done ? 'text-stone-900 font-semibold' : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
